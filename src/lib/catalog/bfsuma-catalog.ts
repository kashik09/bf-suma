/**
 * BF Suma Fallback Catalog
 *
 * Single-source fallback catalog built from data/catalog/catalog_manifest.json.
 * Used whenever Supabase catalog access fails.
 */

import manifest from "../../../data/catalog/catalog_manifest.json";
import type { AvailabilityState, ProductStatus, StorefrontCategory, StorefrontProduct } from "@/types";
import { STORE_CURRENCY, toMinorUnits } from "@/lib/utils";

interface ManifestCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ManifestProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category_slug: string | null;
  image_url: string | null;
}

const DEFAULT_PRODUCT_IMAGE = "/catalog-images/placeholder.svg";
const DEFAULT_STOCK_QTY = 50;

// Category images - only HIGH/MEDIUM confidence matches using owned assets
// LOW confidence categories use placeholder until manual sourcing
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  // HIGH confidence - exact thematic match with owned hero images
  "joint-health": "/hero-images/joint-health.jpg",
  supplements: "/hero-images/supplements.jpg",
  // MEDIUM confidence - lifestyle imagery fits anti-aging theme
  "anti-aging": "/hero-images/lifestyle.jpg",
  // LOW confidence - all others need manual sourcing, use placeholder
  skincare: "/catalog-images/placeholder.svg",
  beverages: "/catalog-images/placeholder.svg",
  "bone-health": "/catalog-images/placeholder.svg",
  "digestive-health": "/catalog-images/placeholder.svg",
  "personal-care": "/catalog-images/placeholder.svg",
  "weight-management": "/hero-images/vegetables.jpg", // MEDIUM - health/fitness theme
  "womens-health": "/catalog-images/placeholder.svg",
  "mens-health": "/catalog-images/placeholder.svg",
  "brain-health": "/catalog-images/placeholder.svg",
  detox: "/hero-images/vegetables.jpg" // MEDIUM - natural/cleanse theme
};

function generateSku(slug: string, index: number): string {
  const prefix = slug.substring(0, 3).toUpperCase().replace(/-/g, "");
  return `BFS-${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function toLocalImagePath(imageUrl: string | null, slug: string): string {
  if (!imageUrl) return DEFAULT_PRODUCT_IMAGE;

  if (imageUrl.startsWith("/catalog-images/")) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl);
    const domain = parsed.hostname.replace(/^www\./, "");
    const extMatch = parsed.pathname.match(/\.[a-zA-Z0-9]+$/);
    const extension = extMatch ? extMatch[0] : ".webp";
    return `/catalog-images/${domain}/${slug}${extension}`;
  } catch {
    return DEFAULT_PRODUCT_IMAGE;
  }
}

function normalizeCurrency(currency: string): string {
  return (currency || STORE_CURRENCY).toUpperCase();
}

function resolveAvailability(status: ProductStatus, stockQty: number): AvailabilityState {
  if (status === "OUT_OF_STOCK" || stockQty <= 0) return "out_of_stock";
  if (stockQty <= 10) return "low_stock";
  return "in_stock";
}

const manifestCategories = (manifest.categories || []) as ManifestCategory[];
const manifestProducts = (manifest.products || []) as ManifestProduct[];

export const BFSUMA_CATEGORIES: StorefrontCategory[] = manifestCategories.map((category) => ({
  id: `cat-${category.slug}`,
  name: category.name,
  slug: category.slug,
  description: category.description || "Browse curated essentials in this category.",
  image_url: CATEGORY_IMAGE_BY_SLUG[category.slug] || DEFAULT_PRODUCT_IMAGE
}));

const CATEGORY_BY_SLUG = new Map(BFSUMA_CATEGORIES.map((category) => [category.slug, category]));

function resolveCategory(slug: string | null | undefined): StorefrontCategory {
  const category = slug ? CATEGORY_BY_SLUG.get(slug) : undefined;
  if (category) return category;

  const fallback = CATEGORY_BY_SLUG.get("supplements") || BFSUMA_CATEGORIES[0];
  if (!fallback) {
    return {
      id: "cat-supplements",
      name: "Supplements",
      slug: "supplements",
      description: "Browse curated essentials in this category.",
      image_url: DEFAULT_PRODUCT_IMAGE
    };
  }

  return fallback;
}

export const BFSUMA_PRODUCTS: StorefrontProduct[] = manifestProducts
  .map<StorefrontProduct | null>((product, index) => {
    const currency = normalizeCurrency(product.currency);
    if (currency !== STORE_CURRENCY) {
      return null;
    }

    const category = resolveCategory(product.category_slug);
    const status: ProductStatus = "ACTIVE";
    const stockQty = DEFAULT_STOCK_QTY;
    const imageUrl = toLocalImagePath(product.image_url, product.slug);

    return {
      id: `prod-${product.slug}`,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: toMinorUnits(product.price, currency),
      compare_at_price:
        product.compare_at_price !== null ? toMinorUnits(product.compare_at_price, currency) : null,
      currency: STORE_CURRENCY,
      sku: generateSku(product.slug, index),
      stock_qty: stockQty,
      status,
      category_id: category.id,
      category_name: category.name,
      category_slug: category.slug,
      image_url: imageUrl,
      gallery_urls: [imageUrl],
      availability: resolveAvailability(status, stockQty)
    };
  })
  .filter((product): product is StorefrontProduct => product !== null);

export const BFSUMA_CATALOG = {
  categories: BFSUMA_CATEGORIES,
  products: BFSUMA_PRODUCTS
} as const;

// Backwards compatibility aliases
export const BFSUMA_CATALOG_SEED = BFSUMA_CATALOG;
export const BFSUMA_CATALOG_SEED_CATEGORIES = BFSUMA_CATEGORIES;
export const BFSUMA_CATALOG_SEED_PRODUCTS = BFSUMA_PRODUCTS;
