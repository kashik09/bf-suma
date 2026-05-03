/**
 * Price Reconciliation Script
 *
 * Compares stored product prices against the official spreadsheet.
 * Outputs a markdown diff report for review before applying changes.
 *
 * Usage:
 *   npx tsx scripts/price-reconciliation.ts           # Generate report only
 *   npx tsx scripts/price-reconciliation.ts --apply   # Apply fixes (DANGEROUS)
 *
 * Requires: data/BF_SUMA_Website_Prices.xlsx
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const XLSX_PATH = resolve(process.cwd(), "data/BF_SUMA_Website_Prices.xlsx");
const REPORT_PATH = resolve(process.cwd(), "scripts/price-diff-report.md");
const APPLY_FLAG = process.argv.includes("--apply");

// ---------------------------------------------------------------------------
// Load environment
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SpreadsheetRow {
  sku: string;
  name: string;
  ugx: number;
  usd: number;
  kes: number;
}

interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  status: string;
}

interface DiffEntry {
  sku: string;
  name: string;
  storedUgx: number | null;
  officialUgx: number | null;
  diffPercent: number | null;
  storedCurrency: string | null;
  currencyCorrect: boolean;
  status: "match" | "mismatch" | "missing_in_db" | "missing_in_sheet";
}

// ---------------------------------------------------------------------------
// XLSX Parser (manual, no dependency)
// ---------------------------------------------------------------------------

async function parseXlsx(filePath: string): Promise<SpreadsheetRow[]> {
  // Dynamic import xlsx only when needed
  let XLSX: typeof import("xlsx");
  try {
    XLSX = await import("xlsx");
  } catch {
    console.error("xlsx package not installed. Run: npm install xlsx");
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const rows: SpreadsheetRow[] = [];

  for (const row of jsonData) {
    // Try to find SKU column (various possible names)
    const sku = String(
      row["Product ID"] || row["SKU"] || row["sku"] || row["product_id"] || ""
    ).trim();

    if (!sku) continue;

    // Try to find name column
    const name = String(
      row["Product Name"] || row["Name"] || row["name"] || row["product_name"] || ""
    ).trim();

    // Try to find price columns
    const ugx = parseFloat(
      String(row["Website Price UGX"] || row["UGX"] || row["ugx"] || row["Price UGX"] || "0")
        .replace(/,/g, "")
    ) || 0;

    const usd = parseFloat(
      String(row["Dist. Price (USD)"] || row["USD"] || row["usd"] || row["Price USD"] || "0")
        .replace(/[$,]/g, "")
    ) || 0;

    const kes = parseFloat(
      String(row["KES"] || row["kes"] || row["Price KES"] || "0")
        .replace(/,/g, "")
    ) || 0;

    if (ugx > 0 || usd > 0) {
      rows.push({ sku, name, ugx, usd, kes });
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Database queries
// ---------------------------------------------------------------------------

async function fetchAllProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, slug, name, price, currency, status")
    .order("sku");

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  return (data || []).map((p) => ({
    ...p,
    price: Number(p.price),
    currency: p.currency || "UGX"
  }));
}

// ---------------------------------------------------------------------------
// Reconciliation logic
// ---------------------------------------------------------------------------

function reconcile(
  spreadsheet: SpreadsheetRow[],
  products: ProductRow[]
): DiffEntry[] {
  const results: DiffEntry[] = [];
  const productsBySku = new Map(products.map((p) => [p.sku, p]));
  const spreadsheetBySku = new Map(spreadsheet.map((s) => [s.sku, s]));

  // Check all spreadsheet entries
  for (const sheet of spreadsheet) {
    const product = productsBySku.get(sheet.sku);

    if (!product) {
      results.push({
        sku: sheet.sku,
        name: sheet.name,
        storedUgx: null,
        officialUgx: sheet.ugx,
        diffPercent: null,
        storedCurrency: null,
        currencyCorrect: false,
        status: "missing_in_db"
      });
      continue;
    }

    const storedUgx = product.price;
    const officialUgx = sheet.ugx;
    const diff = storedUgx - officialUgx;
    const diffPercent = officialUgx > 0 ? (diff / officialUgx) * 100 : 0;
    const currencyCorrect = product.currency === "UGX";

    const isMatch = Math.abs(diffPercent) < 0.5 && currencyCorrect;

    results.push({
      sku: sheet.sku,
      name: sheet.name,
      storedUgx,
      officialUgx,
      diffPercent,
      storedCurrency: product.currency,
      currencyCorrect,
      status: isMatch ? "match" : "mismatch"
    });
  }

  // Check for products in DB but not in spreadsheet
  for (const product of products) {
    if (!spreadsheetBySku.has(product.sku)) {
      results.push({
        sku: product.sku,
        name: product.name,
        storedUgx: product.price,
        officialUgx: null,
        diffPercent: null,
        storedCurrency: product.currency,
        currencyCorrect: product.currency === "UGX",
        status: "missing_in_sheet"
      });
    }
  }

  return results.sort((a, b) => a.sku.localeCompare(b.sku));
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function generateReport(entries: DiffEntry[]): string {
  const now = new Date().toISOString();
  const matches = entries.filter((e) => e.status === "match");
  const mismatches = entries.filter((e) => e.status === "mismatch");
  const missingInDb = entries.filter((e) => e.status === "missing_in_db");
  const missingInSheet = entries.filter((e) => e.status === "missing_in_sheet");

  let report = `# Price Reconciliation Report

Generated: ${now}

## Summary

| Status | Count |
|--------|-------|
| ✅ Match | ${matches.length} |
| ❌ Mismatch | ${mismatches.length} |
| ⚠️ Missing in DB | ${missingInDb.length} |
| 📦 Missing in Sheet | ${missingInSheet.length} |
| **Total** | **${entries.length}** |

`;

  if (mismatches.length > 0) {
    report += `## ❌ Price Mismatches (${mismatches.length})

| SKU | Name | Stored UGX | Official UGX | Diff % | Currency |
|-----|------|------------|--------------|--------|----------|
`;
    for (const e of mismatches) {
      const diffStr = e.diffPercent !== null ? `${e.diffPercent > 0 ? "+" : ""}${e.diffPercent.toFixed(1)}%` : "—";
      const currencyFlag = e.currencyCorrect ? "✓" : `❌ ${e.storedCurrency}`;
      report += `| ${e.sku} | ${e.name} | ${e.storedUgx?.toLocaleString() || "—"} | ${e.officialUgx?.toLocaleString() || "—"} | ${diffStr} | ${currencyFlag} |\n`;
    }
    report += "\n";
  }

  if (missingInDb.length > 0) {
    report += `## ⚠️ Missing in Database (${missingInDb.length})

| SKU | Name | Official UGX |
|-----|------|--------------|
`;
    for (const e of missingInDb) {
      report += `| ${e.sku} | ${e.name} | ${e.officialUgx?.toLocaleString() || "—"} |\n`;
    }
    report += "\n";
  }

  if (missingInSheet.length > 0) {
    report += `## 📦 In Database but Missing from Spreadsheet (${missingInSheet.length})

| SKU | Name | Stored UGX | Currency |
|-----|------|------------|----------|
`;
    for (const e of missingInSheet) {
      report += `| ${e.sku} | ${e.name} | ${e.storedUgx?.toLocaleString() || "—"} | ${e.storedCurrency} |\n`;
    }
    report += "\n";
  }

  if (matches.length > 0) {
    report += `## ✅ Matches (${matches.length})

<details>
<summary>Click to expand</summary>

| SKU | Name | UGX |
|-----|------|-----|
`;
    for (const e of matches) {
      report += `| ${e.sku} | ${e.name} | ${e.storedUgx?.toLocaleString() || "—"} |\n`;
    }
    report += `
</details>

`;
  }

  return report;
}

// ---------------------------------------------------------------------------
// Apply changes (when --apply flag is used)
// ---------------------------------------------------------------------------

async function applyFixes(entries: DiffEntry[]): Promise<void> {
  const mismatches = entries.filter(
    (e) => e.status === "mismatch" && e.officialUgx !== null
  );

  if (mismatches.length === 0) {
    console.log("No mismatches to fix.");
    return;
  }

  console.log(`\nApplying ${mismatches.length} price fixes...\n`);

  for (const entry of mismatches) {
    const { error } = await supabase
      .from("products")
      .update({
        price: entry.officialUgx,
        currency: "UGX",
        updated_at: new Date().toISOString()
      })
      .eq("sku", entry.sku);

    if (error) {
      console.error(`  ❌ Failed to update ${entry.sku}:`, error.message);
    } else {
      console.log(
        `  ✓ ${entry.sku}: ${entry.storedUgx?.toLocaleString()} → ${entry.officialUgx?.toLocaleString()} UGX`
      );
    }
  }

  console.log("\nDone.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Price Reconciliation Script");
  console.log("===========================\n");

  // Check for xlsx file
  if (!existsSync(XLSX_PATH)) {
    console.error(`❌ Spreadsheet not found: ${XLSX_PATH}`);
    console.error("\nPlease place BF_SUMA_Website_Prices.xlsx in the data/ folder.");
    process.exit(1);
  }

  console.log(`Reading spreadsheet: ${XLSX_PATH}`);
  const spreadsheet = await parseXlsx(XLSX_PATH);
  console.log(`  Found ${spreadsheet.length} products in spreadsheet.\n`);

  console.log("Fetching products from database...");
  const products = await fetchAllProducts();
  console.log(`  Found ${products.length} products in database.\n`);

  console.log("Reconciling...\n");
  const results = reconcile(spreadsheet, products);

  const report = generateReport(results);
  writeFileSync(REPORT_PATH, report);
  console.log(`Report written to: ${REPORT_PATH}\n`);

  // Summary
  const matches = results.filter((e) => e.status === "match").length;
  const mismatches = results.filter((e) => e.status === "mismatch").length;
  const missingDb = results.filter((e) => e.status === "missing_in_db").length;
  const missingSheet = results.filter((e) => e.status === "missing_in_sheet").length;

  console.log("Summary:");
  console.log(`  ✅ Matches:           ${matches}`);
  console.log(`  ❌ Mismatches:        ${mismatches}`);
  console.log(`  ⚠️  Missing in DB:    ${missingDb}`);
  console.log(`  📦 Missing in Sheet: ${missingSheet}`);

  if (APPLY_FLAG) {
    console.log("\n⚠️  --apply flag detected. Applying fixes...");
    await applyFixes(results);
  } else if (mismatches > 0) {
    console.log("\nTo apply fixes, run:");
    console.log("  npx tsx scripts/price-reconciliation.ts --apply");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
