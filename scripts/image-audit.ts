/**
 * Image Audit Script
 *
 * Generates a report of all product images for client review.
 * Identifies: missing images, placeholders, duplicates.
 *
 * Usage: npx tsx scripts/image-audit.ts
 * Output: scripts/image-audit-report.md
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const REPORT_PATH = resolve(process.cwd(), "scripts/image-audit-report.md");
const PLACEHOLDER_PATTERNS = [
  /placeholder/i,
  /coming-soon/i,
  /no-image/i,
  /default/i
];

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
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  status: string;
  category_name: string;
  image_url: string | null;
}

interface RawProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  status: string;
  categories: { name: string } | null;
  product_images: Array<{ url: string; sort_order: number }>;
}

type ImageStatus = "HAS_IMAGE" | "PLACEHOLDER" | "NULL" | "DUPLICATE";

interface AuditEntry {
  sku: string;
  name: string;
  category: string;
  imageUrl: string | null;
  status: ImageStatus;
  duplicateOf?: string;
}

function isPlaceholder(url: string | null): boolean {
  if (!url) return false;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(url));
}

function getImageStatus(url: string | null, duplicateUrls: Set<string>): ImageStatus {
  if (!url) return "NULL";
  if (isPlaceholder(url)) return "PLACEHOLDER";
  if (duplicateUrls.has(url)) return "DUPLICATE";
  return "HAS_IMAGE";
}

function statusIcon(status: ImageStatus): string {
  switch (status) {
    case "HAS_IMAGE":
      return "✅";
    case "PLACEHOLDER":
      return "⚠️";
    case "NULL":
      return "❌";
    case "DUPLICATE":
      return "🔁";
  }
}

async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      sku,
      slug,
      name,
      status,
      categories(name),
      product_images(url, sort_order)
    `)
    .order("sku");

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  return (data || []).map((p: unknown) => {
    const row = p as RawProductRow;
    // Get primary image (lowest sort_order)
    const sortedImages = [...(row.product_images || [])].sort((a, b) => a.sort_order - b.sort_order);
    const primaryImage = sortedImages[0]?.url || null;

    return {
      id: row.id,
      sku: row.sku,
      slug: row.slug,
      name: row.name,
      status: row.status,
      image_url: primaryImage,
      category_name: row.categories?.name || "Uncategorized"
    };
  });
}

function findDuplicates(products: ProductRow[]): Map<string, string[]> {
  const urlToProducts = new Map<string, string[]>();

  for (const p of products) {
    if (!p.image_url || isPlaceholder(p.image_url)) continue;

    const existing = urlToProducts.get(p.image_url) || [];
    existing.push(p.sku);
    urlToProducts.set(p.image_url, existing);
  }

  // Filter to only duplicates
  const duplicates = new Map<string, string[]>();
  for (const [url, skus] of urlToProducts) {
    if (skus.length > 1) {
      duplicates.set(url, skus);
    }
  }

  return duplicates;
}

function generateReport(products: ProductRow[], duplicates: Map<string, string[]>): string {
  const now = new Date().toISOString();
  const duplicateUrls = new Set(duplicates.keys());

  // Build audit entries
  const entries: AuditEntry[] = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.category_name,
    imageUrl: p.image_url,
    status: getImageStatus(p.image_url, duplicateUrls)
  }));

  // Group by category
  const byCategory = new Map<string, AuditEntry[]>();
  for (const entry of entries) {
    const list = byCategory.get(entry.category) || [];
    list.push(entry);
    byCategory.set(entry.category, list);
  }

  // Count stats
  const stats = {
    total: entries.length,
    hasImage: entries.filter((e) => e.status === "HAS_IMAGE").length,
    placeholder: entries.filter((e) => e.status === "PLACEHOLDER").length,
    null: entries.filter((e) => e.status === "NULL").length,
    duplicate: entries.filter((e) => e.status === "DUPLICATE").length
  };

  let report = `# Product Image Audit Report

Generated: ${now}

## Summary

| Status | Count |
|--------|-------|
| ✅ Has Image | ${stats.hasImage} |
| ⚠️ Placeholder | ${stats.placeholder} |
| ❌ No Image (NULL) | ${stats.null} |
| 🔁 Duplicate URL | ${stats.duplicate} |
| **Total Products** | **${stats.total}** |

---

## Products by Category

`;

  // Sort categories alphabetically
  const sortedCategories = [...byCategory.keys()].sort();

  for (const category of sortedCategories) {
    const categoryEntries = byCategory.get(category) || [];
    report += `### ${category}\n\n`;
    report += `| Status | SKU | Product Name | Image URL |\n`;
    report += `|--------|-----|--------------|----------|\n`;

    for (const entry of categoryEntries.sort((a, b) => a.sku.localeCompare(b.sku))) {
      const urlDisplay = entry.imageUrl
        ? entry.imageUrl.length > 50
          ? `${entry.imageUrl.slice(0, 47)}...`
          : entry.imageUrl
        : "—";
      report += `| ${statusIcon(entry.status)} | ${entry.sku} | ${entry.name} | ${urlDisplay} |\n`;
    }

    report += "\n";
  }

  // Duplicate section
  if (duplicates.size > 0) {
    report += `---

## 🔁 Duplicate Image URLs

The following image URLs are used by multiple products:

`;
    for (const [url, skus] of duplicates) {
      const shortUrl = url.length > 60 ? `${url.slice(0, 57)}...` : url;
      report += `### \`${shortUrl}\`\n\n`;
      report += `Used by: ${skus.join(", ")}\n\n`;
    }
  }

  report += `---

## Action Items

1. Upload images for products marked ❌ (NULL)
2. Replace placeholder images marked ⚠️
3. Review duplicate images marked 🔁 — ensure each product has a unique image

*This report is for client review. No changes have been made to the database.*
`;

  return report;
}

async function main() {
  console.log("Image Audit Script");
  console.log("==================\n");

  console.log("Fetching products...");
  const products = await fetchProducts();
  console.log(`  Found ${products.length} products.\n`);

  console.log("Analyzing images...");
  const duplicates = findDuplicates(products);
  console.log(`  Found ${duplicates.size} duplicate image URLs.\n`);

  console.log("Generating report...");
  const report = generateReport(products, duplicates);
  writeFileSync(REPORT_PATH, report);
  console.log(`  Report saved to: ${REPORT_PATH}\n`);

  // Print summary
  const nullCount = products.filter((p) => !p.image_url).length;
  const placeholderCount = products.filter((p) => isPlaceholder(p.image_url)).length;
  console.log("Summary:");
  console.log(`  ❌ Missing images: ${nullCount}`);
  console.log(`  ⚠️ Placeholders: ${placeholderCount}`);
  console.log(`  🔁 Duplicates: ${duplicates.size} URLs shared by multiple products`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
