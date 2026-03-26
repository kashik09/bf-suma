import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const tmpDir = path.join(repoRoot, "tests", ".tmp");

const transpiledModuleCache = new Map();

async function loadTsModule(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  if (transpiledModuleCache.has(absolutePath)) {
    return import(pathToFileURL(transpiledModuleCache.get(absolutePath)).href);
  }

  const source = await fs.readFile(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    },
    fileName: absolutePath
  });

  await fs.mkdir(tmpDir, { recursive: true });
  const outPath = path.join(
    tmpDir,
    `${path.basename(relativePath, ".ts")}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.mjs`
  );

  await fs.writeFile(outPath, transpiled.outputText, "utf8");
  transpiledModuleCache.set(absolutePath, outPath);

  return import(pathToFileURL(outPath).href);
}

function buildPayload({
  productId = "prod-1",
  productPrice = 205400,
  quantity = 1,
  subtotal = productPrice,
  deliveryFee = 5000,
  total = subtotal + deliveryFee
} = {}) {
  return {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+256700000000",
    fulfillmentType: "delivery",
    deliveryAddress: "Kampala",
    pickupLocation: "Main Store - Kampala",
    paymentMethod: "pay_on_delivery",
    notes: "hardening-test",
    items: [
      {
        product_id: productId,
        slug: "test-product",
        name: "Test Product",
        price: productPrice,
        currency: "KES",
        image_url: "/catalog-images/test.webp",
        quantity,
        max_quantity: 10,
        availability: "in_stock"
      }
    ],
    subtotal,
    deliveryFee,
    total
  };
}

test("checkout schema enforces launch payment contract and image URL validation", async () => {
  const validation = await loadTsModule("src/lib/validation.ts");

  const valid = validation.orderIntakeSchema.safeParse(buildPayload());
  assert.equal(valid.success, true, "Expected canonical payload to pass validation");

  const malformedPayload = buildPayload({ productId: "prod-2" });
  malformedPayload.items[0].image_url = "catalog-images/test.webp";
  const invalidImage = validation.orderIntakeSchema.safeParse(malformedPayload);
  assert.equal(invalidImage.success, false, "Expected malformed image URL to fail validation");

  const invalidPaymentPayload = buildPayload({ productId: "prod-3" });
  invalidPaymentPayload.paymentMethod = "pay_now";
  const invalidPayment = validation.orderIntakeSchema.safeParse(invalidPaymentPayload);
  assert.equal(invalidPayment.success, false, "Expected pay_now to be rejected by launch contract");

  const invalidCurrencyPayload = buildPayload({ productId: "prod-4" });
  invalidCurrencyPayload.items[0].currency = "UGX";
  const invalidCurrency = validation.orderIntakeSchema.safeParse(invalidCurrencyPayload);
  assert.equal(invalidCurrency.success, false, "Expected non-KES cart item currency to be rejected");
});

test("server repricing logic rejects tampering and computes authoritative totals", async () => {
  const commerce = await loadTsModule("src/lib/commerce-integrity.ts");

  const products = [
    {
      id: "prod-1",
      name: "Cordyceps Coffee",
      price: 205400,
      currency: "KES",
      status: "ACTIVE",
      stock_qty: 50
    }
  ];

  const honestPayload = buildPayload({ productId: "prod-1", productPrice: 205400 });
  const honest = commerce.computeAuthoritativeOrder(honestPayload, products, {
    deliveryFeeAmount: 5000,
    storeCurrency: "KES"
  });

  assert.equal(honest.subtotal, 205400);
  assert.equal(honest.deliveryFee, 5000);
  assert.equal(honest.total, 210400);
  assert.equal(honest.currency, "KES");

  const tamperedTotalPayload = buildPayload({ productId: "prod-1", total: 1000 });
  assert.throws(
    () => commerce.computeAuthoritativeOrder(tamperedTotalPayload, products, {
      deliveryFeeAmount: 5000,
      storeCurrency: "KES"
    }),
    /totals do not match current pricing/i
  );

  const tamperedPricePayload = buildPayload({ productId: "prod-1", productPrice: 1, subtotal: 1, total: 5001 });
  assert.throws(
    () => commerce.computeAuthoritativeOrder(tamperedPricePayload, products, {
      deliveryFeeAmount: 5000,
      storeCurrency: "KES"
    }),
    /item prices changed/i
  );

  const missingProductPayload = buildPayload({ productId: "missing-prod" });
  assert.throws(
    () => commerce.computeAuthoritativeOrder(missingProductPayload, products, {
      deliveryFeeAmount: 5000,
      storeCurrency: "KES"
    }),
    /no longer available/i
  );

  const outOfStockPayload = buildPayload({ productId: "prod-1", quantity: 99, subtotal: 205400 * 99, total: 205400 * 99 + 5000 });
  assert.throws(
    () => commerce.computeAuthoritativeOrder(outOfStockPayload, products, {
      deliveryFeeAmount: 5000,
      storeCurrency: "KES"
    }),
    /do not have enough stock/i
  );
});

test("idempotency decision logic enforces replay/conflict/in-progress behavior", async () => {
  const idempotency = await loadTsModule("src/lib/idempotency-decision.ts");
  const now = Date.now();
  const futureIso = new Date(now + 60_000).toISOString();
  const pastIso = new Date(now - 60_000).toISOString();

  assert.deepEqual(idempotency.evaluateIdempotencyDecision(null, "hash-a", now), { kind: "initialize" });

  const successRow = {
    request_hash: "hash-a",
    status: "SUCCEEDED",
    expires_at: futureIso,
    response_payload: {}
  };
  assert.deepEqual(idempotency.evaluateIdempotencyDecision(successRow, "hash-a", now), { kind: "replay" });
  assert.deepEqual(idempotency.evaluateIdempotencyDecision(successRow, "hash-b", now), { kind: "conflict" });

  const inProgressRow = {
    request_hash: "hash-a",
    status: "IN_PROGRESS",
    expires_at: futureIso,
    response_payload: null
  };
  assert.deepEqual(idempotency.evaluateIdempotencyDecision(inProgressRow, "hash-a", now), { kind: "in_progress" });

  const failedFresh = {
    request_hash: "hash-a",
    status: "FAILED",
    expires_at: futureIso,
    response_payload: null
  };
  assert.deepEqual(idempotency.evaluateIdempotencyDecision(failedFresh, "hash-b", now), { kind: "conflict" });

  const failedExpired = {
    request_hash: "hash-a",
    status: "FAILED",
    expires_at: pastIso,
    response_payload: null
  };
  assert.deepEqual(idempotency.evaluateIdempotencyDecision(failedExpired, "hash-a", now), { kind: "recycle" });
});

test("atomic order RPC result parsing enforces deterministic write outcomes", async () => {
  const atomicResult = await loadTsModule("src/lib/order-write-result.ts");

  const created = atomicResult.parseAtomicOrderWriteRpcRow({
    result_code: "CREATED",
    message: "created",
    response_payload: {
      orderId: "ord_1",
      orderNumber: "BFS-20260326123456-1234",
      receivedAt: "2026-03-26T12:34:56.000Z",
      subtotal: 205400,
      deliveryFee: 5000,
      total: 210400,
      currency: "KES"
    },
    field_errors: null
  });
  assert.equal(created.kind, "created");

  const replayed = atomicResult.parseAtomicOrderWriteRpcRow({
    result_code: "REPLAYED",
    message: "replay",
    response_payload: {
      orderId: "ord_1",
      orderNumber: "BFS-20260326123456-1234",
      receivedAt: "2026-03-26T12:34:56.000Z",
      subtotal: 205400,
      deliveryFee: 5000,
      total: 210400,
      currency: "KES"
    },
    field_errors: null
  });
  assert.equal(replayed.kind, "replayed");

  const rejected = atomicResult.parseAtomicOrderWriteRpcRow({
    result_code: "REJECTED",
    message: "totals mismatch",
    response_payload: null,
    field_errors: { total: ["Submitted totals do not match current server pricing."] }
  });
  assert.equal(rejected.kind, "rejected");
  assert.deepEqual(rejected.fieldErrors, { total: ["Submitted totals do not match current server pricing."] });

  const conflict = atomicResult.parseAtomicOrderWriteRpcRow({
    result_code: "CONFLICT",
    message: "conflict",
    response_payload: null,
    field_errors: null
  });
  assert.equal(conflict.kind, "conflict");

  const inProgress = atomicResult.parseAtomicOrderWriteRpcRow({
    result_code: "IN_PROGRESS",
    message: "in progress",
    response_payload: null,
    field_errors: null
  });
  assert.equal(inProgress.kind, "in_progress");

  const temporaryFailure = atomicResult.parseAtomicOrderWriteRpcRow({
    result_code: "TEMPORARY_FAILURE",
    message: "temporary failure",
    response_payload: null,
    field_errors: null
  });
  assert.equal(temporaryFailure.kind, "temporary_failure");

  assert.throws(
    () =>
      atomicResult.parseAtomicOrderWriteRpcRow({
        result_code: "CREATED",
        message: "bad payload",
        response_payload: { orderId: "ord_1" },
        field_errors: null
      }),
    /Invalid RPC response/
  );
});

test("money model helpers enforce canonical minor-unit behavior", async () => {
  const utils = await loadTsModule("src/lib/utils.ts");

  assert.equal(utils.STORE_CURRENCY, "KES");
  assert.equal(utils.toMinorUnits(5371, "KES"), 537100);
  assert.equal(utils.fromMinorUnits(537100, "KES"), 5371);

  const formatted = utils.formatCurrency(205400, "KES");
  assert.match(formatted, /KES/);
  assert.match(formatted, /2,054/);
});

test("route guard logic blocks admin scaffolds and hidden surfaces", async () => {
  const guards = await loadTsModule("src/lib/route-guards.ts");

  assert.equal(guards.isAdminRoute("/admin"), true);
  assert.equal(guards.isScaffoldAdminRoute("/admin/orders"), true);
  assert.equal(guards.isScaffoldAdminRoute("/admin/customers/123"), true);
  assert.equal(guards.isFaqRoute("/faq"), true);

  assert.equal(guards.isScaffoldApiRoute("/api/customers"), true);
  assert.equal(guards.isScaffoldApiRoute("/api/customers/abc"), true);
  assert.equal(guards.isScaffoldApiRoute("/api/analytics/overview"), true);
  assert.equal(guards.isScaffoldApiRoute("/api/orders/abc"), true);
  assert.equal(guards.isScaffoldApiRoute("/api/orders"), false);
  assert.equal(guards.isScaffoldApiRoute("/api/orders/"), false);
});

test("catalog degraded contract is explicit and checkout can be gated fail-safe", async () => {
  const catalogHealth = await loadTsModule("src/lib/catalog-health.ts");

  const live = catalogHealth.buildLiveCatalogHealth();
  assert.equal(live.source, "live");
  assert.equal(live.commerceReady, true);
  assert.equal(live.degradedReason, null);
  assert.deepEqual(catalogHealth.buildCatalogResponseHeaders(live), {
    "X-Catalog-Source": "live",
    "X-Commerce-Ready": "true"
  });

  const degraded = catalogHealth.buildFallbackCatalogHealth("Missing Supabase server environment variables.");
  assert.equal(degraded.source, "fallback");
  assert.equal(degraded.commerceReady, false);
  assert.match(catalogHealth.getCommerceDegradedMessage(degraded), /checkout is temporarily disabled/i);

  const degradedHeaders = catalogHealth.buildCatalogResponseHeaders(degraded);
  assert.equal(degradedHeaders["X-Catalog-Source"], "fallback");
  assert.equal(degradedHeaders["X-Commerce-Ready"], "false");
  assert.equal(degradedHeaders["X-Commerce-Degraded"], "true");
  assert.equal(degradedHeaders["X-Commerce-Degraded-Reason"], "Missing Supabase server environment variables.");

  const readOnlyProducts = catalogHealth.coerceProductsToReadOnly([
    { id: "prod-1", status: "ACTIVE", stock_qty: 42, availability: "in_stock" }
  ]);
  assert.equal(readOnlyProducts[0].status, "OUT_OF_STOCK");
  assert.equal(readOnlyProducts[0].stock_qty, 0);
  assert.equal(readOnlyProducts[0].availability, "out_of_stock");
});
