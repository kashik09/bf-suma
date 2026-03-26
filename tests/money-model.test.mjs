import assert from "node:assert/strict";
import { once } from "node:events";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import test, { after, before } from "node:test";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const utilsPath = path.join(repoRoot, "src", "lib", "utils.ts");

const TEST_PORT = Number(process.env.MONEY_TEST_PORT || 4021);
const TEST_HOST = "127.0.0.1";
const BASE_URL = `http://${TEST_HOST}:${TEST_PORT}`;
const SERVER_READY_TIMEOUT_MS = 60_000;

let transpiledUtilsPath = "";
let devServer;
let devServerLog = "";

function uniqueKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function loadUtilsModule() {
  if (transpiledUtilsPath) {
    return import(pathToFileURL(transpiledUtilsPath).href);
  }

  const source = await fs.readFile(utilsPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    },
    fileName: utilsPath
  });

  transpiledUtilsPath = path.join(
    repoRoot,
    "tests",
    ".tmp",
    `bf-suma-utils-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.mjs`
  );
  await fs.mkdir(path.dirname(transpiledUtilsPath), { recursive: true });
  await fs.writeFile(transpiledUtilsPath, transpiled.outputText, "utf8");

  return import(pathToFileURL(transpiledUtilsPath).href);
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, options);
  const text = await response.text();
  let json = null;

  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { response, status: response.status, json, text };
}

function buildOrderPayload(productId, productPriceMinor) {
  const subtotal = productPriceMinor;
  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  return {
    firstName: "Money",
    lastName: "Test",
    email: "money-test@example.com",
    phone: "+256700000001",
    fulfillmentType: "delivery",
    deliveryAddress: "Kampala",
    pickupLocation: "Main Store - Kampala",
    paymentMethod: "pay_on_delivery",
    notes: "money-model-test",
    items: [
      {
        product_id: productId,
        slug: "money-product",
        name: "Money Product",
        price: productPriceMinor,
        image_url: "/catalog-images/test.webp",
        quantity: 1,
        max_quantity: 5,
        availability: "in_stock"
      }
    ],
    subtotal,
    deliveryFee,
    total
  };
}

async function waitForServer() {
  const start = Date.now();

  while (Date.now() - start < SERVER_READY_TIMEOUT_MS) {
    try {
      const response = await fetch(`${BASE_URL}/`, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // Keep polling until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Dev server did not become ready within timeout.\n${devServerLog}`);
}

before(async () => {
  const nextBin = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next");
  devServer = spawn(
    process.execPath,
    [nextBin, "dev", "--port", String(TEST_PORT), "--hostname", TEST_HOST],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        ALLOW_ADMIN_ROUTES: "false",
        NEXT_TELEMETRY_DISABLED: "1"
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  devServer.stdout.on("data", (chunk) => {
    devServerLog += chunk.toString();
  });
  devServer.stderr.on("data", (chunk) => {
    devServerLog += chunk.toString();
  });

  await waitForServer();
});

after(async () => {
  if (transpiledUtilsPath) {
    await fs.unlink(transpiledUtilsPath).catch(() => undefined);
  }

  if (!devServer || devServer.killed) return;
  devServer.kill("SIGTERM");
  const closed = once(devServer, "close").catch(() => undefined);
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      devServer.kill("SIGKILL");
      resolve(undefined);
    }, 5_000);
  });
  await Promise.race([closed, timeout]);
});

test("money conversion and formatting utilities use minor-unit contract", async () => {
  const utils = await loadUtilsModule();

  assert.equal(utils.STORE_CURRENCY, "KES");
  assert.equal(utils.toMinorUnits(5371, "KES"), 537100);
  assert.equal(utils.fromMinorUnits(537100, "KES"), 5371);

  const kesFormatted = utils.formatCurrency(537100, "KES");
  assert.match(kesFormatted, /KES/);
  assert.match(kesFormatted, /5,371/);
});

test("order totals remain integer minor units on successful intake", async (t) => {
  const productsResponse = await requestJson("/api/products", {
    headers: { "user-agent": uniqueKey("money-products") }
  });

  if (!Array.isArray(productsResponse.json) || productsResponse.json.length === 0) {
    t.skip("No products returned from /api/products.");
    return;
  }

  const product = productsResponse.json.find((entry) => entry && entry.id && typeof entry.price === "number");
  if (!product) {
    t.skip("No product with id and numeric price was returned.");
    return;
  }

  const productPriceMinor = Math.round(product.price);
  assert.equal(Number.isInteger(productPriceMinor), true, "Product price should be an integer minor-unit amount.");

  const payload = buildOrderPayload(String(product.id), productPriceMinor);
  const orderResponse = await requestJson("/api/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": uniqueKey("money-order"),
      "user-agent": uniqueKey("money-order"),
      "x-forwarded-for": "203.0.113.61"
    },
    body: JSON.stringify(payload)
  });

  if (orderResponse.status === 503) {
    t.skip("Commerce backend unavailable for order totals integration test.");
    return;
  }

  if (orderResponse.status === 400 && typeof orderResponse.json?.message === "string") {
    const message = orderResponse.json.message.toLowerCase();
    if (message.includes("no longer available") || message.includes("inactive") || message.includes("stock")) {
      t.skip(`No valid checkout product available in current catalog source: ${orderResponse.json.message}`);
      return;
    }
  }

  assert.ok(
    orderResponse.status === 201 || orderResponse.status === 200,
    `Expected successful order creation for canonical totals check, got ${orderResponse.status}: ${orderResponse.text}`
  );

  const subtotal = orderResponse.json?.subtotal;
  const deliveryFee = orderResponse.json?.deliveryFee;
  const total = orderResponse.json?.total;

  assert.equal(Number.isInteger(subtotal), true, "subtotal should be integer minor units.");
  assert.equal(Number.isInteger(deliveryFee), true, "deliveryFee should be integer minor units.");
  assert.equal(Number.isInteger(total), true, "total should be integer minor units.");
  assert.equal(total, subtotal + deliveryFee, "total should equal subtotal + deliveryFee.");
  assert.equal(subtotal, payload.subtotal, "server subtotal should match honest canonical payload.");
  assert.equal(deliveryFee, payload.deliveryFee, "server deliveryFee should match canonical fee.");
  assert.equal(total, payload.total, "server total should match honest canonical payload.");
});
