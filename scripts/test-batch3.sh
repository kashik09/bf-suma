#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4013}"
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
ALLOW_ADMIN_ROUTES=false PORT="${PORT}" npm run dev >"${LOG_FILE}" 2>&1 &
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

PRODUCTS_JSON="$(curl -s "http://127.0.0.1:${PORT}/api/products")"
PRODUCT_INFO="$(printf '%s' "${PRODUCTS_JSON}" | node -e '
  const fs = require("fs");
  const raw = fs.readFileSync(0, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length === 0) {
    process.exit(2);
  }
  const first = data[0];
  if (!first?.id || typeof first.price !== "number") {
    process.exit(3);
  }
  process.stdout.write(`${first.id}|${first.name || "Test Product"}|${Math.round(first.price)}`);
')"

PRODUCT_ID="$(printf '%s' "${PRODUCT_INFO}" | cut -d'|' -f1)"
PRODUCT_NAME="$(printf '%s' "${PRODUCT_INFO}" | cut -d'|' -f2)"
PRODUCT_PRICE="$(printf '%s' "${PRODUCT_INFO}" | cut -d'|' -f3)"
DELIVERY_FEE=5000
TOTAL=$((PRODUCT_PRICE + DELIVERY_FEE))

build_payload() {
  local product_id="$1"
  local item_price="$2"
  local subtotal="$3"
  local total="$4"
  cat <<JSON
{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_on_delivery","notes":"","items":[{"product_id":"${product_id}","slug":"test-product","name":"${PRODUCT_NAME}","price":${item_price},"image_url":"/catalog-images/test.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":${subtotal},"deliveryFee":${DELIVERY_FEE},"total":${total}}
JSON
}

post_order() {
  local payload="$1"
  curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
    -H 'Content-Type: application/json' \
    --data "${payload}"
}

TAMPERED_TOTAL_RESPONSE="$(post_order "$(build_payload "${PRODUCT_ID}" "${PRODUCT_PRICE}" "${PRODUCT_PRICE}" "$((TOTAL - 1000))")")"
TAMPERED_TOTAL_STATUS="$(printf '%s' "${TAMPERED_TOTAL_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${TAMPERED_TOTAL_STATUS}" != "400" ]]; then
  echo "Expected tampered total to be rejected with 400, got ${TAMPERED_TOTAL_STATUS}."
  printf '%s\n' "${TAMPERED_TOTAL_RESPONSE}"
  exit 1
fi

TAMPERED_PRICE_RESPONSE="$(post_order "$(build_payload "${PRODUCT_ID}" "1" "${PRODUCT_PRICE}" "${TOTAL}")")"
TAMPERED_PRICE_STATUS="$(printf '%s' "${TAMPERED_PRICE_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${TAMPERED_PRICE_STATUS}" != "400" ]]; then
  echo "Expected tampered line price to be rejected with 400, got ${TAMPERED_PRICE_STATUS}."
  printf '%s\n' "${TAMPERED_PRICE_RESPONSE}"
  exit 1
fi

MISSING_PRODUCT_RESPONSE="$(post_order "$(build_payload "missing-product-id" "${PRODUCT_PRICE}" "${PRODUCT_PRICE}" "${TOTAL}")")"
MISSING_PRODUCT_STATUS="$(printf '%s' "${MISSING_PRODUCT_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${MISSING_PRODUCT_STATUS}" != "400" ]]; then
  echo "Expected missing product to be rejected with 400, got ${MISSING_PRODUCT_STATUS}."
  printf '%s\n' "${MISSING_PRODUCT_RESPONSE}"
  exit 1
fi

VALID_RESPONSE="$(post_order "$(build_payload "${PRODUCT_ID}" "${PRODUCT_PRICE}" "${PRODUCT_PRICE}" "${TOTAL}")")"
VALID_STATUS="$(printf '%s' "${VALID_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${VALID_STATUS}" != "201" ]]; then
  echo "Expected valid payload to create an order with 201, got ${VALID_STATUS}."
  printf '%s\n' "${VALID_RESPONSE}"
  exit 1
fi

VALID_BODY="$(printf '%s' "${VALID_RESPONSE}" | awk 'BEGIN{body=0} body{print} /^\r?$/{body=1}')"
RESPONSE_SUBTOTAL="$(printf '%s' "${VALID_BODY}" | node -e 'const fs=require("fs"); const b=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(b.subtotal ?? ""));')"
RESPONSE_DELIVERY_FEE="$(printf '%s' "${VALID_BODY}" | node -e 'const fs=require("fs"); const b=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(b.deliveryFee ?? ""));')"
RESPONSE_TOTAL="$(printf '%s' "${VALID_BODY}" | node -e 'const fs=require("fs"); const b=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(b.total ?? ""));')"

if [[ "${RESPONSE_SUBTOTAL}" != "${PRODUCT_PRICE}" || "${RESPONSE_DELIVERY_FEE}" != "${DELIVERY_FEE}" || "${RESPONSE_TOTAL}" != "${TOTAL}" ]]; then
  echo "Expected server-computed totals in success response to match authoritative pricing."
  printf '%s\n' "${VALID_RESPONSE}"
  exit 1
fi

echo "Batch 3 integration tests passed."
