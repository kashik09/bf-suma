/**
 * Seed Packages Script
 *
 * Seeds the packages and package_items tables with client-provided data.
 * Matches products by name using ILIKE for fuzzy matching.
 *
 * Usage: npm run seed:packages
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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface PackageData {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  dm_keyword?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  products: string[];
}

const PACKAGES: PackageData[] = [
  {
    slug: "weight-management-loss",
    name: "Weight Management & Loss",
    tagline: "Support your weight goals with daily wellness essentials",
    description: "A daily stack combining hormonal balance, gut support, fat metabolism, and digestive health for sustained weight management results.",
    is_active: true,
    is_featured: false,
    sort_order: 10,
    products: ["Feminergy", "Gym Effect", "Ez-Xlim", "Probio 3 Plus", "Veggie Veggie"]
  },
  {
    slug: "weight-loss-reset-system",
    name: "Weight Loss Reset System",
    tagline: "1-Month Gut Cleanse → Fat Burn → Body Transformation",
    description: "A structured 4-step reset: cleanse, rebuild gut, block and burn, control calories. Includes guidance and support.",
    dm_keyword: "FIT",
    is_active: true,
    is_featured: true,
    sort_order: 1,
    products: ["Veggie Veggie", "Probio 3 Plus", "Ez-Xlim"]
  },
  {
    slug: "xpower-mens-health",
    name: "X Power Men's Health",
    tagline: "Energy, vitality, and confidence for men",
    description: "A men's wellness stack supporting energy, prostate health, and vitality.",
    is_active: true,
    is_featured: true,
    sort_order: 2,
    products: ["X Power Man Plus", "Xpower Coffee", "ProstatRelax", "ZaminoCal Plus"]
  },
  {
    slug: "blood-sugar-diabetic-pack",
    name: "Blood Sugar / Diabetic Pack",
    tagline: "Daily support for blood sugar balance",
    description: "A wellness stack supporting circulation, metabolism, and detoxification for those managing blood sugar concerns.",
    is_active: true,
    is_featured: false,
    sort_order: 20,
    products: ["Gym Effect", "MicrO2 Cycle", "NMN Coffee", "Pure & Broken Ganoderma Spores", "Detoxilive"]
  },
  {
    slug: "bone-joint-care",
    name: "Bone & Joint Care",
    tagline: "Stay mobile, stay strong",
    description: "A targeted stack for joint comfort, bone strength, and daily mobility.",
    is_active: true,
    is_featured: false,
    sort_order: 30,
    products: ["ZaminoCal Plus", "GluzoJoint Ultra", "Arthro Xtra", "Cool Roll"]
  },
  {
    slug: "womens-health-beauty",
    name: "Women's Health & Beauty",
    tagline: "Hormonal balance, beauty, and feminine wellness",
    description: "A complete women's wellness stack supporting hormonal balance, feminine hygiene, gut health, bone strength, and daily vitamins.",
    is_active: true,
    is_featured: true,
    sort_order: 3,
    products: ["Feminergy", "FemiCare", "Femibiotics", "FemiCalcium D3", "FemiVitamins"]
  },
  {
    slug: "fibroids-package",
    name: "Fibroids Package",
    tagline: "Targeted support for women's reproductive health",
    description: "A focused stack supporting hormonal balance, immunity, circulation, and detoxification.",
    is_active: true,
    is_featured: false,
    sort_order: 40,
    products: ["Feminergy", "Pure & Broken Ganoderma Spores", "MicrO2 Cycle", "Novel-Depile", "Refined Yunzhi Essence"]
  },
  {
    slug: "digestive-health-ulcers",
    name: "Digestive Health & Ulcers",
    tagline: "Restore gut comfort and digestive function",
    description: "A stack supporting probiotic balance, digestive comfort, and gut healing.",
    is_active: true,
    is_featured: false,
    sort_order: 50,
    products: ["Probio 3 Plus", "Novel-Depile", "NT Diarr", "Veggie Veggie", "Feminergy"]
  },
  {
    slug: "immunity-package",
    name: "Immunity Package",
    tagline: "Daily defense, naturally",
    description: "A premium immune-support stack featuring ganoderma, reishi, and adaptogenic mushroom-based formulations.",
    is_active: true,
    is_featured: true,
    sort_order: 4,
    products: ["Pure & Broken Ganoderma Spores", "Pure & Broken Ganoderma Oil", "Quad-Reishi", "Refined Yunzhi Essence", "Cordyceps Coffee", "Reishi Coffee", "Ginseng Coffee", "Sleep Beauty"]
  },
  {
    slug: "cardiovascular-health",
    name: "Cardiovascular Health",
    tagline: "Support your heart, circulation, and overall vitality",
    description: "A circulatory health stack combining mushroom-based blood support, fat metabolism, detox, and brain wellness.",
    is_active: true,
    is_featured: false,
    sort_order: 60,
    products: ["MicrO2 Cycle", "Gym Effect", "Detoxilive", "CereBrain"]
  },
  {
    slug: "kidney-health",
    name: "Kidney Health",
    tagline: "Daily detox and renal support",
    description: "A targeted stack supporting kidney function, detoxification, and digestive flow.",
    is_active: true,
    is_featured: false,
    sort_order: 70,
    products: ["Pure & Broken Ganoderma Spores", "Detoxilive", "Reishi Coffee", "Consti Relax", "Novel-Depile"]
  },
  {
    slug: "liver-health",
    name: "Liver Health",
    tagline: "Support your body's detox engine",
    description: "A stack supporting liver detoxification, immune function, and digestive flow.",
    is_active: true,
    is_featured: false,
    sort_order: 80,
    products: ["Pure & Broken Ganoderma Spores", "Quad-Reishi", "Detoxilive", "Consti Relax"]
  }
];

interface ProductMatch {
  id: string;
  name: string;
}

async function findProductByName(searchName: string): Promise<ProductMatch | null> {
  // Try exact match first
  const { data: exactMatch } = await supabase
    .from("products")
    .select("id, name")
    .ilike("name", searchName)
    .limit(1)
    .single();

  if (exactMatch) return exactMatch;

  // Try fuzzy match with wildcards
  const { data: fuzzyMatch } = await supabase
    .from("products")
    .select("id, name")
    .ilike("name", `%${searchName}%`)
    .limit(1)
    .single();

  if (fuzzyMatch) return fuzzyMatch;

  // Try matching without spaces/special chars
  const normalized = searchName.replace(/[^a-zA-Z0-9]/g, "%");
  const { data: normalizedMatch } = await supabase
    .from("products")
    .select("id, name")
    .ilike("name", `%${normalized}%`)
    .limit(1)
    .single();

  return normalizedMatch || null;
}

async function main() {
  console.log("Seed Packages Script");
  console.log("====================\n");

  const stats = {
    packagesCreated: 0,
    packagesUpdated: 0,
    productsLinked: 0,
    productsMissing: [] as { packageName: string; productName: string }[]
  };

  // Fetch all products for reference
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name")
    .order("name");

  console.log(`Found ${allProducts?.length || 0} products in database.\n`);

  for (const pkg of PACKAGES) {
    console.log(`Processing: ${pkg.name}`);

    // Upsert package
    const { data: upsertedPackage, error: pkgError } = await supabase
      .from("packages")
      .upsert(
        {
          slug: pkg.slug,
          name: pkg.name,
          tagline: pkg.tagline,
          description: pkg.description,
          dm_keyword: pkg.dm_keyword || null,
          is_active: pkg.is_active,
          is_featured: pkg.is_featured,
          sort_order: pkg.sort_order,
          currency: "UGX",
          override_price_minor: null,
          hero_image_url: null,
          infographic_image_url: null
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (pkgError || !upsertedPackage) {
      console.error(`  ERROR creating package: ${pkgError?.message}`);
      continue;
    }

    const packageId = upsertedPackage.id;
    stats.packagesCreated++;

    // Delete existing package_items for this package
    await supabase.from("package_items").delete().eq("package_id", packageId);

    // Match and insert products
    for (const productName of pkg.products) {
      const match = await findProductByName(productName);

      if (match) {
        const { error: itemError } = await supabase.from("package_items").insert({
          package_id: packageId,
          product_id: match.id,
          quantity: 1
        });

        if (itemError) {
          console.error(`  ERROR linking product "${productName}": ${itemError.message}`);
        } else {
          console.log(`  + ${productName} → ${match.name}`);
          stats.productsLinked++;
        }
      } else {
        console.log(`  ! MISSING: "${productName}"`);
        stats.productsMissing.push({ packageName: pkg.name, productName });
      }
    }

    console.log("");
  }

  // Summary
  console.log("====================");
  console.log("SUMMARY");
  console.log("====================");
  console.log(`Packages created/updated: ${stats.packagesCreated}`);
  console.log(`Products linked: ${stats.productsLinked}`);
  console.log(`Products missing: ${stats.productsMissing.length}`);

  if (stats.productsMissing.length > 0) {
    console.log("\nMISSING PRODUCTS:");
    console.log("-----------------");
    for (const missing of stats.productsMissing) {
      console.log(`  [${missing.packageName}] → "${missing.productName}"`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
