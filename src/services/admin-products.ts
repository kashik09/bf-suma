import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/types";

export interface AdminProductListItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock_qty: number;
  status: ProductStatus;
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, currency, stock_qty, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin products error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    currency: row.currency,
    stock_qty: row.stock_qty,
    status: row.status
  }));
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock_qty: number;
  status: ProductStatus;
  category_id: string;
}

export interface UpsertAdminProductInput {
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock_qty: number;
  status: ProductStatus;
  category_id: string;
}

export async function listAdminCategoryOptions(): Promise<AdminCategoryOption[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, sku, price, compare_at_price, currency, stock_qty, status, category_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function createAdminProduct(input: UpsertAdminProductInput): Promise<{ id: string }> {
  const supabase = createServiceRoleSupabaseClient();
  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    sku: input.sku,
    price: input.price,
    compare_at_price: input.compare_at_price,
    currency: input.currency,
    stock_qty: input.stock_qty,
    status: input.status,
    category_id: input.category_id
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) throw error || new Error("Failed to create product.");
  return { id: data.id };
}

export async function updateAdminProduct(
  id: string,
  input: UpsertAdminProductInput
): Promise<{ id: string }> {
  const supabase = createServiceRoleSupabaseClient();
  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    sku: input.sku,
    price: input.price,
    compare_at_price: input.compare_at_price,
    currency: input.currency,
    stock_qty: input.stock_qty,
    status: input.status,
    category_id: input.category_id,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) throw error || new Error("Failed to update product.");
  return { id: data.id };
}
