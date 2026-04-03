import type { Customer, Order, OrderItem, OrderStatus } from "@/types";
import { createHash } from "node:crypto";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { OrderIntakeInput, OrderIntakeItemInput } from "@/lib/validation";
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

interface ProductSnapshotRow {
  id: string;
  name: string | null;
  price: number | string | null;
  currency: string | null;
  status: string | null;
  stock_qty: number | string | null;
}

interface AuthoritativeOrderComputation {
  items: AtomicOrderItemPayload[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}

interface OrderWithCustomerRow extends Order {
  customers: Customer | Customer[] | null;
}

interface OrderStatusHistoryRow {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  changed_at: string;
  created_at: string;
}

interface OrderItemCountRow {
  order_id: string;
  quantity: number;
}

interface OrderStatusUpdateRpcRow {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  payment_status: Order["payment_status"];
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: Order["currency"];
  delivery_address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

export class OrderTemporaryFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderTemporaryFailureError";
  }
}

export class OrderNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderNotFoundError";
  }
}

export class OrderStatusTransitionError extends Error {
  currentStatus: OrderStatus;
  requestedStatus: OrderStatus;

  constructor(currentStatus: OrderStatus, requestedStatus: OrderStatus) {
    super(`Cannot change order status from ${currentStatus} to ${requestedStatus}.`);
    this.name = "OrderStatusTransitionError";
    this.currentStatus = currentStatus;
    this.requestedStatus = requestedStatus;
  }
}

export class OrderStatusConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderStatusConflictError";
  }
}

export type OrderCreateResultCode = "CREATED" | "REPLAYED";

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

function clampPage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value as number));
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(1, Math.min(100, Math.floor(value as number)));
}

function normalizeRequestedItems(items: OrderIntakeItemInput[]): Array<{ product_id: string; quantity: number }> {
  const quantityByProduct = new Map<string, number>();
  items.forEach((item) => {
    const current = quantityByProduct.get(item.product_id) || 0;
    quantityByProduct.set(item.product_id, current + item.quantity);
  });

  return Array.from(quantityByProduct.entries())
    .map(([product_id, quantity]) => ({ product_id, quantity }))
    .sort((a, b) => a.product_id.localeCompare(b.product_id));
}

function normalizePayloadForHash(payload: OrderIntakeInput) {
  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    fulfillmentType: payload.fulfillmentType,
    deliveryAddress: payload.fulfillmentType === "delivery" ? (payload.deliveryAddress || "").trim() : undefined,
    pickupLocation: payload.fulfillmentType === "pickup" ? (payload.pickupLocation || "").trim() : undefined,
    paymentMethod: payload.paymentMethod,
    notes: (payload.notes || "").trim(),
    items: normalizeRequestedItems(payload.items)
  };
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

function computeAuthoritativeOrder(payload: OrderIntakeInput, products: ProductSnapshotRow[]): AuthoritativeOrderComputation {
  const requestedItems = normalizeRequestedItems(payload.items);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const missingProductIds = requestedItems
    .map((item) => item.product_id)
    .filter((productId) => !productsById.has(productId));

  if (missingProductIds.length > 0) {
    throw new OrderIntakeRejectedError(
      "Some products in your cart are no longer available.",
      { items: ["One or more products could not be found."] }
    );
  }

  const authoritativeItems: AtomicOrderItemPayload[] = [];
  let subtotal = 0;

  for (const item of requestedItems) {
    const product = productsById.get(item.product_id);
    if (!product) continue;

    if (product.status !== "ACTIVE") {
      throw new OrderIntakeRejectedError(
        "Some products in your cart are not currently available for checkout.",
        { items: ["One or more products are inactive."] }
      );
    }

    const stockQty = Number(product.stock_qty);
    if (!Number.isFinite(stockQty) || stockQty <= 0 || item.quantity > stockQty) {
      throw new OrderIntakeRejectedError(
        "Some products in your cart do not have enough stock.",
        { items: ["Requested quantity exceeds available stock."] }
      );
    }

    const unitPrice = toInt(Number(product.price));
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid product price for ${product.id}`);
    }

    const currency = String(product.currency || STORE_CURRENCY).trim().toUpperCase() || STORE_CURRENCY;
    if (currency !== STORE_CURRENCY) {
      throw new OrderIntakeRejectedError(
        "Some products are not purchasable in the current store currency.",
        { items: ["Product currency mismatch."] }
      );
    }

    const productName = (product.name || "").trim() || product.id;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    authoritativeItems.push({
      product_id: product.id,
      product_name_snapshot: productName,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: lineTotal,
      currency
    });
  }

  const deliveryFee = payload.fulfillmentType === "pickup" ? 0 : DELIVERY_FEE_AMOUNT;
  const total = subtotal + deliveryFee;

  return {
    items: authoritativeItems,
    subtotal,
    deliveryFee,
    total,
    currency: STORE_CURRENCY
  };
}

function extractCustomer(value: Customer | Customer[] | null): AdminOrderCustomer | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value;
}

function normalizeOrderStatusUpdateRpcRow(data: unknown): Order {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    throw new Error("Invalid order status update response payload.");
  }

  const parsed = row as OrderStatusUpdateRpcRow;
  return {
    id: String(parsed.id),
    order_number: String(parsed.order_number),
    customer_id: String(parsed.customer_id),
    status: parsed.status,
    payment_status: parsed.payment_status,
    subtotal: toInt(parsed.subtotal),
    delivery_fee: toInt(parsed.delivery_fee),
    total: toInt(parsed.total),
    currency: parsed.currency,
    delivery_address: String(parsed.delivery_address),
    notes: parsed.notes ?? null,
    created_at: String(parsed.created_at),
    updated_at: String(parsed.updated_at)
  };
}

function sanitizeOptionalText(value: string | null | undefined, maxLength: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLength);
}

function assertStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (currentStatus === nextStatus) return;
  if (ORDER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)) return;
  throw new OrderStatusTransitionError(currentStatus, nextStatus);
}

export async function listOrders(): Promise<Order[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return (data as Order | null) || null;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export function hashOrderIntakePayload(payload: OrderIntakeInput): string {
  return createHash("sha256").update(stableSerialize(normalizePayloadForHash(payload))).digest("hex");
}

async function executeAtomicOrderWrite(
  payload: OrderIntakeInput,
  idempotencyKey: string,
  requestHash: string
): Promise<{ result: CreateOrderIntakeResult; resultCode: OrderCreateResultCode }> {
  const supabase = createServiceRoleSupabaseClient();
  const normalizedDeliveryAddress = normalizeDeliveryAddress(payload);
  const productIds = normalizeRequestedItems(payload.items).map((item) => item.product_id);
  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, currency, status, stock_qty")
    .in("id", productIds);

  if (productsError) throw productsError;

  const computed = computeAuthoritativeOrder(payload, (productRows || []) as ProductSnapshotRow[]);

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

  const { data, error } = await supabase.rpc("process_order_intake_atomic_v2", {
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
      resultCode: "CREATED"
    };
  }

  if (decision.kind === "replayed") {
    return {
      result: mapAtomicResult(decision.result),
      resultCode: "REPLAYED"
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

  if (decision.kind === "temporary_failure") {
    throw new OrderTemporaryFailureError(decision.message);
  }

  throw new Error("Unexpected order processing outcome.");
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
  requestHash: string = hashOrderIntakePayload(payload)
): Promise<{ result: CreateOrderIntakeResult; resultCode: OrderCreateResultCode }> {
  return executeAtomicOrderWrite(payload, idempotencyKey, requestHash);
}
