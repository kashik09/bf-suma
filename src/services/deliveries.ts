import type { Delivery } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function listDeliveries(): Promise<Delivery[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .order("assigned_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
