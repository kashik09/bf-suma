import type { Order, OrderStatus } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OrderIntakeInput } from "@/lib/validation";
import { upsertCustomerByEmail } from "@/services/customers";

export interface CreateOrderIntakeResult {
  orderId: string;
  orderNumber: string;
  receivedAt: string;
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

export async function createOrderIntake(payload: OrderIntakeInput): Promise<CreateOrderIntakeResult> {
  const supabase = await createServerSupabaseClient();
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
      subtotal: payload.subtotal,
      delivery_fee: payload.deliveryFee,
      total: payload.total,
      delivery_address: payload.deliveryAddress.trim(),
      notes: payload.notes?.trim() || null
    })
    .select("id, order_number, created_at")
    .single();

  if (orderError || !order) throw orderError || new Error("Failed to create order record");

  const orderItems = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name_snapshot: item.name,
    unit_price: item.price,
    quantity: item.quantity,
    line_total: item.price * item.quantity
  }));

  const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);

  if (orderItemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw orderItemsError;
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    receivedAt: order.created_at
  };
}
