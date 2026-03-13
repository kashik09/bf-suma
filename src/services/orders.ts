import type { Order, OrderStatus } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
