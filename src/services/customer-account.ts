import type { Customer, Order, OrderItem } from "@/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

interface CustomerOrderListItem {
  id: string;
  order_number: string;
  status: Order["status"];
  total: number;
  currency: Order["currency"];
  created_at: string;
  item_count: number;
}

interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  processing: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
}

interface CustomerDashboardSnapshot {
  customer: Customer;
  totalOrders: number;
  totalSpent: number;
  statusCounts: OrderStatusCounts;
  recentOrders: CustomerOrderListItem[];
}

interface CustomerOrderDetail {
  customer: Customer;
  order: Order;
  items: OrderItem[];
  itemCount: number;
}

interface OrderItemQuantityRow {
  quantity: number | string | null;
}

interface OrdersWithItemsRow extends Order {
  order_items: OrderItemQuantityRow[] | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toInt(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return 0;
  return Math.max(0, Math.round(normalized));
}

function countOrderItems(items: OrderItemQuantityRow[] | null | undefined): number {
  return (items || []).reduce((sum, item) => sum + toInt(item.quantity), 0);
}

async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Customer | null) ?? null;
}

async function listOrdersWithItemsByCustomerEmail(email: string): Promise<OrdersWithItemsRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, status, payment_status, subtotal, delivery_fee, total, currency, delivery_address, notes, created_at, updated_at, order_items(quantity), customers!inner(email)"
    )
    .eq("customers.email", normalizeEmail(email))
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data || []) as OrdersWithItemsRow[]).map((row) => ({
    ...row,
    order_items: row.order_items || []
  }));
}

export async function getCustomerDashboardSnapshot(email: string): Promise<CustomerDashboardSnapshot | null> {
  const normalized = normalizeEmail(email);

  const [customer, ordersWithItems] = await Promise.all([
    getCustomerByEmail(normalized),
    listOrdersWithItemsByCustomerEmail(normalized)
  ]);

  if (!customer) return null;

  const recentOrders = ordersWithItems.slice(0, 5).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    total: order.total,
    currency: order.currency,
    created_at: order.created_at,
    item_count: countOrderItems(order.order_items)
  }));

  const statusCounts: OrderStatusCounts = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0
  };

  for (const order of ordersWithItems) {
    if (order.status === "PENDING") statusCounts.pending += 1;
    else if (order.status === "CONFIRMED") statusCounts.confirmed += 1;
    else if (order.status === "PROCESSING") statusCounts.processing += 1;
    else if (order.status === "OUT_FOR_DELIVERY") statusCounts.outForDelivery += 1;
    else if (order.status === "DELIVERED") statusCounts.delivered += 1;
    else if (order.status === "CANCELED") statusCounts.cancelled += 1;
  }

  return {
    customer,
    totalOrders: ordersWithItems.length,
    totalSpent: ordersWithItems.reduce((sum, order) => sum + order.total, 0),
    statusCounts,
    recentOrders
  };
}

export async function listCustomerOrdersByEmail(email: string): Promise<CustomerOrderListItem[]> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return [];

  const orders = await listOrdersWithItemsByCustomerEmail(email);

  return orders.map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    total: order.total,
    currency: order.currency,
    created_at: order.created_at,
    item_count: countOrderItems(order.order_items)
  }));
}

export async function getCustomerOrderDetailByEmail(email: string, orderId: string): Promise<CustomerOrderDetail | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;

  const supabase = createServiceRoleSupabaseClient();
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", customer.id)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!orderData) return null;

  const { data: itemData, error: itemError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (itemError) throw new Error(itemError.message);

  const items = (itemData || []) as OrderItem[];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return {
    customer,
    order: orderData as Order,
    items,
    itemCount
  };
}

export async function upsertCustomerProfileByEmail(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = input.phone.trim() || null;

  const existing = await getCustomerByEmail(email);
  if (existing) {
    const { data, error } = await supabase
      .from("customers")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Customer;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      phone
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Customer;
}
