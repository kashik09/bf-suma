#!/usr/bin/env npx tsx
/**
 * BF Suma Catalog Import Script
 *
 * Imports catalog data from the manifest into Supabase.
 *
 * Usage:
 *   cd /home/kashi-kweyu/projects/complete-projects/bf-suma
 *   npx tsx scripts/import-bfsuma-catalog.ts
 *
 * Required Environment Variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (not anon key)
 *
 * Import Assumptions:
 *   - Categories are upserted by slug
 *   - Products are upserted by slug
 *   - Category relationships are only set where confirmed in manifest
 *   - Stock quantities default to 50 (not invented, placeholder)
 *   - Prices are stored as integer minor units (KES cents)
 *   - Launch scope uses a single canonical store currency (KES)
 *   - Products without category_slug are skipped
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MANIFEST_PATH = path.join(process.cwd(), "data", "catalog", "catalog_manifest.json");
const DEFAULT_STOCK_QTY = 50;
const STORE_CURRENCY = "KES";
const CURRENCY_FRACTION_DIGITS: Record<string, number> = {
  KES: 2,
  UGX: 0
};

// Stats tracking
const stats = {
  categoriesCreated: 0,
  categoriesUpdated: 0,
  categoriesSkipped: 0,
  productsCreated: 0,
  productsUpdated: 0,
  productsSkipped: 0,
  productsFlagged: [] as string[],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ManifestCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
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
  source: string;
}

interface ManifestFlagged {
  name: string;
  reason: string;
  source: string;
  price: number;
}

interface Manifest {
  metadata: {
    extracted_at: string;
    sources: string[];
    total_products: number;
    total_with_images: number;
  };
  categories: ManifestCategory[];
  products: ManifestProduct[];
  flagged_for_review: ManifestFlagged[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSku(slug: string, index: number): string {
  const prefix = slug.substring(0, 3).toUpperCase().replace(/-/g, "");
  return `BFS-${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function getLocalImagePath(imageUrl: string | null, slug: string): string {
  if (!imageUrl) {
    return "/catalog-images/placeholder.webp";
  }

  const url = new URL(imageUrl);
  let domain = url.hostname;
  if (domain.startsWith("www.")) {
    domain = domain.substring(4);
  }

  const ext = path.extname(url.pathname) || ".webp";
  return `/catalog-images/${domain}/${slug}${ext}`;
}

function toMinorUnits(amountMajor: number, currency: string): number {
  const fractionDigits = CURRENCY_FRACTION_DIGITS[currency] ?? 2;
  const multiplier = 10 ** fractionDigits;
  return Math.round(amountMajor * multiplier);
}

// ---------------------------------------------------------------------------
// Main Import Logic
// ---------------------------------------------------------------------------

async function main() {
  console.log("BF Suma Catalog Import");
  console.log("=".repeat(50));

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("\nError: Missing required environment variables.");
    console.error("Required:");
    console.error("  NEXT_PUBLIC_SUPABASE_URL");
    console.error("  SUPABASE_SERVICE_ROLE_KEY");
    console.error("\nRun with: npx dotenv -e .env.local -- npx tsx scripts/import-bfsuma-catalog.ts");
    process.exit(1);
  }

  // Initialize Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Load manifest
  console.log(`\nLoading manifest: ${MANIFEST_PATH}`);
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Error: Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  console.log(`Found ${manifest.categories.length} categories`);
  console.log(`Found ${manifest.products.length} products`);

  if (manifest.flagged_for_review?.length) {
    console.log(`\nFlagged for review (${manifest.flagged_for_review.length}):`);
    for (const item of manifest.flagged_for_review) {
      console.log(`  - ${item.name}: ${item.reason}`);
      stats.productsFlagged.push(item.name);
    }
  }

  // ---------------------------------------------------------------------------
  // Import Categories
  // ---------------------------------------------------------------------------
  console.log("\n--- Importing Categories ---");

  for (const cat of manifest.categories) {
    const categoryData = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      is_active: true,
    };

    // Check if category exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", existing.id);

      if (error) {
        console.log(`  [ERROR] ${cat.name}: ${error.message}`);
        stats.categoriesSkipped++;
      } else {
        console.log(`  [UPDATED] ${cat.name}`);
        stats.categoriesUpdated++;
      }
    } else {
      // Insert new
      const { error } = await supabase.from("categories").insert(categoryData);

      if (error) {
        console.log(`  [ERROR] ${cat.name}: ${error.message}`);
        stats.categoriesSkipped++;
      } else {
        console.log(`  [CREATED] ${cat.name}`);
        stats.categoriesCreated++;
      }
    }
  }

  // Build category lookup
  const { data: allCategories } = await supabase.from("categories").select("id, slug");
  const categoryBySlug = new Map(
    (allCategories || []).map((c: { id: string; slug: string }) => [c.slug, c.id])
  );

  // ---------------------------------------------------------------------------
  // Import Products
  // ---------------------------------------------------------------------------
  console.log("\n--- Importing Products ---");

  for (let i = 0; i < manifest.products.length; i++) {
    const prod = manifest.products[i];

    // Skip products without confirmed category
    if (!prod.category_slug) {
      console.log(`  [SKIP] ${prod.name}: no category_slug`);
      stats.productsSkipped++;
      continue;
    }

    const categoryId = categoryBySlug.get(prod.category_slug);
    if (!categoryId) {
      console.log(`  [SKIP] ${prod.name}: category '${prod.category_slug}' not found`);
      stats.productsSkipped++;
      continue;
    }

    const currency = (prod.currency || STORE_CURRENCY).toUpperCase();
    if (currency !== STORE_CURRENCY) {
      console.log(`  [SKIP] ${prod.name}: unsupported currency '${currency}'`);
      stats.productsSkipped++;
      continue;
    }

    const productData = {
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: toMinorUnits(prod.price, currency),
      compare_at_price: prod.compare_at_price !== null ? toMinorUnits(prod.compare_at_price, currency) : null,
      sku: generateSku(prod.slug, i),
      stock_qty: DEFAULT_STOCK_QTY,
      status: "ACTIVE" as const,
      category_id: categoryId,
    };

    // Check if product exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", prod.slug)
      .single();

    if (existing) {
      // Update existing (don't overwrite stock_qty)
      const { error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          compare_at_price: productData.compare_at_price,
          category_id: productData.category_id,
        })
        .eq("id", existing.id);

      if (error) {
        console.log(`  [ERROR] ${prod.name}: ${error.message}`);
        stats.productsSkipped++;
      } else {
        console.log(`  [UPDATED] ${prod.name}`);
        stats.productsUpdated++;

        // Upsert product image if exists
        if (prod.image_url) {
          const localPath = getLocalImagePath(prod.image_url, prod.slug);
          await supabase
            .from("product_images")
            .upsert(
              {
                product_id: existing.id,
                url: localPath,
                alt_text: prod.name,
                sort_order: 0,
              },
              { onConflict: "product_id,sort_order" }
            );
        }
      }
    } else {
      // Insert new
      const { data: inserted, error } = await supabase
        .from("products")
        .insert(productData)
        .select("id")
        .single();

      if (error) {
        console.log(`  [ERROR] ${prod.name}: ${error.message}`);
        stats.productsSkipped++;
      } else {
        console.log(`  [CREATED] ${prod.name}`);
        stats.productsCreated++;

        // Insert product image if exists
        if (prod.image_url && inserted) {
          const localPath = getLocalImagePath(prod.image_url, prod.slug);
          await supabase.from("product_images").insert({
            product_id: inserted.id,
            url: localPath,
            alt_text: prod.name,
            sort_order: 0,
          });
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n" + "=".repeat(50));
  console.log("IMPORT SUMMARY");
  console.log("=".repeat(50));
  console.log("\nCategories:");
  console.log(`  Created: ${stats.categoriesCreated}`);
  console.log(`  Updated: ${stats.categoriesUpdated}`);
  console.log(`  Skipped: ${stats.categoriesSkipped}`);
  console.log("\nProducts:");
  console.log(`  Created: ${stats.productsCreated}`);
  console.log(`  Updated: ${stats.productsUpdated}`);
  console.log(`  Skipped: ${stats.productsSkipped}`);

  if (stats.productsFlagged.length > 0) {
    console.log("\nFlagged for manual review:");
    for (const name of stats.productsFlagged) {
      console.log(`  - ${name}`);
    }
  }

  console.log("\nImport complete!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
