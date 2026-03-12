import { SHOP_SORT_OPTIONS } from "@/lib/constants";
import { BFSUMA_CATALOG } from "@/lib/catalog";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AvailabilityState,
  Category,
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
}

const LOW_STOCK_THRESHOLD = 10;
const FALLBACK_CATEGORIES = BFSUMA_CATALOG.categories;
const FALLBACK_PRODUCTS = BFSUMA_CATALOG.products;

const SORT_ORDER: ProductSort[] = ["featured", "price_asc", "price_desc", "name_asc"];

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
  const supabase = await createServerSupabaseClient();

  const [categoriesRes, productsRes, imagesRes] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true),
    supabase.from("products").select("*").in("status", ["ACTIVE", "OUT_OF_STOCK"]),
    supabase.from("product_images").select("*").order("sort_order", { ascending: true })
  ]);

  if (categoriesRes.error || productsRes.error || imagesRes.error) {
    throw categoriesRes.error || productsRes.error || imagesRes.error;
  }

  const categories = (categoriesRes.data || []) as Category[];
  const products = (productsRes.data || []) as Product[];
  const images = (imagesRes.data || []) as ProductImage[];

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
    image_url:
      FALLBACK_CATEGORIES.find((fallbackCategory) => fallbackCategory.slug === category.slug)?.image_url ||
      FALLBACK_CATEGORIES[0].image_url
  }));

  const mappedProducts: StorefrontProduct[] = products
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
        sku: product.sku,
        stock_qty: Number(product.stock_qty),
        status,
        category_id: category.id,
        category_name: category.name,
        category_slug: category.slug,
        image_url:
          imageUrls[0] ||
          FALLBACK_PRODUCTS.find((fallbackProduct) => fallbackProduct.slug === product.slug)?.image_url ||
          FALLBACK_PRODUCTS[0].image_url,
        gallery_urls: imageUrls.length > 0 ? imageUrls : [FALLBACK_PRODUCTS[0].image_url],
        availability: resolveAvailability(status, Number(product.stock_qty))
      };
    })
    .filter((product): product is StorefrontProduct => Boolean(product));

  if (mappedProducts.length === 0 || mappedCategories.length === 0) {
    throw new Error("Supabase catalog incomplete");
  }

  return {
    categories: mappedCategories,
    products: mappedProducts
  };
}

async function getCatalogData(): Promise<CatalogData> {
  try {
    return await fetchCatalogFromSupabase();
  } catch {
    return {
      categories: FALLBACK_CATEGORIES,
      products: FALLBACK_PRODUCTS
    };
  }
}

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.search) query = query.ilike("name", `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return data ?? [];
  } catch {
    return FALLBACK_PRODUCTS.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      sku: product.sku,
      stock_qty: product.stock_qty,
      status: product.status,
      category_id: product.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();

    if (error) return null;
    return data;
  } catch {
    const fallbackProduct = FALLBACK_PRODUCTS.find((product) => product.slug === slug);
    if (!fallbackProduct) return null;

    return {
      id: fallbackProduct.id,
      name: fallbackProduct.name,
      slug: fallbackProduct.slug,
      description: fallbackProduct.description,
      price: fallbackProduct.price,
      compare_at_price: fallbackProduct.compare_at_price,
      sku: fallbackProduct.sku,
      stock_qty: fallbackProduct.stock_qty,
      status: fallbackProduct.status,
      category_id: fallbackProduct.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
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
  const catalog = await getCatalogData();
  return withStorefrontFilters(catalog.products, filters);
}

export async function listFeaturedProducts(limit: number = 6): Promise<StorefrontProduct[]> {
  const products = await listStorefrontProducts({ sort: "featured" });
  return products.slice(0, limit);
}

export async function listFeaturedCategories(limit: number = 4): Promise<StorefrontCategory[]> {
  const categories = await listStorefrontCategories();
  return categories.slice(0, limit);
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
