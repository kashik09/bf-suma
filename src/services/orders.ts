import type { Order, OrderStatus } from "@/types";
import { createHash } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OrderIntakeInput } from "@/lib/validation";
import {
  computeAuthoritativeOrder,
  CommerceIntegrityError,
  type CommerceProductSnapshot
} from "@/lib/commerce-integrity";
import { evaluateIdempotencyDecision, type IdempotencyStatus } from "@/lib/idempotency-decision";
import { STORE_CURRENCY } from "@/lib/utils";
import { upsertCustomerByEmail } from "@/services/customers";

const DELIVERY_FEE_AMOUNT = 5000;
const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

interface IdempotencyRow {
  idempotency_key: string;
  request_hash: string;
  order_id: string | null;
  status: IdempotencyStatus;
  response_payload: CreateOrderIntakeResult | null;
  last_error: string | null;
  expires_at: string;
}

interface OrderRowSummary {
  id: string;
  order_number: string;
  created_at: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
}

export interface CreateOrderIntakeResult {
  orderId: string;
  orderNumber: string;
  receivedAt: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}

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

function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeCode = (error as { code?: unknown }).code;
  return maybeCode === "23505";
}

function isOrdersIdempotencyUniqueError(error: unknown): boolean {
  if (!isDuplicateKeyError(error) || !error || typeof error !== "object") return false;

  const details = String((error as { details?: unknown }).details || "").toLowerCase();
  const hint = String((error as { hint?: unknown }).hint || "").toLowerCase();
  const message = String((error as { message?: unknown }).message || "").toLowerCase();

  return (
    details.includes("idempotency_key") ||
    hint.includes("idempotency_key") ||
    message.includes("idempotency_key")
  );
}

function nextExpiryTimestamp(): string {
  return new Date(Date.now() + IDEMPOTENCY_WINDOW_MS).toISOString();
}

function normalizeIdempotencyResponse(payload: unknown): CreateOrderIntakeResult | null {
  if (!payload || typeof payload !== "object") return null;

  const {
    orderId,
    orderNumber,
    receivedAt,
    subtotal,
    deliveryFee,
    total,
    currency
  } = payload as Record<string, unknown>;

  if (
    typeof orderId !== "string" ||
    typeof orderNumber !== "string" ||
    typeof receivedAt !== "string" ||
    typeof subtotal !== "number" ||
    typeof deliveryFee !== "number" ||
    typeof total !== "number" ||
    typeof currency !== "string"
  ) {
    return null;
  }

  return {
    orderId,
    orderNumber,
    receivedAt,
    subtotal,
    deliveryFee,
    total,
    currency
  };
}

function generateOrderNumber(): string {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BFS-${timestamp}-${random}`;
}

function toInt(value: number | string): number {
  return Math.round(Number(value));
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

async function getIdempotencyRow(idempotencyKey: string): Promise<IdempotencyRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("order_idempotency_keys")
    .select("idempotency_key, request_hash, order_id, status, response_payload, last_error, expires_at")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) throw error;
  return (data as IdempotencyRow | null) || null;
}

async function initializeIdempotencyRow(idempotencyKey: string, requestHash: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("order_idempotency_keys").insert({
    idempotency_key: idempotencyKey,
    request_hash: requestHash,
    status: "IN_PROGRESS",
    expires_at: nextExpiryTimestamp(),
    created_at: now,
    updated_at: now
  });

  if (error) throw error;
}

async function setIdempotencyInProgress(idempotencyKey: string, requestHash: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("order_idempotency_keys")
    .update({
      request_hash: requestHash,
      status: "IN_PROGRESS",
      order_id: null,
      response_payload: null,
      last_error: null,
      expires_at: nextExpiryTimestamp(),
      updated_at: new Date().toISOString()
    })
    .eq("idempotency_key", idempotencyKey);

  if (error) throw error;
}

async function markIdempotencySuccess(
  idempotencyKey: string,
  requestHash: string,
  result: CreateOrderIntakeResult
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("order_idempotency_keys")
    .update({
      status: "SUCCEEDED",
      order_id: result.orderId,
      response_payload: result,
      last_error: null,
      updated_at: new Date().toISOString()
    })
    .eq("idempotency_key", idempotencyKey)
    .eq("request_hash", requestHash);

  if (error) throw error;
}

async function markIdempotencyFailed(idempotencyKey: string, requestHash: string, errorMessage: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("order_idempotency_keys")
    .update({
      status: "FAILED",
      last_error: errorMessage.slice(0, 500),
      updated_at: new Date().toISOString()
    })
    .eq("idempotency_key", idempotencyKey)
    .eq("request_hash", requestHash);

  if (error) throw error;
}

async function beginOrderIntakeIdempotency(
  idempotencyKey: string,
  requestHash: string
): Promise<CreateOrderIntakeResult | null> {
  let row = await getIdempotencyRow(idempotencyKey);

  if (!row) {
    try {
      await initializeIdempotencyRow(idempotencyKey, requestHash);
      return null;
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      row = await getIdempotencyRow(idempotencyKey);
    }
  }

  if (!row) {
    throw new Error("Failed to initialize idempotency record.");
  }

  const decision = evaluateIdempotencyDecision(row, requestHash);

  if (decision.kind === "conflict") {
    throw new OrderIdempotencyConflictError(
      "This idempotency key was already used with a different checkout payload."
    );
  }

  if (decision.kind === "replay") {
    const replayResult = normalizeIdempotencyResponse(row.response_payload);
    if (replayResult) return replayResult;

    throw new OrderIdempotencyInProgressError(
      "This checkout request is still finalizing. Please retry in a moment."
    );
  }

  if (decision.kind === "in_progress") {
    throw new OrderIdempotencyInProgressError(
      "This checkout request is already being processed. Please retry in a moment."
    );
  }

  await setIdempotencyInProgress(idempotencyKey, requestHash);
  return null;
}

async function findExistingOrderByIdempotencyKey(idempotencyKey: string): Promise<OrderRowSummary | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, created_at, subtotal, delivery_fee, total, currency")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) throw error;
  return (data as OrderRowSummary | null) || null;
}

export async function createOrderIntake(payload: OrderIntakeInput, idempotencyKey: string): Promise<CreateOrderIntakeResult> {
  const supabase = await createServerSupabaseClient();
  const isPickup = payload.fulfillmentType === "pickup";
  const normalizedDeliveryAddress = isPickup
    ? `Pickup: ${(payload.pickupLocation || "Main Store").trim()}`
    : (payload.deliveryAddress || "").trim();

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

  const notesParts: string[] = [];
  if (payload.notes?.trim()) {
    notesParts.push(payload.notes.trim());
  }
  notesParts.push(`Fulfillment: ${isPickup ? "PICKUP" : "DELIVERY"}`);
  notesParts.push("Payment: PAY_ON_DELIVERY");
  if (isPickup && payload.pickupLocation?.trim()) {
    notesParts.push(`Pickup location: ${payload.pickupLocation.trim()}`);
  }

  const customer = await upsertCustomerByEmail({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone
  });

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      status: "PENDING",
      payment_status: "UNPAID",
      subtotal: computed.subtotal,
      delivery_fee: computed.deliveryFee,
      total: computed.total,
      currency: computed.currency,
      idempotency_key: idempotencyKey,
      delivery_address: normalizedDeliveryAddress,
      notes: notesParts.join(" | ")
    })
    .select("id, order_number, created_at, subtotal, delivery_fee, total, currency")
    .single();

  if (orderError || !order) {
    if (isOrdersIdempotencyUniqueError(orderError)) {
      const existing = await findExistingOrderByIdempotencyKey(idempotencyKey);
      if (existing) {
        return {
          orderId: existing.id,
          orderNumber: existing.order_number,
          receivedAt: existing.created_at,
          subtotal: toInt(existing.subtotal),
          deliveryFee: toInt(existing.delivery_fee),
          total: toInt(existing.total),
          currency: String(existing.currency || STORE_CURRENCY)
        };
      }
    }

    throw orderError || new Error("Failed to create order record");
  }

  const orderItems = computed.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    unit_price: item.unit_price,
    quantity: item.quantity,
    line_total: item.line_total,
    currency: item.currency
  }));

  const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);

  if (orderItemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw orderItemsError;
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    receivedAt: order.created_at,
    subtotal: toInt(order.subtotal),
    deliveryFee: toInt(order.delivery_fee),
    total: toInt(order.total),
    currency: String(order.currency || STORE_CURRENCY)
  };
}

export async function createOrderIntakeWithIdempotency(
  payload: OrderIntakeInput,
  idempotencyKey: string,
  requestHash: string
): Promise<{ result: CreateOrderIntakeResult; replayed: boolean }> {
  const replayResult = await beginOrderIntakeIdempotency(idempotencyKey, requestHash);
  if (replayResult) {
    return { result: replayResult, replayed: true };
  }

  const result = await createOrderIntake(payload, idempotencyKey).catch(async (error) => {
    const errorMessage = error instanceof Error ? error.message : "Unknown order processing error";
    await markIdempotencyFailed(idempotencyKey, requestHash, errorMessage).catch(() => undefined);
    throw error;
  });

  try {
    await markIdempotencySuccess(idempotencyKey, requestHash, result);
  } catch {
    throw new OrderIdempotencyInProgressError(
      "Your order was accepted but confirmation is still finalizing. Retry with the same idempotency key."
    );
  }

  return { result, replayed: false };
}
