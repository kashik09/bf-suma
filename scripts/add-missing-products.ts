/**
 * Add Missing Products Script
 *
 * Adds Sleep Beauty and FemiVitamins to the products table.
 * Idempotent: uses ON CONFLICT (sku) DO UPDATE.
 *
 * Usage: npx tsx scripts/add-missing-products.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load environment
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Category IDs from database
const CATEGORIES = {
  immuneBoosters: "75e27fc7-a211-42e4-a51d-54e7e4061884",
  womensHealth: "6f6976ad-4ecd-4490-87da-509af0f19f10"
} as const;

// Products to add (from spreadsheet data/BF_SUMA_Website_Prices.xlsx)
const PRODUCTS = [
  {
    sku: "AP209B",
    name: "Sleep Beauty",
    slug: "sleep-beauty",
    description: "Supports restful sleep and skin rejuvenation for overnight wellness.",
    price: 72000, // Retail UGX
    compare_at_price: null,
    currency: "UGX",
    stock_qty: 50,
    status: "ACTIVE",
    category_id: CATEGORIES.immuneBoosters
  },
  {
    sku: "AP211A",
    name: "FemiVitamins",
    slug: "femivitamins",
    description: "Essential vitamins formulated for women's daily health and vitality.",
    price: 81000, // Retail UGX
    compare_at_price: null,
    currency: "UGX",
    stock_qty: 50,
    status: "ACTIVE",
    category_id: CATEGORIES.womensHealth
  }
];

async function main() {
  console.log("Add Missing Products Script");
  console.log("===========================\n");

  for (const product of PRODUCTS) {
    console.log(`Adding ${product.sku} - ${product.name}...`);

    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "sku" })
      .select("id, sku, name, price, category_id")
      .single();

    if (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    } else {
      console.log(`  ✓ ${data.sku} - ${data.name} @ ${data.price.toLocaleString()} UGX`);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
