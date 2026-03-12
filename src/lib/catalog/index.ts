/**
 * Catalog Module Index
 *
 * Central export point for BF Suma catalog data.
 * Provides fallback categories and products when Supabase is unavailable.
 */

export {
  BFSUMA_CATALOG,
  BFSUMA_CATEGORIES,
  BFSUMA_PRODUCTS,
  // Backwards compatibility aliases
  BFSUMA_CATALOG_SEED,
  BFSUMA_CATALOG_SEED_CATEGORIES,
  BFSUMA_CATALOG_SEED_PRODUCTS
} from "./bfsuma-catalog";
