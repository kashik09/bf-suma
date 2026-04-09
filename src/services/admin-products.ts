import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/types";

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  stock_qty: number;
  status: ProductStatus;
  image_url: string | null;
  created_at: string;
}

export interface GetAdminProductsInput {
  search?: string;
  status?: ProductStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface AdminProductListResult {
  products: AdminProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class ProductDeleteRestrictedError extends Error {
  constructor(message: string = "This product cannot be deleted because it is referenced by existing orders.") {
    super(message);
    this.name = "ProductDeleteRestrictedError";
  }
}

export class ProductSlugConflictError extends Error {
  constructor(message: string = "A product with this slug already exists.") {
    super(message);
    this.name = "ProductSlugConflictError";
  }
}

export class AdminProductsUnavailableError extends Error {
  constructor(message: string = "Products are temporarily unavailable in admin.") {
    super(message);
    this.name = "AdminProductsUnavailableError";
  }
}

function hasErrorCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string | null };
  return candidate.code === code;
}

function clampPage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value as number));
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(1, Math.min(100, Math.floor(value as number)));
}

export async function getAdminProducts(input: GetAdminProductsInput = {}): Promise<AdminProductListResult> {
  const supabase = createServiceRoleSupabaseClient();
  const page = clampPage(input.page);
  const pageSize = clampPageSize(input.pageSize);
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  let query = supabase
    .from("products")
    .select("id, name, slug, sku, price, currency, stock_qty, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  const normalizedSearch = input.search?.trim();
  if (normalizedSearch) {
    query = query.or(`name.ilike.%${normalizedSearch}%,slug.ilike.%${normalizedSearch}%,sku.ilike.%${normalizedSearch}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    if (hasErrorCode(error, "PGRST205")) {
      throw new AdminProductsUnavailableError(
        "Products schema is missing in cache. Apply latest migrations and reload PostgREST."
      );
    }

    throw new AdminProductsUnavailableError(
      "We couldn't load products right now. Please check your database connection and try again."
    );
  }

  const rows = data ?? [];
  const productIds = rows.map((row) => row.id);
  const imageUrlByProductId = new Map<string, string>();

  if (productIds.length > 0) {
    const { data: imageRows, error: imageError } = await supabase
      .from("product_images")
      .select("product_id, url, sort_order")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true });

    if (!imageError) {
      for (const image of imageRows ?? []) {
        if (!imageUrlByProductId.has(image.product_id) && image.url) {
          imageUrlByProductId.set(image.product_id, image.url);
        }
      }
    }
  }

  return {
    products: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      price: row.price,
      currency: row.currency,
      stock_qty: row.stock_qty,
      status: row.status as ProductStatus,
      image_url: imageUrlByProductId.get(row.id) ?? null,
      created_at: row.created_at
    })),
    totalCount: count || 0,
    page,
    pageSize
  };
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
  image_url: string | null;
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
  const [{ data, error }, { data: imageRows, error: imageError }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, description, sku, price, compare_at_price, currency, stock_qty, status, category_id")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("product_images")
      .select("url")
      .eq("product_id", id)
      .order("sort_order", { ascending: true })
      .limit(1)
  ]);

  if (error) throw error;
  if (!data) return null;
  if (imageError) throw imageError;

  return {
    ...data,
    status: data.status as ProductStatus,
    image_url: imageRows?.[0]?.url ?? null
  };
}

export async function upsertProductImageUrl(productId: string, imageUrl: string | null): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const trimmed = imageUrl?.trim() || null;

  if (!trimmed) {
    await supabase.from("product_images").delete().eq("product_id", productId);
    return;
  }

  const { data: existing } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("product_images")
      .update({ url: trimmed, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("product_images")
      .insert({ product_id: productId, url: trimmed, alt_text: null, sort_order: 0 });
  }
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

  if (error || !data) {
    if (error?.code === "23505") throw new ProductSlugConflictError();
    throw error || new Error("Failed to create product.");
  }
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

  if (error || !data) {
    if (error?.code === "23505") throw new ProductSlugConflictError();
    throw error || new Error("Failed to update product.");
  }
  return { id: data.id };
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      throw new ProductDeleteRestrictedError();
    }
    throw error;
  }
}
