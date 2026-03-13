import type { Customer } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function listCustomers(): Promise<Customer[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();

  if (error) return null;
  return data;
}
