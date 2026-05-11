import { unstable_cache } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { STORE_CURRENCY } from "@/lib/utils";
import type {
  CurrencyCode,
  Package,
  PackageDisplayData,
  PackageItemWithProduct,
  PackageWithItems,
  ProductStatus
} from "@/types";
import type { TablesUpdate } from "@/types/database";

interface PackageRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  infographic_image_url: string | null;
  override_price_minor: number | null;
  currency: string;
  dm_keyword: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PackageItemRow {
  id: string;
  package_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    stock_qty: number;
    status: string;
    product_images: Array<{ url: string; sort_order: number }>;
  };
}

function normalizePackageRow(row: PackageRow): Package {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    hero_image_url: row.hero_image_url,
    infographic_image_url: row.infographic_image_url,
    override_price_minor: row.override_price_minor,
    currency: (row.currency || STORE_CURRENCY) as CurrencyCode,
    dm_keyword: row.dm_keyword,
    is_featured: row.is_featured,
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function normalizePackageItemRow(row: PackageItemRow): PackageItemWithProduct {
  const images = row.products.product_images || [];
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const primaryImage = sortedImages[0]?.url || "/placeholder-product.jpg";

  return {
    id: row.id,
    package_id: row.package_id,
    product_id: row.product_id,
    quantity: row.quantity,
    created_at: row.created_at,
    product: {
      id: row.products.id,
      name: row.products.name,
      slug: row.products.slug,
      price: Number(row.products.price),
      currency: (row.products.currency || STORE_CURRENCY) as CurrencyCode,
      image_url: primaryImage,
      stock_qty: Number(row.products.stock_qty),
      status: row.products.status as ProductStatus
    }
  };
}

/**
 * Calculate display data for a package including computed pricing and stock status
 */
export function calculatePackageDisplay(pkg: PackageWithItems): PackageDisplayData {
  // Sum retail prices of constituent products × quantities
  const calculated_price = pkg.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  // Final price is override or calculated
  const final_price = pkg.override_price_minor ?? calculated_price;

  // Savings only exist if there's an override that's less than calculated
  const savings =
    pkg.override_price_minor !== null && pkg.override_price_minor < calculated_price
      ? calculated_price - pkg.override_price_minor
      : null;

  // Package is in stock only if ALL items are in stock
  const is_in_stock = pkg.items.every((item) => {
    const isActive = item.product.status === "ACTIVE";
    const hasStock = item.product.stock_qty >= item.quantity;
    return isActive && hasStock;
  });

  // Total item count (sum of quantities)
  const item_count = pkg.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...pkg,
    calculated_price,
    final_price,
    savings,
    is_in_stock,
    item_count
  };
}

async function fetchPackagesWithItems(options: {
  activeOnly?: boolean;
  featuredOnly?: boolean;
  slug?: string;
}): Promise<PackageWithItems[]> {
  const supabase = createServiceRoleSupabaseClient();

  // Build package query
  let packageQuery = supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (options.activeOnly !== false) {
    packageQuery = packageQuery.eq("is_active", true);
  }

  if (options.featuredOnly) {
    packageQuery = packageQuery.eq("is_featured", true);
  }

  if (options.slug) {
    packageQuery = packageQuery.eq("slug", options.slug);
  }

  const { data: packageRows, error: packageError } = await packageQuery;

  if (packageError) {
    throw packageError;
  }

  if (!packageRows || packageRows.length === 0) {
    return [];
  }

  const packageIds = packageRows.map((pkg) => pkg.id);

  // Fetch package items with product data
  const { data: itemRows, error: itemsError } = await supabase
    .from("package_items")
    .select(`
      id,
      package_id,
      product_id,
      quantity,
      created_at,
      products (
        id,
        name,
        slug,
        price,
        currency,
        stock_qty,
        status,
        product_images (
          url,
          sort_order
        )
      )
    `)
    .in("package_id", packageIds);

  if (itemsError) {
    throw itemsError;
  }

  // Group items by package
  const itemsByPackageId = new Map<string, PackageItemWithProduct[]>();
  for (const row of (itemRows || []) as PackageItemRow[]) {
    if (!row.products) continue;

    const items = itemsByPackageId.get(row.package_id) || [];
    items.push(normalizePackageItemRow(row));
    itemsByPackageId.set(row.package_id, items);
  }

  // Combine packages with their items
  return (packageRows as PackageRow[]).map((pkg) => ({
    ...normalizePackageRow(pkg),
    items: itemsByPackageId.get(pkg.id) || []
  }));
}

/**
 * List all active packages with items and computed display data
 * Sorted by: featured first, then sort_order, then name
 */
async function fetchPackages(): Promise<PackageDisplayData[]> {
  const packages = await fetchPackagesWithItems({ activeOnly: true });

  // Calculate display data and sort
  const displayPackages = packages.map(calculatePackageDisplay);

  // Sort: featured first, then by sort_order, then out-of-stock last
  return displayPackages.sort((a, b) => {
    // Featured packages first
    if (a.is_featured !== b.is_featured) {
      return a.is_featured ? -1 : 1;
    }

    // In-stock before out-of-stock
    if (a.is_in_stock !== b.is_in_stock) {
      return a.is_in_stock ? -1 : 1;
    }

    // Then by sort_order
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    // Then alphabetically
    return a.name.localeCompare(b.name);
  });
}

// Cache packages for 60 seconds
export const getPackages = unstable_cache(fetchPackages, ["packages-list"], {
  revalidate: 60,
  tags: ["packages"]
});

/**
 * Get a single package by slug with full display data
 */
export async function getPackageBySlug(slug: string): Promise<PackageDisplayData | null> {
  const packages = await fetchPackagesWithItems({ activeOnly: true, slug });

  if (packages.length === 0) {
    return null;
  }

  return calculatePackageDisplay(packages[0]);
}

/**
 * List only featured packages
 * Returns empty array on error to prevent homepage crash
 */
export async function getFeaturedPackages(limit: number = 3): Promise<PackageDisplayData[]> {
  try {
    const packages = await getPackages();
    return packages.filter((pkg) => pkg.is_featured).slice(0, limit);
  } catch (error) {
    console.warn("getFeaturedPackages: failed to load packages, returning empty array", error);
    return [];
  }
}

/**
 * Admin: list all packages including inactive
 */
export async function listPackagesForAdmin(): Promise<PackageDisplayData[]> {
  const packages = await fetchPackagesWithItems({ activeOnly: false });

  return packages
    .map(calculatePackageDisplay)
    .sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    });
}

/**
 * Admin: get package by ID (including inactive)
 */
export async function getPackageById(id: string): Promise<PackageDisplayData | null> {
  const supabase = createServiceRoleSupabaseClient();

  const { data: packageRow, error: packageError } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .single();

  if (packageError || !packageRow) {
    return null;
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("package_items")
    .select(`
      id,
      package_id,
      product_id,
      quantity,
      created_at,
      products (
        id,
        name,
        slug,
        price,
        currency,
        stock_qty,
        status,
        product_images (
          url,
          sort_order
        )
      )
    `)
    .eq("package_id", id);

  if (itemsError) {
    throw itemsError;
  }

  const items = ((itemRows || []) as PackageItemRow[])
    .filter((row) => row.products)
    .map(normalizePackageItemRow);

  const pkg: PackageWithItems = {
    ...normalizePackageRow(packageRow as PackageRow),
    items
  };

  return calculatePackageDisplay(pkg);
}

export interface CreatePackageInput {
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  hero_image_url?: string | null;
  infographic_image_url?: string | null;
  override_price_minor?: number | null;
  currency?: CurrencyCode;
  dm_keyword?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  items: Array<{ product_id: string; quantity: number }>;
}

export interface UpdatePackageInput extends Partial<Omit<CreatePackageInput, "items">> {
  items?: Array<{ product_id: string; quantity: number }>;
}

/**
 * Admin: create a new package
 */
export async function createPackage(input: CreatePackageInput): Promise<PackageDisplayData> {
  const supabase = createServiceRoleSupabaseClient();

  const { data: packageRow, error: packageError } = await supabase
    .from("packages")
    .insert({
      slug: input.slug,
      name: input.name,
      tagline: input.tagline ?? null,
      description: input.description ?? null,
      hero_image_url: input.hero_image_url ?? null,
      infographic_image_url: input.infographic_image_url ?? null,
      override_price_minor: input.override_price_minor ?? null,
      currency: input.currency ?? "UGX",
      dm_keyword: input.dm_keyword ?? null,
      is_featured: input.is_featured ?? false,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0
    })
    .select("*")
    .single();

  if (packageError || !packageRow) {
    throw packageError || new Error("Failed to create package");
  }

  // Insert items
  if (input.items.length > 0) {
    const { error: itemsError } = await supabase.from("package_items").insert(
      input.items.map((item) => ({
        package_id: packageRow.id,
        product_id: item.product_id,
        quantity: item.quantity
      }))
    );

    if (itemsError) {
      throw itemsError;
    }
  }

  const result = await getPackageById(packageRow.id);
  if (!result) {
    throw new Error("Failed to fetch created package");
  }

  return result;
}

/**
 * Admin: update a package
 */
export async function updatePackage(id: string, input: UpdatePackageInput): Promise<PackageDisplayData> {
  const supabase = createServiceRoleSupabaseClient();

  // Update package fields
  const updateFields: TablesUpdate<"packages"> = {};
  if (input.slug !== undefined) updateFields.slug = input.slug;
  if (input.name !== undefined) updateFields.name = input.name;
  if (input.tagline !== undefined) updateFields.tagline = input.tagline;
  if (input.description !== undefined) updateFields.description = input.description;
  if (input.hero_image_url !== undefined) updateFields.hero_image_url = input.hero_image_url;
  if (input.infographic_image_url !== undefined) updateFields.infographic_image_url = input.infographic_image_url;
  if (input.override_price_minor !== undefined) updateFields.override_price_minor = input.override_price_minor;
  if (input.currency !== undefined) updateFields.currency = input.currency;
  if (input.dm_keyword !== undefined) updateFields.dm_keyword = input.dm_keyword;
  if (input.is_featured !== undefined) updateFields.is_featured = input.is_featured;
  if (input.is_active !== undefined) updateFields.is_active = input.is_active;
  if (input.sort_order !== undefined) updateFields.sort_order = input.sort_order;

  if (Object.keys(updateFields).length > 0) {
    const { error: updateError } = await supabase
      .from("packages")
      .update(updateFields)
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }
  }

  // Update items if provided
  if (input.items !== undefined) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from("package_items")
      .delete()
      .eq("package_id", id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new items
    if (input.items.length > 0) {
      const { error: insertError } = await supabase.from("package_items").insert(
        input.items.map((item) => ({
          package_id: id,
          product_id: item.product_id,
          quantity: item.quantity
        }))
      );

      if (insertError) {
        throw insertError;
      }
    }
  }

  const result = await getPackageById(id);
  if (!result) {
    throw new Error("Failed to fetch updated package");
  }

  return result;
}

/**
 * Admin: delete a package
 */
export async function deletePackage(id: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase.from("packages").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
