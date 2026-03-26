import type { Order, OrderStatus } from "@/types";
import { createHash } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OrderIntakeInput } from "@/lib/validation";
import {
  computeAuthoritativeOrder,
  CommerceIntegrityError,
  type CommerceProductSnapshot
} from "@/lib/commerce-integrity";
import {
  parseAtomicOrderWriteRpcRow,
  InvalidAtomicOrderWriteResponseError,
  type AtomicOrderWriteResultPayload,
  type AtomicOrderWriteRpcRow
} from "@/lib/order-write-result";
import { STORE_CURRENCY } from "@/lib/utils";
import { upsertCustomerByEmail } from "@/services/customers";

const DELIVERY_FEE_AMOUNT = 5000;

interface AtomicOrderItemPayload {
  product_id: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  currency: string;
}

export interface CreateOrderIntakeResult extends AtomicOrderWriteResultPayload {}

export class OrderIntakeRejectedError extends Error {
  fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "OrderIntakeRejectedError";
    this.fieldErrors = fieldErrors;
  }
}

export class OrderIdempotencyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderIdempotencyConflictError";
  }
}

export class OrderIdempotencyInProgressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderIdempotencyInProgressError";
  }
}

function stableSerialize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableSerialize(nestedValue)}`).join(",")}}`;
}

function toInt(value: number | string): number {
  return Math.round(Number(value));
}

function normalizeDeliveryAddress(payload: OrderIntakeInput): string {
  if (payload.fulfillmentType === "pickup") {
    return `Pickup: ${(payload.pickupLocation || "Main Store").trim()}`;
  }

  return (payload.deliveryAddress || "").trim();
}

function buildOrderNotes(payload: OrderIntakeInput): string {
  const notesParts: string[] = [];

  if (payload.notes?.trim()) {
    notesParts.push(payload.notes.trim());
  }

  notesParts.push(`Fulfillment: ${payload.fulfillmentType === "pickup" ? "PICKUP" : "DELIVERY"}`);
  notesParts.push("Payment: PAY_ON_DELIVERY");

  if (payload.fulfillmentType === "pickup" && payload.pickupLocation?.trim()) {
    notesParts.push(`Pickup location: ${payload.pickupLocation.trim()}`);
  }

  return notesParts.join(" | ");
}

function normalizeRpcRow(data: unknown): AtomicOrderWriteRpcRow {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new InvalidAtomicOrderWriteResponseError("Atomic order RPC returned an empty result.");
    }

    return data[0] as AtomicOrderWriteRpcRow;
  }

  if (!data || typeof data !== "object") {
    throw new InvalidAtomicOrderWriteResponseError("Atomic order RPC returned an invalid payload.");
  }

  return data as AtomicOrderWriteRpcRow;
}

function mapAtomicResult(payload: AtomicOrderWriteResultPayload): CreateOrderIntakeResult {
  return {
    orderId: payload.orderId,
    orderNumber: payload.orderNumber,
    receivedAt: payload.receivedAt,
    subtotal: toInt(payload.subtotal),
    deliveryFee: toInt(payload.deliveryFee),
    total: toInt(payload.total),
    currency: String(payload.currency || STORE_CURRENCY)
  };
}

export async function listOrders(): Promise<Order[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();

  if (error) return null;
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export function hashOrderIntakePayload(payload: OrderIntakeInput): string {
  return createHash("sha256").update(stableSerialize(payload)).digest("hex");
}

async function executeAtomicOrderWrite(
  payload: OrderIntakeInput,
  idempotencyKey: string,
  requestHash: string
): Promise<{ result: CreateOrderIntakeResult; replayed: boolean }> {
  const supabase = await createServerSupabaseClient();
  const normalizedDeliveryAddress = normalizeDeliveryAddress(payload);

  const requestedQuantities = new Map<string, number>();
  payload.items.forEach((item) => {
    const current = requestedQuantities.get(item.product_id) || 0;
    requestedQuantities.set(item.product_id, current + item.quantity);
  });

  const productIds = Array.from(requestedQuantities.keys());
  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, currency, status, stock_qty")
    .in("id", productIds);

  if (productsError) throw productsError;

  let computed;
  try {
    computed = computeAuthoritativeOrder(payload, (productRows || []) as CommerceProductSnapshot[], {
      deliveryFeeAmount: DELIVERY_FEE_AMOUNT,
      storeCurrency: STORE_CURRENCY
    });
  } catch (error) {
    if (error instanceof CommerceIntegrityError) {
      throw new OrderIntakeRejectedError(error.message, error.fieldErrors);
    }
    throw error;
  }

  const customer = await upsertCustomerByEmail({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone
  });

  const orderItemsPayload: AtomicOrderItemPayload[] = computed.items.map((item) => ({
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    unit_price: item.unit_price,
    quantity: item.quantity,
    line_total: item.line_total,
    currency: item.currency
  }));

  const { data, error } = await supabase.rpc("process_order_intake_atomic", {
    p_idempotency_key: idempotencyKey,
    p_request_hash: requestHash,
    p_customer_id: customer.id,
    p_delivery_address: normalizedDeliveryAddress,
    p_notes: buildOrderNotes(payload),
    p_subtotal: computed.subtotal,
    p_delivery_fee: computed.deliveryFee,
    p_total: computed.total,
    p_currency: computed.currency,
    p_items: orderItemsPayload
  });

  if (error) throw error;

  const decision = parseAtomicOrderWriteRpcRow(normalizeRpcRow(data));

  if (decision.kind === "created") {
    return {
      result: mapAtomicResult(decision.result),
      replayed: false
    };
  }

  if (decision.kind === "replayed") {
    return {
      result: mapAtomicResult(decision.result),
      replayed: true
    };
  }

  if (decision.kind === "rejected") {
    throw new OrderIntakeRejectedError(decision.message, decision.fieldErrors);
  }

  if (decision.kind === "conflict") {
    throw new OrderIdempotencyConflictError(decision.message);
  }

  if (decision.kind === "in_progress") {
    throw new OrderIdempotencyInProgressError(decision.message);
  }

  throw new Error(decision.message);
}

export async function createOrderIntake(
  payload: OrderIntakeInput,
  idempotencyKey: string,
  requestHash: string = hashOrderIntakePayload(payload)
): Promise<CreateOrderIntakeResult> {
  const { result } = await executeAtomicOrderWrite(payload, idempotencyKey, requestHash);
  return result;
}

export async function createOrderIntakeWithIdempotency(
  payload: OrderIntakeInput,
  idempotencyKey: string,
  requestHash: string
): Promise<{ result: CreateOrderIntakeResult; replayed: boolean }> {
  return executeAtomicOrderWrite(payload, idempotencyKey, requestHash);
}
