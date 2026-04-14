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
const STORAGE_IMAGE_EXT_BY_SLUG: Record<string, string> = {
  "anatic-herbal-soap": "jpg",
  "arthro-xtra-tablets": "jpg",
  "blueberry-chewable": "jpg",
  "calcium-vitamin-d3-milk": "jpg",
  "cerebrain-tablets": "jpg",
  "consti-relax-solution": "jpg",
  "cool-roll": "jpg",
  "cordyceps-coffee": "jpg",
  "detoxilive-pro-oil-capsules": "png",
  "dr-ts-toothpaste": "jpg",
  elements: "webp",
  "ez-xlim": "jpg",
  femibiotics: "webp",
  "femicalcium-d3": "webp",
  "femicare-cleanser": "jpg",
  "feminergy-capsules": "jpg",
  "ganoderma-spores-oil-60": "jpg",
  "ginseng-coffee": "jpg",
  "gluzo-joint-capsules": "jpg",
  "gluzo-joint-ultra-pro": "webp",
  "gym-effect-capsules": "jpg",
  "micro2-cycle": "jpg",
  "novel-depile-capsules": "jpg",
  "nt-diarr-pills": "jpg",
  "probio-3-plus": "webp",
  "prostat-relax": "jpg",
  "pure-ganoderma-spores-30": "jpg",
  "pure-ganoderma-spores-60": "jpg",
  "quad-reishi-capsules": "jpg",
  "refined-yunzhi-essence": "jpg",
  "reishi-coffee": "jpg",
  "relivin-tea": "jpg",
  "veggie-veggie": "jpg",
  "vitamin-c-chewable": "jpg",
  "xpower-coffee": "jpg",
  "xpower-man-plus": "jpg",
  "youth-essence-facial-cream": "jpg",
  "youth-essence-facial-mask": "jpg",
  "youth-essence-lotion": "jpg",
  "youth-essence-toner": "jpg",
  "youth-refreshing-facial-cleanser": "jpg",
  "zaminocal-plus-capsules": "jpg"
};

// Category images - mapped to category-images folder
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  "anti-aging": "/category-images/anti-aging.jpg",
  beverages: "/category-images/beverages.jpg",
  "bone-health": "/category-images/bone-health.jpg",
  "brain-health": "/category-images/brain-health.jpg",
  detox: "/category-images/detox.jpg",
  "digestive-health": "/category-images/digestive-health.jpg",
  "joint-health": "/category-images/joint-health.jpg",
  "mens-health": "/category-images/mens-health.jpg",
  "personal-care": "/category-images/personal-care.jpg",
  skincare: "/category-images/skincare.jpg",
  supplements: "/category-images/supplements.jpg",
  "weight-management": "/category-images/weight-management.jpg",
  "womens-health": "/category-images/womens-health.jpg"
};

// Legacy category slugs from earlier catalog sources are mapped to the
// closest current category image to keep slideshow cards coherent.
const CATEGORY_IMAGE_ALIAS_BY_SLUG: Record<string, string> = {
  "bone-joint-care": "joint-health",
  "immune-boosters": "supplements",
  "premium-selected": "supplements",
  "cardiovascular-health": "supplements",
  "smart-kids": "supplements",
  "skincare-youth-series": "skincare",
  "suma-living": "personal-care"
};

function normalizeCategorySlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveCategoryImageBySlug(slug?: string | null, categoryName?: string | null): string {
  const slugCandidate = normalizeCategorySlug(slug || "");
  const nameCandidate = normalizeCategorySlug(categoryName || "");

  const candidates = [
    slugCandidate,
    CATEGORY_IMAGE_ALIAS_BY_SLUG[slugCandidate],
    nameCandidate,
    CATEGORY_IMAGE_ALIAS_BY_SLUG[nameCandidate]
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const directMatch = CATEGORY_IMAGE_BY_SLUG[candidate];
    if (directMatch) return directMatch;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

function generateSku(slug: string, index: number): string {
  const prefix = slug.substring(0, 3).toUpperCase().replace(/-/g, "");
  return `BFS-${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function getStorageBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
}

function resolveStorageImageBySlug(slug: string): string | null {
  const storageBaseUrl = getStorageBaseUrl();
  const ext = STORAGE_IMAGE_EXT_BY_SLUG[slug];
  if (!ext || !storageBaseUrl) return null;
  return `${storageBaseUrl}/storage/v1/object/public/product-images/${slug}.${ext}`;
}

function toLocalImagePath(imageUrl: string | null, slug: string): string {
  const storageFallback = resolveStorageImageBySlug(slug);
  if (!imageUrl) return storageFallback || DEFAULT_PRODUCT_IMAGE;

  if (imageUrl.startsWith("/catalog-images/")) {
    return imageUrl;
  }

  if (/bfsumaproducts\.co\.ke\/web\/image\/product\.template\/\d+\/image_512/i.test(imageUrl)) {
    return storageFallback || imageUrl;
  }

  if (imageUrl.startsWith("https://") || imageUrl.startsWith("http://")) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl);
    const domain = parsed.hostname.replace(/^www\./, "");
    const extMatch = parsed.pathname.match(/\.[a-zA-Z0-9]+$/);
    const extension = extMatch ? extMatch[0] : ".webp";
    return `/catalog-images/${domain}/${slug}${extension}`;
  } catch {
    return storageFallback || DEFAULT_PRODUCT_IMAGE;
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
  image_url: resolveCategoryImageBySlug(category.slug, category.name)
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
