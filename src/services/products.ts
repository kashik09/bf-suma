import { unstable_cache } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { SHOP_SORT_OPTIONS } from "@/lib/constants";
import { resolveCategoryImageBySlug } from "@/lib/catalog";
import {
  getPdfCategoryContentForStorefrontSlug,
  getPdfShortDescriptionForCatalogSlug
} from "@/lib/catalog/pdf-catalog-content";
import { buildLiveCatalogHealth, type CatalogHealth } from "@/lib/catalog-health";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { STORE_CURRENCY } from "@/lib/utils";
import type {
  AvailabilityState,
  Category,
  CurrencyCode,
  Product,
  ProductImage,
  ProductStatus,
  StorefrontCategory,
  StorefrontProduct
} from "@/types";

export interface ProductFilters {
  categorySlug?: string;
  status?: ProductStatus;
  search?: string;
}

export type ProductSort = (typeof SHOP_SORT_OPTIONS)[number]["value"];

export interface StorefrontProductFilters {
  categorySlug?: string;
  search?: string;
  availability?: "all" | "in_stock" | "out_of_stock";
  sort?: ProductSort;
}

interface CatalogData {
  categories: StorefrontCategory[];
  products: StorefrontProduct[];
  health: CatalogHealth;
}

export interface StorefrontCatalogSnapshot {
  categories: StorefrontCategory[];
  products: StorefrontProduct[];
  health: CatalogHealth;
}

const LOW_STOCK_THRESHOLD = 10;
const GENERIC_CATEGORY_DESCRIPTIONS = new Set(["", "Browse curated essentials in this category."]);

const SORT_ORDER: ProductSort[] = ["featured", "price_asc", "price_desc", "name_asc"];

function enrichStorefrontCategory(category: StorefrontCategory): StorefrontCategory {
  const pdfCategoryContent = getPdfCategoryContentForStorefrontSlug(category.slug);
  if (!pdfCategoryContent) return category;

  const currentDescription = category.description.trim();
  if (!GENERIC_CATEGORY_DESCRIPTIONS.has(currentDescription)) return category;

  return {
    ...category,
    description: pdfCategoryContent.description
  };
}

function enrichStorefrontProduct(product: StorefrontProduct): StorefrontProduct {
  const pdfShortDescription = getPdfShortDescriptionForCatalogSlug(product.slug);
  if (!pdfShortDescription) return product;

  return {
    ...product,
    description: pdfShortDescription
  };
}

function enrichCatalogData(catalog: CatalogData): CatalogData {
  return {
    ...catalog,
    categories: catalog.categories.map(enrichStorefrontCategory),
    products: catalog.products.map(enrichStorefrontProduct)
  };
}

function normalizeStatus(status: unknown): ProductStatus {
  if (status === "DRAFT" || status === "ACTIVE" || status === "ARCHIVED" || status === "OUT_OF_STOCK") {
    return status;
  }

  return "ACTIVE";
}

function resolveAvailability(status: ProductStatus, stockQty: number): AvailabilityState {
  if (status === "OUT_OF_STOCK" || stockQty <= 0) return "out_of_stock";
  if (stockQty <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

function sortProducts(items: StorefrontProduct[], sort: ProductSort = "featured"): StorefrontProduct[] {
  if (!SORT_ORDER.includes(sort)) return items;

  if (sort === "price_asc") {
    return [...items].sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    return [...items].sort((a, b) => b.price - a.price);
  }

  if (sort === "name_asc") {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...items].sort((a, b) => {
    if (a.availability !== b.availability) {
      if (a.availability === "in_stock") return -1;
      if (b.availability === "in_stock") return 1;
    }

    return a.name.localeCompare(b.name);
  });
}

function withStorefrontFilters(
  products: StorefrontProduct[],
  filters: StorefrontProductFilters = {}
): StorefrontProduct[] {
  const normalizedSearch = (filters.search || "").trim().toLowerCase();

  let result = [...products];

  if (filters.categorySlug) {
    result = result.filter((product) => product.category_slug === filters.categorySlug);
  }

  if (normalizedSearch) {
    result = result.filter((product) => {
      const searchText = `${product.name} ${product.description} ${product.category_name}`.toLowerCase();
      return searchText.includes(normalizedSearch);
    });
  }

  if (filters.availability === "in_stock") {
    result = result.filter((product) => product.availability !== "out_of_stock");
  }

  if (filters.availability === "out_of_stock") {
    result = result.filter((product) => product.availability === "out_of_stock");
  }

  return sortProducts(result, filters.sort);
}

async function fetchCatalogFromSupabase(): Promise<CatalogData> {
  const supabase = createServiceRoleSupabaseClient();

  const [categoriesRes, productsRes, imagesRes] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true),
    supabase.from("products").select("*").eq("status", "ACTIVE"),
    supabase.from("product_images").select("*").order("sort_order", { ascending: true })
  ]);

  if (categoriesRes.error || productsRes.error || imagesRes.error) {
    const failedError = categoriesRes.error || productsRes.error || imagesRes.error;
    console.error("[CATALOG_FETCH_FAILED]", {
      where: "fetchCatalogFromSupabase",
      categoriesError: categoriesRes.error,
      productsError: productsRes.error,
      imagesError: imagesRes.error,
      code: failedError?.code,
      message: failedError?.message,
      details: failedError?.details,
      hint: failedError?.hint
    });

    Sentry.captureException(failedError, {
      tags: {
        scope: "catalog",
        severity: "critical",
        impact: "site_unavailable"
      },
      extra: {
        categoriesError: categoriesRes.error?.message,
        productsError: productsRes.error?.message,
        imagesError: imagesRes.error?.message
      }
    });

    throw failedError;
  }

  const categories = (categoriesRes.data || []) as Category[];
  const products = (productsRes.data || []) as Product[];
  const images = (imagesRes.data || []) as ProductImage[];
  const productCountsByCategoryId = products.reduce<Map<string, number>>((acc, product) => {
    const nextCount = (acc.get(product.category_id) || 0) + 1;
    acc.set(product.category_id, nextCount);
    return acc;
  }, new Map<string, number>());

  const categoriesById = new Map<string, Category>(categories.map((category) => [category.id, category]));
  const imagesByProductId = new Map<string, ProductImage[]>();

  for (const image of images) {
    const productImages = imagesByProductId.get(image.product_id) || [];
    productImages.push(image);
    imagesByProductId.set(image.product_id, productImages);
  }

  const mappedCategories: StorefrontCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "Browse curated essentials in this category.",
    product_count: productCountsByCategoryId.get(category.id) || 0,
    image_url: resolveCategoryImageBySlug(category.slug, category.name)
  }));

  const mappedProducts = products
    .map((product) => {
      const category = categoriesById.get(product.category_id);
      if (!category) return null;

      const productImages = imagesByProductId.get(product.id) || [];
      const imageUrls = productImages.map((image) => image.url).filter(Boolean);
      const status = normalizeStatus(product.status);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        price: Number(product.price),
        compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
        currency: (product.currency || STORE_CURRENCY) as CurrencyCode,
        sku: product.sku,
        stock_qty: Number(product.stock_qty),
        status,
        category_id: category.id,
        category_name: category.name,
        category_slug: category.slug,
        // All active products have DB images; placeholder is for future products without images
        image_url: imageUrls[0] || "/catalog-images/placeholder.svg",
        gallery_urls: imageUrls.length > 0 ? imageUrls : ["/catalog-images/placeholder.svg"],
        availability: resolveAvailability(status, Number(product.stock_qty))
      };
    })
    .filter((product): product is StorefrontProduct => Boolean(product));

  if (mappedProducts.length === 0 || mappedCategories.length === 0) {
    const incompleteError = new Error("Supabase catalog incomplete");
    Sentry.captureException(incompleteError, {
      tags: {
        scope: "catalog",
        severity: "critical",
        impact: "site_unavailable"
      },
      extra: {
        productCount: mappedProducts.length,
        categoryCount: mappedCategories.length
      }
    });
    throw incompleteError;
  }

  return {
    categories: mappedCategories,
    products: mappedProducts,
    health: buildLiveCatalogHealth()
  };
}

async function fetchCatalogData(): Promise<CatalogData> {
  // No try/catch - errors propagate to Next.js error boundary.
  // Sentry captures in fetchCatalogFromSupabase (added in Phase 5).
  const liveCatalog = await fetchCatalogFromSupabase();
  return enrichCatalogData(liveCatalog);
}

// Cache catalog data for 60 seconds to reduce database calls
const getCatalogData = unstable_cache(
  fetchCatalogData,
  ["storefront-catalog"],
  { revalidate: 60, tags: ["catalog"] }
);

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = createServiceRoleSupabaseClient();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((p) => ({
    ...p,
    status: p.status as ProductStatus,
    currency: p.currency as CurrencyCode
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();

  if (error || !data) return null;
  return {
    ...data,
    status: data.status as ProductStatus,
    currency: data.currency as CurrencyCode
  };
}

export async function getStorefrontCatalogSnapshot(
  filters: StorefrontProductFilters = {}
): Promise<StorefrontCatalogSnapshot> {
  const catalog = await getCatalogData();

  return {
    categories: catalog.categories,
    products: withStorefrontFilters(catalog.products, filters),
    health: catalog.health
  };
}

export async function getStorefrontCatalogHealth(): Promise<CatalogHealth> {
  const catalog = await getCatalogData();
  return catalog.health;
}

export async function listStorefrontCategories(): Promise<StorefrontCategory[]> {
  const catalog = await getCatalogData();
  return catalog.categories;
}

export async function getStorefrontCategoryBySlug(slug: string): Promise<StorefrontCategory | null> {
  const categories = await listStorefrontCategories();
  return categories.find((category) => category.slug === slug) || null;
}

export async function listStorefrontProducts(
  filters: StorefrontProductFilters = {}
): Promise<StorefrontProduct[]> {
  const catalog = await getStorefrontCatalogSnapshot(filters);
  return catalog.products;
}

export async function listFeaturedProducts(limit: number = 6): Promise<StorefrontProduct[]> {
  const products = await listStorefrontProducts({ sort: "featured" });
  return products.slice(0, limit);
}

export async function listFeaturedCategories(limit: number = 4): Promise<StorefrontCategory[]> {
  const categories = await listStorefrontCategories();
  return [...categories]
    .sort((a, b) => {
      const countDelta = (b.product_count || 0) - (a.product_count || 0);
      if (countDelta !== 0) return countDelta;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export async function getStorefrontProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const products = await listStorefrontProducts();
  return products.find((product) => product.slug === slug) || null;
}

export async function listRelatedProducts(
  product: StorefrontProduct,
  limit: number = 4
): Promise<StorefrontProduct[]> {
  const allProducts = await listStorefrontProducts({ sort: "featured" });
  return allProducts
    .filter((entry) => entry.category_slug === product.category_slug && entry.id !== product.id)
    .slice(0, limit);
}

interface ProductUnitsSoldRow {
  quantity: number | string;
}

export async function getProductUnitsSoldThisWeek(productId: string): Promise<number | null> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { data, error } = await supabase
      .from("order_items")
      .select("quantity, orders!inner(id)")
      .eq("product_id", productId)
      .neq("orders.status", "CANCELED")
      .gte("orders.created_at", weekStart.toISOString());

    if (error) throw error;

    const rows = (data || []) as ProductUnitsSoldRow[];
    if (rows.length === 0) return 0;

    return rows.reduce((sum, row) => {
      const quantity = Number(row.quantity);
      if (!Number.isFinite(quantity)) return sum;
      return sum + Math.max(0, Math.round(quantity));
    }, 0);
  } catch (error) {
    console.error("[UNITS_SOLD_FETCH_FAILED]", { productId, error });
    return null;
  }
}

function extractContentKeywords(tags: string[], title: string): string[] {
  const fromTags = tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean);
  const fromTitle = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);

  const keywords = new Set<string>([...fromTags, ...fromTitle]);
  return [...keywords];
}

function getKeywordScore(product: StorefrontProduct, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const searchable = `${product.name} ${product.description} ${product.category_name} ${product.slug}`.toLowerCase();
  return keywords.reduce((score, keyword) => (searchable.includes(keyword) ? score + 1 : score), 0);
}

export async function listProductsRelatedToContent(
  tags: string[],
  title: string,
  limit: number = 3
): Promise<StorefrontProduct[]> {
  const products = await listStorefrontProducts({
    sort: "featured",
    availability: "in_stock"
  });
  const keywords = extractContentKeywords(tags, title);

  const scored = products
    .map((product) => ({
      product,
      score: getKeywordScore(product, keywords)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((entry) => entry.product);

  if (scored.length >= limit || keywords.length === 0) {
    return scored;
  }

  const additional = products
    .filter((product) => !scored.some((existing) => existing.id === product.id))
    .slice(0, limit - scored.length);

  return [...scored, ...additional];
}
