import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TEST_TIMEOUT_MS,
  baseUrl,
  buildOrderPayload,
  requestJson,
  resolveLiveProduct,
  uniqueKey
} from "./critical-path.harness.mjs";

export function registerCriticalPathCoreTests() {
  test("admin routes are blocked when ALLOW_ADMIN_ROUTES=false", { timeout: TEST_TIMEOUT_MS }, async () => {
    const response = await fetch(`${baseUrl}/admin`, { redirect: "manual" });
    const location = response.headers.get("location");
    const allowedLocation = new Set(["/", `${baseUrl}/`, `http://localhost:4020/`]);

    assert.ok(
      response.status === 307 || response.status === 308,
      `Expected /admin redirect status 307 or 308, got ${response.status}`
    );
    assert.ok(
      location !== null && allowedLocation.has(location),
      `Expected redirect location to be '/' or '${baseUrl}/', got ${String(location)}`
    );
  });

  test(
    "checkout payload contract accepts relative image_url and rejects malformed image_url",
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const acceptedPayload = buildOrderPayload({
        productId: "nonexistent-product",
        productPrice: 1000,
        notes: "relative-image-url",
        imageUrl: "/catalog-images/test.webp"
      });

      const accepted = await requestJson("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": uniqueKey("image-accepted"),
          "user-agent": uniqueKey("critical-image-accepted"),
          "x-forwarded-for": "203.0.113.20"
        },
        body: JSON.stringify(acceptedPayload)
      });

      const acceptedFieldErrors = accepted.json?.fieldErrors || {};
      const acceptedImageErrors = JSON.stringify(acceptedFieldErrors).toLowerCase();
      assert.equal(
        acceptedImageErrors.includes("image_url"),
        false,
        `Relative image_url should not fail schema validation: ${accepted.text}`
      );

      const rejectedPayload = buildOrderPayload({
        productId: "nonexistent-product",
        productPrice: 1000,
        notes: "malformed-image-url",
        imageUrl: "catalog-images/test.webp"
      });

      const rejected = await requestJson("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": uniqueKey("image-rejected"),
          "user-agent": uniqueKey("critical-image-rejected"),
          "x-forwarded-for": "203.0.113.21"
        },
        body: JSON.stringify(rejectedPayload)
      });

      assert.equal(rejected.status, 400, `Expected malformed image_url payload to fail with 400: ${rejected.text}`);
      assert.equal(
        rejected.json?.message,
        "Invalid checkout payload",
        `Expected schema validation failure for malformed image_url: ${rejected.text}`
      );
    }
  );

  test("server reprices and rejects tampered totals/line prices", { timeout: TEST_TIMEOUT_MS }, async (t) => {
    const baseline = await resolveLiveProduct();
    if (!baseline.available) {
      t.skip(baseline.reason);
      return;
    }

    const productId = baseline.productId;
    const productPrice = baseline.productPrice;
    const deliveryFee = 5000;

    const tamperedTotalPayload = buildOrderPayload({
      productId,
      productPrice,
      notes: "tampered-total"
    });
    tamperedTotalPayload.total = productPrice + deliveryFee - 1000;

    const tamperedTotal = await requestJson("/api/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": uniqueKey("tamper-total"),
        "user-agent": uniqueKey("critical-tamper-total"),
        "x-forwarded-for": "203.0.113.30"
      },
      body: JSON.stringify(tamperedTotalPayload)
    });

    assert.equal(tamperedTotal.status, 400, `Expected tampered total to be rejected with 400: ${tamperedTotal.text}`);

    const tamperedLinePayload = buildOrderPayload({
      productId,
      productPrice,
      notes: "tampered-line"
    });
    tamperedLinePayload.items[0].price = 1;
    tamperedLinePayload.subtotal = 1;
    tamperedLinePayload.total = 1 + deliveryFee;

    const tamperedLine = await requestJson("/api/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": uniqueKey("tamper-line"),
        "user-agent": uniqueKey("critical-tamper-line"),
        "x-forwarded-for": "203.0.113.31"
      },
      body: JSON.stringify(tamperedLinePayload)
    });

    assert.equal(
      tamperedLine.status,
      400,
      `Expected tampered line price to be rejected with 400: ${tamperedLine.text}`
    );
  });
}
