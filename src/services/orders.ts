import type { Customer, Order, OrderItem, OrderStatus } from "@/types";
import type { Json } from "@/types/database";
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

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PROCESSING", "CANCELED"],
  PROCESSING: ["OUT_FOR_DELIVERY", "CANCELED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELED"],
  DELIVERED: [],
  CANCELED: []
};

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

export interface AdminOrderCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export interface AdminOrderListItem {
  order: Order;
  customer: AdminOrderCustomer | null;
  totalUnits: number;
}

export interface AdminOrderListResult {
  orders: AdminOrderListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminOrderDetail {
  order: Order;
  customer: AdminOrderCustomer | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryRow[];
}

export interface AdminOrderListFilters {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
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

function normalizeRequestedItems(
  items: OrderIntakeItemInput[]
): Array<{ product_id: string; quantity: number; submittedPrice: number; priceMismatch: boolean }> {
  const itemByProduct = new Map<string, { quantity: number; submittedPrice: number; priceMismatch: boolean }>();

  items.forEach((item) => {
    const submittedPrice = toInt(Number(item.price));
    const current = itemByProduct.get(item.product_id);

    if (!current) {
      itemByProduct.set(item.product_id, {
        quantity: item.quantity,
        submittedPrice,
        priceMismatch: false
      });
      return;
    }

    const hasPriceMismatch = current.submittedPrice !== submittedPrice;
    itemByProduct.set(item.product_id, {
      quantity: current.quantity + item.quantity,
      submittedPrice: current.submittedPrice,
      priceMismatch: current.priceMismatch || hasPriceMismatch
    });
  });

  return Array.from(itemByProduct.entries())
    .map(([product_id, data]) => ({
      product_id,
      quantity: data.quantity,
      submittedPrice: data.submittedPrice,
      priceMismatch: data.priceMismatch
    }))
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
    items: normalizeRequestedItems(payload.items).map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      submittedPrice: item.submittedPrice
    })),
    subtotal: toInt(payload.subtotal),
    deliveryFee: toInt(payload.deliveryFee),
    total: toInt(payload.total)
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
  if (requestedItems.some((item) => item.priceMismatch)) {
    throw new OrderIntakeRejectedError(
      "One or more item prices changed. Please review your cart and try again.",
      { items: ["Submitted item pricing does not match current catalog pricing."] }
    );
  }

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

    if (!Number.isFinite(item.submittedPrice) || item.submittedPrice !== unitPrice) {
      throw new OrderIntakeRejectedError(
        "One or more item prices changed. Please review your cart and try again.",
        { items: ["Submitted item pricing does not match current catalog pricing."] }
      );
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

  if (
    toInt(payload.subtotal) !== subtotal ||
    toInt(payload.deliveryFee) !== deliveryFee ||
    toInt(payload.total) !== total
  ) {
    throw new OrderIntakeRejectedError(
      "Order totals do not match current pricing. Please refresh your cart and try again.",
      { total: ["Submitted totals do not match current server pricing."] }
    );
  }

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

function sanitizeOptionalText(value: string | null | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
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

export async function listOrdersForAdmin(filters: AdminOrderListFilters = {}): Promise<AdminOrderListResult> {
  const supabase = createServiceRoleSupabaseClient();
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;
  const search = filters.search?.trim();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, status, payment_status, subtotal, delivery_fee, total, currency, delivery_address, notes, created_at, updated_at, customers:customer_id(id, first_name, last_name, email, phone)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (search) {
    query = query.ilike("order_number", `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = (data || []) as OrderWithCustomerRow[];
  const orderIds = rows.map((row) => row.id);
  const quantityByOrderId = new Map<string, number>();

  if (orderIds.length > 0) {
    const { data: orderItemRows, error: orderItemError } = await supabase
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds);

    if (orderItemError) throw orderItemError;

    ((orderItemRows || []) as OrderItemCountRow[]).forEach((row) => {
      const current = quantityByOrderId.get(row.order_id) || 0;
      quantityByOrderId.set(row.order_id, current + toInt(row.quantity));
    });
  }

  return {
    orders: rows.map((row) => ({
      order: {
        id: row.id,
        order_number: row.order_number,
        customer_id: row.customer_id,
        status: row.status,
        payment_status: row.payment_status,
        subtotal: toInt(row.subtotal),
        delivery_fee: toInt(row.delivery_fee),
        total: toInt(row.total),
        currency: row.currency,
        delivery_address: row.delivery_address,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at
      },
      customer: extractCustomer(row.customers),
      totalUnits: quantityByOrderId.get(row.id) || 0
    })),
    totalCount: count || 0,
    page,
    pageSize
  };
}

export async function getOrderDetailForAdmin(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, status, payment_status, subtotal, delivery_fee, total, currency, delivery_address, notes, created_at, updated_at, customers:customer_id(id, first_name, last_name, email, phone)"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!orderRow) return null;

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, product_name_snapshot, unit_price, quantity, line_total, currency")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (orderItemsError) throw orderItemsError;

  const { data: statusHistory, error: statusHistoryError } = await supabase
    .from("order_status_history")
    .select("id, order_id, from_status, to_status, changed_by, note, changed_at, created_at")
    .eq("order_id", orderId)
    .order("changed_at", { ascending: false });

  const normalizedStatusHistory = (() => {
    if (!statusHistoryError) return statusHistory || [];
    if (statusHistoryError.code === "PGRST205") {
      // Safe fallback while schema cache catches up; order detail remains readable.
      return [];
    }
    throw statusHistoryError;
  })();

  const row = orderRow as OrderWithCustomerRow;
  return {
    order: {
      id: row.id,
      order_number: row.order_number,
      customer_id: row.customer_id,
      status: row.status,
      payment_status: row.payment_status,
      subtotal: toInt(row.subtotal),
      delivery_fee: toInt(row.delivery_fee),
      total: toInt(row.total),
      currency: row.currency,
      delivery_address: row.delivery_address,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    },
    customer: extractCustomer(row.customers),
    items: ((orderItems || []) as OrderItem[]).map((item) => ({
      ...item,
      unit_price: toInt(item.unit_price),
      quantity: toInt(item.quantity),
      line_total: toInt(item.line_total)
    })),
    statusHistory: (normalizedStatusHistory as OrderStatusHistoryRow[]).map((entry) => ({
      ...entry,
      changed_by: entry.changed_by || null,
      note: entry.note || null
    }))
  };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  options: { changedBy?: string | null; note?: string | null } = {}
): Promise<{ order: Order; changed: boolean }> {
  const supabase = createServiceRoleSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) {
    throw new OrderNotFoundError("Order not found.");
  }

  const currentOrder = existing as Order;
  const currentStatus = currentOrder.status;
  if (currentStatus === status) {
    return { order: currentOrder, changed: false };
  }

  assertStatusTransition(currentStatus, status);

  const { data: updated, error: updateError } = await supabase.rpc("update_order_status_with_history", {
    p_order_id: id,
    p_expected_status: currentStatus,
    p_new_status: status,
    p_changed_by: sanitizeOptionalText(options.changedBy, 120),
    p_note: sanitizeOptionalText(options.note, 500)
  });

  if (updateError) {
    if (updateError.message.includes("ORDER_NOT_FOUND")) {
      throw new OrderNotFoundError("Order not found.");
    }

    if (updateError.message.includes("ORDER_STATUS_CONFLICT")) {
      throw new OrderStatusConflictError("Order status changed before this update. Refresh and retry.");
    }

    if (updateError.code === "PGRST202" && updateError.message.includes("update_order_status_with_history")) {
      throw new Error("Order status update function is missing. Apply database migrations and reload schema cache.");
    }

    throw updateError;
  }

  return {
    order: normalizeOrderStatusUpdateRpcRow(updated),
    changed: true
  };
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
    p_items: orderItemsPayload as unknown as Json
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
