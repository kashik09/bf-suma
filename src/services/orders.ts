import type { Order, OrderStatus } from "@/types";
import { createHash } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OrderIntakeInput } from "@/lib/validation";
import { upsertCustomerByEmail } from "@/services/customers";

const DELIVERY_FEE_AMOUNT = 5000;
const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

type IdempotencyStatus = "IN_PROGRESS" | "SUCCEEDED" | "FAILED";

interface ProductPricingRow {
  id: string;
  name: string;
  price: number | string | null;
  status: string | null;
  stock_qty: number | string | null;
}

interface IdempotencyRow {
  idempotency_key: string;
  request_hash: string;
  order_id: string | null;
  status: IdempotencyStatus;
  response_payload: CreateOrderIntakeResult | null;
  last_error: string | null;
  expires_at: string;
}

interface ServerOrderItem {
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface CreateOrderIntakeResult {
  orderId: string;
  orderNumber: string;
  receivedAt: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
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

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
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
    total
  } = payload as Record<string, unknown>;

  if (
    typeof orderId !== "string" ||
    typeof orderNumber !== "string" ||
    typeof receivedAt !== "string" ||
    typeof subtotal !== "number" ||
    typeof deliveryFee !== "number" ||
    typeof total !== "number"
  ) {
    return null;
  }

  return {
    orderId,
    orderNumber,
    receivedAt,
    subtotal,
    deliveryFee,
    total
  };
}

function normalizeAmount(value: number): number {
  return Math.round(value);
}

function resolveDeliveryFee(isPickup: boolean): number {
  return isPickup ? 0 : DELIVERY_FEE_AMOUNT;
}

function generateOrderNumber(): string {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BFS-${timestamp}-${random}`;
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

  const expired = isExpired(row.expires_at);
  if (!expired && row.request_hash !== requestHash) {
    throw new OrderIdempotencyConflictError(
      "This idempotency key was already used with a different checkout payload."
    );
  }

  if (!expired && row.status === "SUCCEEDED") {
    const replayResult = normalizeIdempotencyResponse(row.response_payload);
    if (replayResult) {
      return replayResult;
    }
  }

  if (!expired && row.status === "IN_PROGRESS") {
    throw new OrderIdempotencyInProgressError(
      "This checkout request is already being processed. Please retry in a moment."
    );
  }

  await setIdempotencyInProgress(idempotencyKey, requestHash);
  return null;
}

export async function createOrderIntake(payload: OrderIntakeInput): Promise<CreateOrderIntakeResult> {
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
    .select("id, name, price, status, stock_qty")
    .in("id", productIds);

  if (productsError) throw productsError;

  const productsById = new Map(
    ((productRows || []) as ProductPricingRow[]).map((product) => [product.id, product])
  );

  const missingProductIds = productIds.filter((productId) => !productsById.has(productId));
  if (missingProductIds.length > 0) {
    throw new OrderIntakeRejectedError(
      "Some products in your cart are no longer available.",
      { items: ["One or more products could not be found."] }
    );
  }

  const tamperedPriceItems = payload.items.filter((item) => {
    const product = productsById.get(item.product_id);
    if (!product) return false;

    const authoritativePrice = normalizeAmount(Number(product.price));
    return !Number.isFinite(authoritativePrice) || normalizeAmount(item.price) !== authoritativePrice;
  });

  if (tamperedPriceItems.length > 0) {
    throw new OrderIntakeRejectedError(
      "One or more item prices changed. Please review your cart and try again.",
      { items: ["Submitted item pricing does not match current catalog pricing."] }
    );
  }

  const computedOrderItemsByProductId = new Map<string, Omit<ServerOrderItem, "order_id">>();
  let computedSubtotal = 0;

  for (const [productId, quantity] of requestedQuantities.entries()) {
    const product = productsById.get(productId);
    if (!product) continue;

    if (product.status !== "ACTIVE") {
      throw new OrderIntakeRejectedError(
        "Some products in your cart are not currently available for checkout.",
        { items: ["One or more products are inactive."] }
      );
    }

    const stockQty = Number(product.stock_qty);
    if (!Number.isFinite(stockQty) || stockQty <= 0 || quantity > stockQty) {
      throw new OrderIntakeRejectedError(
        "Some products in your cart do not have enough stock.",
        { items: ["Requested quantity exceeds available stock."] }
      );
    }

    const unitPrice = normalizeAmount(Number(product.price));
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid product price for ${productId}`);
    }

    const lineTotal = unitPrice * quantity;
    computedSubtotal += lineTotal;

    computedOrderItemsByProductId.set(productId, {
      product_id: productId,
      product_name_snapshot: product.name,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal
    });
  }

  const computedDeliveryFee = resolveDeliveryFee(isPickup);
  const computedTotal = computedSubtotal + computedDeliveryFee;

  if (
    normalizeAmount(payload.subtotal) !== computedSubtotal ||
    normalizeAmount(payload.deliveryFee) !== computedDeliveryFee ||
    normalizeAmount(payload.total) !== computedTotal
  ) {
    throw new OrderIntakeRejectedError(
      "Order totals do not match current pricing. Please refresh your cart and try again.",
      { total: ["Submitted totals do not match current server pricing."] }
    );
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
      subtotal: computedSubtotal,
      delivery_fee: computedDeliveryFee,
      total: computedTotal,
      delivery_address: normalizedDeliveryAddress,
      notes: notesParts.join(" | ")
    })
    .select("id, order_number, created_at")
    .single();

  if (orderError || !order) throw orderError || new Error("Failed to create order record");

  const orderItems = Array.from(computedOrderItemsByProductId.values()).map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    unit_price: item.unit_price,
    quantity: item.quantity,
    line_total: item.line_total
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
    subtotal: computedSubtotal,
    deliveryFee: computedDeliveryFee,
    total: computedTotal
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

  try {
    const result = await createOrderIntake(payload);
    await markIdempotencySuccess(idempotencyKey, requestHash, result);
    return { result, replayed: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown order processing error";
    await markIdempotencyFailed(idempotencyKey, requestHash, errorMessage).catch(() => undefined);
    throw error;
  }
}
