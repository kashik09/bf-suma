import { once } from "node:events";
import { spawn } from "node:child_process";
import path from "node:path";
import { after, before } from "node:test";
import { fileURLToPath } from "node:url";
import {
  SERVER_READY_TIMEOUT_MS,
  TEST_SERVER_HOST,
  TEST_SERVER_PORT,
  TEST_TIMEOUT_MS
} from "./critical-path.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

let devServer;
let devServerLog = "";

export { TEST_TIMEOUT_MS };
export const baseUrl = `http://${TEST_SERVER_HOST}:${TEST_SERVER_PORT}`;

export function uniqueKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildOrderPayload({ productId, productPrice, notes = "", imageUrl = "/catalog-images/test.webp" }) {
  const subtotal = productPrice;
  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  return {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+256700000000",
    fulfillmentType: "delivery",
    deliveryAddress: "Kampala",
    pickupLocation: "Main Store - Kampala",
    paymentMethod: "pay_on_delivery",
    notes,
    items: [
      {
        product_id: productId,
        slug: "test-product",
        name: "Test Product",
        price: productPrice,
        image_url: imageUrl,
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

function isCommerceUnavailable(status, body) {
  if (status === 503) return true;
  if (!body || typeof body !== "object") return false;
  if (typeof body.message !== "string") return false;
  return body.message.toLowerCase().includes("temporarily unavailable");
}

export async function requestJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const text = await response.text();
  let json = null;

  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { response, status: response.status, text, json };
}

async function waitForServer() {
  const start = Date.now();

  while (Date.now() - start < SERVER_READY_TIMEOUT_MS) {
    try {
      const response = await fetch(`${baseUrl}/`, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // ignore until timeout
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Dev server did not become ready within ${SERVER_READY_TIMEOUT_MS}ms.\n${devServerLog}`);
}

export function registerDevServerLifecycle() {
  before(async () => {
    const nextBin = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next");
    devServer = spawn(
      process.execPath,
      [nextBin, "dev", "--port", String(TEST_SERVER_PORT), "--hostname", TEST_SERVER_HOST],
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
}

export async function resolveLiveProduct() {
  const productsResponse = await requestJson("/api/products", {
    headers: { "user-agent": uniqueKey("critical-products") }
  });

  if (!Array.isArray(productsResponse.json) || productsResponse.json.length === 0) {
    return { available: false, reason: "No products returned from /api/products." };
  }

  const candidate = productsResponse.json.find((item) => item && item.id && typeof item.price === "number");
  if (!candidate) {
    return { available: false, reason: "No product with id and numeric price was returned." };
  }

  const payload = buildOrderPayload({
    productId: String(candidate.id),
    productPrice: Math.round(candidate.price),
    notes: "baseline-order-check"
  });

  const baseline = await requestJson("/api/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": uniqueKey("baseline"),
      "user-agent": uniqueKey("critical-baseline"),
      "x-forwarded-for": "203.0.113.10"
    },
    body: JSON.stringify(payload)
  });

  if (baseline.status === 201 || baseline.status === 200) {
    return {
      available: true,
      productId: String(candidate.id),
      productPrice: Math.round(candidate.price)
    };
  }

  if (isCommerceUnavailable(baseline.status, baseline.json)) {
    return {
      available: false,
      reason: `Commerce backend unavailable during baseline order check (${baseline.status}).`
    };
  }

  return {
    available: false,
    reason: `Could not establish a valid baseline order (${baseline.status}): ${baseline.text}`
  };
}
