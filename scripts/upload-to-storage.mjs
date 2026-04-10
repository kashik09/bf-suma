#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PROJECT_ROOT = process.cwd();
const ENV_FILE = path.join(PROJECT_ROOT, ".env.local");
const CATALOG_DIR = path.join(PROJECT_ROOT, "public", "catalog-images");
const BUCKET = "product-images";
const LEGACY_HOST_FRAGMENT = "bfsumaproducts.co.ke";
// templateId: number  → image sourced from bfsumaproducts.co.ke Odoo URL
// templateId: null    → image is a slug-named flat file in public/catalog-images/
const EXTRA_UPLOADS = [
  { slug: "detoxilive-pro-oil-capsules", templateId: 42 },
  { slug: "nmn-coffee", templateId: null },
  { slug: "nmn-duo-release", templateId: null },
  { slug: "nmn-sharp-mind", templateId: null },
  { slug: "derma-repair-lotion", templateId: null },
  { slug: "purewell-water-purifier", templateId: null },
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function listFilesRecursively(dirPath) {
  const files = [];

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpeg") {
    return "jpg";
  }
  return ext.replace(".", "");
}

function contentTypeFromExt(ext) {
  if (ext === "jpg") {
    return "image/jpeg";
  }
  if (ext === "png") {
    return "image/png";
  }
  if (ext === "webp") {
    return "image/webp";
  }
  return null;
}

function extractTemplateIdFromFilename(filePath) {
  const base = path.basename(filePath);
  const match = base.match(/^(\d+)_/);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function extractTemplateIdFromLegacyUrl(url) {
  const match = url.match(/product\.template\/(\d+)\/image_512/i);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function getSlugFromJoinedRow(row) {
  const rel = row.products;
  if (Array.isArray(rel)) {
    return rel[0]?.slug ?? null;
  }

  if (rel && typeof rel === "object") {
    return rel.slug ?? null;
  }

  return null;
}

async function fetchLegacyProductImageRows(supabase) {
  const joined = await supabase
    .from("product_images")
    .select("id, product_id, url, products!inner(slug)")
    .ilike("url", `%${LEGACY_HOST_FRAGMENT}%`);

  if (!joined.error && joined.data) {
    return joined.data.map((row) => ({
      id: row.id,
      url: row.url,
      slug: getSlugFromJoinedRow(row),
    }));
  }

  const imagesResult = await supabase
    .from("product_images")
    .select("id, product_id, url")
    .ilike("url", `%${LEGACY_HOST_FRAGMENT}%`);

  if (imagesResult.error) {
    throw new Error(`Failed to query legacy product_images rows: ${imagesResult.error.message}`);
  }

  const productsResult = await supabase.from("products").select("id, slug");
  if (productsResult.error) {
    throw new Error(`Failed to query products for slug join: ${productsResult.error.message}`);
  }

  const slugByProductId = new Map((productsResult.data ?? []).map((p) => [p.id, p.slug]));

  return (imagesResult.data ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    slug: slugByProductId.get(row.product_id) ?? null,
  }));
}

async function main() {
  loadEnvFile(ENV_FILE);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing required env vars. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  if (!fs.existsSync(CATALOG_DIR)) {
    console.error(`Catalog image directory not found: ${CATALOG_DIR}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const allFiles = listFilesRecursively(CATALOG_DIR);
  const localFiles = allFiles.filter((filePath) => path.basename(filePath) !== "placeholder.svg");

  const localByTemplateId = new Map();
  const localBySlug = new Map();

  for (const filePath of localFiles) {
    const base = path.basename(filePath);
    const ext = normalizeExt(filePath);
    const contentType = contentTypeFromExt(ext);
    if (!contentType) {
      continue;
    }

    const templateId = extractTemplateIdFromFilename(filePath);
    if (templateId) {
      if (!localByTemplateId.has(templateId)) {
        localByTemplateId.set(templateId, { filePath, ext, contentType });
      }
    } else {
      // Flat slug-named file: e.g. "nmn-coffee.webp" → slug "nmn-coffee"
      const extWithDot = path.extname(base);
      const slug = base.slice(0, base.length - extWithDot.length);
      if (slug && !localBySlug.has(slug)) {
        localBySlug.set(slug, { filePath, ext, contentType });
      }
    }
  }

  const legacyRows = await fetchLegacyProductImageRows(supabase);
  const uploadRowsBySlug = new Map(
    legacyRows
      .filter((row) => row.slug)
      .map((row) => [row.slug, row])
  );

  for (const extra of EXTRA_UPLOADS) {
    if (!uploadRowsBySlug.has(extra.slug)) {
      uploadRowsBySlug.set(extra.slug, {
        id: null,
        slug: extra.slug,
        url: `https://www.bfsumaproducts.co.ke/web/image/product.template/${extra.templateId}/image_512`,
      });
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (const row of uploadRowsBySlug.values()) {
    const slug = row.slug;
    if (!slug) {
      console.error(`[FAIL] product_images.id=${row.id}: missing product slug relation`);
      failCount += 1;
      continue;
    }

    const templateId = extractTemplateIdFromLegacyUrl(row.url ?? "");
    const localImage =
      (templateId ? localByTemplateId.get(templateId) : null) ?? localBySlug.get(slug);

    if (!localImage) {
      if (!templateId) {
        console.error(`[FAIL] ${slug}: no local image found (no template id in URL and no slug-named file)`);
      } else {
        console.error(`[FAIL] ${slug}: no local image found for template id ${templateId}`);
      }
      failCount += 1;
      continue;
    }

    const objectPath = `${slug}.${localImage.ext}`;
    const fileBuffer = fs.readFileSync(localImage.filePath);

    const uploadResult = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, fileBuffer, {
        contentType: localImage.contentType,
        upsert: true,
      });

    if (uploadResult.error) {
      console.error(`[FAIL] ${slug}: ${uploadResult.error.message}`);
      failCount += 1;
      continue;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    console.log(`[OK] ${slug} -> ${publicData.publicUrl}`);
    successCount += 1;
  }

  console.log("\nUpload complete.");
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

main().catch((error) => {
  console.error("Fatal error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
