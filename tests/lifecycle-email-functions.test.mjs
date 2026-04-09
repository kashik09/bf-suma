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

test("send-abandoned-cart worker sends email and marks row sent", async () => {
  const workers = await loadTsModule("supabase/functions/_shared/lifecycle-workers.ts");

  let sentPayload = null;
  let markedId = null;
  const result = await workers.processAbandonedCartLifecycle({
    listCandidates: async () => [
      {
        id: "cart-1",
        customerEmail: "buyer@example.com",
        customerName: "Buyer One",
        cartItems: [{ name: "Cordyceps Coffee", quantity: 2 }],
        createdAt: "2026-04-09T08:00:00.000Z"
      }
    ],
    sendEmail: async (candidate) => {
      sentPayload = candidate;
      return true;
    },
    markSent: async (id) => {
      markedId = id;
    },
    now: new Date("2026-04-09T10:00:00.000Z")
  });

  assert.equal(result.processed, 1);
  assert.equal(result.sent, 1);
  assert.equal(result.failed, 0);
  assert.equal(markedId, "cart-1");
  assert.equal(sentPayload.customerEmail, "buyer@example.com");
  assert.equal(sentPayload.cartItems[0].name, "Cordyceps Coffee");
});

test("send-review-request worker sends review email and marks order", async () => {
  const workers = await loadTsModule("supabase/functions/_shared/lifecycle-workers.ts");

  let sentPayload = null;
  let markedOrderId = null;
  const result = await workers.processReviewRequestLifecycle({
    listCandidates: async () => [
      {
        orderId: "order-1",
        orderNumber: "BFS-1234",
        customerEmail: "buyer@example.com",
        customerFirstName: "Buyer",
        total: 210400,
        currency: "KES",
        productName: "Cordyceps Coffee",
        productSlug: "cordyceps-coffee"
      }
    ],
    sendEmail: async (candidate) => {
      sentPayload = candidate;
      return true;
    },
    markSent: async (orderId) => {
      markedOrderId = orderId;
    },
    now: new Date("2026-04-09T10:00:00.000Z")
  });

  assert.equal(result.processed, 1);
  assert.equal(result.sent, 1);
  assert.equal(result.failed, 0);
  assert.equal(markedOrderId, "order-1");
  assert.equal(sentPayload.orderNumber, "BFS-1234");
  assert.equal(sentPayload.productSlug, "cordyceps-coffee");
});

test("send-reengagement worker sends email and marks customer", async () => {
  const workers = await loadTsModule("supabase/functions/_shared/lifecycle-workers.ts");

  let sentPayload = null;
  let markedCustomerId = null;
  const result = await workers.processReengagementLifecycle({
    listCandidates: async () => [
      {
        customerId: "cust-1",
        customerEmail: "buyer@example.com",
        customerFirstName: "Buyer"
      }
    ],
    sendEmail: async (candidate) => {
      sentPayload = candidate;
      return true;
    },
    markSent: async (customerId) => {
      markedCustomerId = customerId;
    },
    now: new Date("2026-04-09T10:00:00.000Z")
  });

  assert.equal(result.processed, 1);
  assert.equal(result.sent, 1);
  assert.equal(result.failed, 0);
  assert.equal(markedCustomerId, "cust-1");
  assert.equal(sentPayload.customerEmail, "buyer@example.com");
});
