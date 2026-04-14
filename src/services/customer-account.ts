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

interface CustomerDashboardSnapshot {
  customer: Customer;
  totalOrders: number;
  totalSpent: number;
  recentOrders: CustomerOrderListItem[];
}

interface CustomerOrderDetail {
  customer: Customer;
  order: Order;
  items: OrderItem[];
  itemCount: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

function aggregateItemCounts(items: Pick<OrderItem, "order_id" | "quantity">[]) {
  const map = new Map<string, number>();

  items.forEach((item) => {
    map.set(item.order_id, (map.get(item.order_id) || 0) + Number(item.quantity || 0));
  });

  return map;
}

async function listOrdersForCustomerId(customerId: string): Promise<Order[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Order[];
}

export async function getCustomerDashboardSnapshot(email: string): Promise<CustomerDashboardSnapshot | null> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return null;

  const orders = await listOrdersForCustomerId(customer.id);
  const orderIds = orders.map((order) => order.id);

  let itemCounts = new Map<string, number>();
  if (orderIds.length > 0) {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds);

    if (error) throw new Error(error.message);
    itemCounts = aggregateItemCounts((data || []) as Pick<OrderItem, "order_id" | "quantity">[]);
  }

  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    total: order.total,
    currency: order.currency,
    created_at: order.created_at,
    item_count: itemCounts.get(order.id) || 0
  }));

  return {
    customer,
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    recentOrders
  };
}

export async function listCustomerOrdersByEmail(email: string): Promise<CustomerOrderListItem[]> {
  const customer = await getCustomerByEmail(email);
  if (!customer) return [];

  const orders = await listOrdersForCustomerId(customer.id);
  const orderIds = orders.map((order) => order.id);

  let itemCounts = new Map<string, number>();
  if (orderIds.length > 0) {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds);

    if (error) throw new Error(error.message);
    itemCounts = aggregateItemCounts((data || []) as Pick<OrderItem, "order_id" | "quantity">[]);
  }

  return orders.map((order) => ({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    total: order.total,
    currency: order.currency,
    created_at: order.created_at,
    item_count: itemCounts.get(order.id) || 0
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
