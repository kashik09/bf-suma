#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4016}"
LOG_FILE="$(mktemp)"

cleanup() {
  if [[ -n "${DEV_PID:-}" ]] && kill -0 "${DEV_PID}" 2>/dev/null; then
    kill "${DEV_PID}" 2>/dev/null || true
    wait "${DEV_PID}" 2>/dev/null || true
  fi
  rm -f "${LOG_FILE}"
}
trap cleanup EXIT

cd "${ROOT_DIR}"
NEXT_PUBLIC_SUPABASE_URL="" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="" \
SUPABASE_SERVICE_ROLE_KEY="" \
ALLOW_ADMIN_ROUTES=false \
PORT="${PORT}" \
npm run dev >"${LOG_FILE}" 2>&1 &
DEV_PID=$!

for _ in {1..60}; do
  if curl -s "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -s "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  echo "Dev server did not become ready. Log output:"
  cat "${LOG_FILE}"
  exit 1
fi

# Trigger catalog fallback activation log.
curl -s "http://127.0.0.1:${PORT}/api/products" >/dev/null

# Trigger order validation failure log.
curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: batch7-order-validation' \
  -H 'x-correlation-id: batch7-order-validation' \
  -H "Idempotency-Key: batch7-order-validation-$(date +%s)" \
  --data '{}' >/dev/null

# Trigger order create failure log (service unavailable branch).
curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: batch7-order-create-fail' \
  -H 'x-correlation-id: batch7-order-create-fail' \
  -H "Idempotency-Key: batch7-order-create-fail-$(date +%s)" \
  --data '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_on_delivery","notes":"","items":[{"product_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","slug":"test","name":"Test","price":1000,"image_url":"/catalog-images/test.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":1000,"deliveryFee":5000,"total":6000}' >/dev/null

# Trigger order rate-limit block log.
for i in {1..6}; do
  curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${PORT}/api/orders" \
    -H 'Content-Type: application/json' \
    -H 'User-Agent: batch7-order-rate' \
    -H 'x-correlation-id: batch7-order-rate' \
    -H "Idempotency-Key: batch7-order-rate-${i}-$(date +%s)" \
    --data '{}' >/dev/null
done

# Trigger contact rate-limit block log.
for i in {1..6}; do
  curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${PORT}/api/contact" \
    -H 'Content-Type: application/json' \
    -H 'User-Agent: batch7-contact-rate' \
    -H 'x-correlation-id: batch7-contact-rate' \
    --data '{}' >/dev/null
done

sleep 1

node - "${LOG_FILE}" <<'NODE'
const fs = require("fs");
const path = process.argv[2];
const lines = fs.readFileSync(path, "utf8").split("\n");
const events = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed.event === "string") {
      events.push(parsed);
    }
  } catch {
    // Ignore non-JSON lines.
  }
}

function hasEvent(name, predicate = () => true) {
  return events.some((event) => event.event === name && predicate(event));
}

const checks = [
  hasEvent("catalog.fallback_activated"),
  hasEvent("order.validation_failed", (event) => event.correlationId === "batch7-order-validation"),
  hasEvent("order.create_failed", (event) => event.correlationId === "batch7-order-create-fail"),
  hasEvent("order.rate_limited", (event) => event.correlationId === "batch7-order-rate"),
  hasEvent("contact.rate_limited", (event) => event.correlationId === "batch7-contact-rate")
];

if (checks.every(Boolean)) {
  process.exit(0);
}

console.error("Expected structured log events were not emitted.");
console.error(JSON.stringify(events, null, 2));
process.exit(1);
NODE

echo "Batch 7 observability tests passed."
