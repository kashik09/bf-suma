import type { Customer } from "@/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export interface UpsertCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export async function listCustomers(): Promise<Customer[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getStorefrontCustomerCount(): Promise<number | null> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { count, error } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true });

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();

  if (error) return null;
  return data;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string | null {
  const trimmed = phone.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function upsertCustomerByEmail(input: UpsertCustomerInput): Promise<Customer> {
  const supabase = createServiceRoleSupabaseClient();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  const { data: existingRows, error: existingError } = await supabase
    .from("customers")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (existingError) throw existingError;

  const existing = existingRows?.[0] ?? null;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("customers")
      .update({
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        phone,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError) throw updateError;
    return updated;
  }

  const { data: created, error: createError } = await supabase
    .from("customers")
    .insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email,
      phone,
      whatsapp_opt_in: false
    })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}
