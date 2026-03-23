#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4014}"
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
  if (!Array.isArray(data) || data.length === 0) process.exit(2);
  const first = data[0];
  if (!first?.id || typeof first.price !== "number") process.exit(3);
  process.stdout.write(`${first.id}|${Math.round(first.price)}`);
')"

PRODUCT_ID="$(printf '%s' "${PRODUCT_INFO}" | cut -d'|' -f1)"
PRODUCT_PRICE="$(printf '%s' "${PRODUCT_INFO}" | cut -d'|' -f2)"
DELIVERY_FEE=5000
TOTAL=$((PRODUCT_PRICE + DELIVERY_FEE))

build_payload() {
  local notes="$1"
  cat <<JSON
{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_on_delivery","notes":"${notes}","items":[{"product_id":"${PRODUCT_ID}","slug":"test-product","name":"Test Product","price":${PRODUCT_PRICE},"image_url":"/catalog-images/test.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":${PRODUCT_PRICE},"deliveryFee":${DELIVERY_FEE},"total":${TOTAL}}
JSON
}

post_order() {
  local key="$1"
  local payload="$2"
  curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
    -H 'Content-Type: application/json' \
    -H "Idempotency-Key: ${key}" \
    --data "${payload}"
}

response_status() {
  printf '%s' "$1" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}'
}

response_body() {
  printf '%s' "$1" | awk 'BEGIN{body=0} body{print} /^\r?$/{body=1}'
}

response_order_number() {
  printf '%s' "$1" | node -e 'const fs=require("fs"); const b=JSON.parse(fs.readFileSync(0,"utf8")); process.stdout.write(String(b.orderNumber ?? ""));'
}

KEY_ONE="batch4-${RANDOM}-$(date +%s)-a"
PAYLOAD_ONE="$(build_payload "idempotency-test-a")"
FIRST_RESPONSE="$(post_order "${KEY_ONE}" "${PAYLOAD_ONE}")"
FIRST_STATUS="$(response_status "${FIRST_RESPONSE}")"
if [[ "${FIRST_STATUS}" != "201" ]]; then
  echo "Expected first request with key to succeed with 201, got ${FIRST_STATUS}."
  printf '%s\n' "${FIRST_RESPONSE}"
  exit 1
fi

SECOND_RESPONSE="$(post_order "${KEY_ONE}" "${PAYLOAD_ONE}")"
SECOND_STATUS="$(response_status "${SECOND_RESPONSE}")"
if [[ "${SECOND_STATUS}" != "200" && "${SECOND_STATUS}" != "201" ]]; then
  echo "Expected same key + same payload replay to return success, got ${SECOND_STATUS}."
  printf '%s\n' "${SECOND_RESPONSE}"
  exit 1
fi

FIRST_ORDER_NUMBER="$(response_order_number "$(response_body "${FIRST_RESPONSE}")")"
SECOND_ORDER_NUMBER="$(response_order_number "$(response_body "${SECOND_RESPONSE}")")"
if [[ -z "${FIRST_ORDER_NUMBER}" || "${FIRST_ORDER_NUMBER}" != "${SECOND_ORDER_NUMBER}" ]]; then
  echo "Expected same idempotency key replay to return the same order number."
  printf '%s\n' "${FIRST_RESPONSE}"
  printf '%s\n' "${SECOND_RESPONSE}"
  exit 1
fi

DIFFERENT_PAYLOAD="$(build_payload "idempotency-test-b")"
CONFLICT_RESPONSE="$(post_order "${KEY_ONE}" "${DIFFERENT_PAYLOAD}")"
CONFLICT_STATUS="$(response_status "${CONFLICT_RESPONSE}")"
if [[ "${CONFLICT_STATUS}" != "409" ]]; then
  echo "Expected same key + different payload to be rejected with 409, got ${CONFLICT_STATUS}."
  printf '%s\n' "${CONFLICT_RESPONSE}"
  exit 1
fi

KEY_TWO="batch4-${RANDOM}-$(date +%s)-b"
PAYLOAD_TWO="$(build_payload "idempotency-retry-test")"
curl -s -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  -H "Idempotency-Key: ${KEY_TWO}" \
  --data "${PAYLOAD_TWO}" \
  --max-time 0.001 >/dev/null 2>&1 || true

RETRY_RESPONSE="$(post_order "${KEY_TWO}" "${PAYLOAD_TWO}")"
RETRY_STATUS="$(response_status "${RETRY_RESPONSE}")"
if [[ "${RETRY_STATUS}" != "200" && "${RETRY_STATUS}" != "201" ]]; then
  echo "Expected retry with same key after transient client failure to succeed, got ${RETRY_STATUS}."
  printf '%s\n' "${RETRY_RESPONSE}"
  exit 1
fi

RETRY_ORDER_NUMBER="$(response_order_number "$(response_body "${RETRY_RESPONSE}")")"
REPLAY_AFTER_RETRY_RESPONSE="$(post_order "${KEY_TWO}" "${PAYLOAD_TWO}")"
REPLAY_AFTER_RETRY_STATUS="$(response_status "${REPLAY_AFTER_RETRY_RESPONSE}")"
if [[ "${REPLAY_AFTER_RETRY_STATUS}" != "200" && "${REPLAY_AFTER_RETRY_STATUS}" != "201" ]]; then
  echo "Expected replay after retry to return success, got ${REPLAY_AFTER_RETRY_STATUS}."
  printf '%s\n' "${REPLAY_AFTER_RETRY_RESPONSE}"
  exit 1
fi

REPLAY_AFTER_RETRY_ORDER_NUMBER="$(response_order_number "$(response_body "${REPLAY_AFTER_RETRY_RESPONSE}")")"
if [[ -z "${RETRY_ORDER_NUMBER}" || "${RETRY_ORDER_NUMBER}" != "${REPLAY_AFTER_RETRY_ORDER_NUMBER}" ]]; then
  echo "Expected retry replay to return the same order number."
  printf '%s\n' "${RETRY_RESPONSE}"
  printf '%s\n' "${REPLAY_AFTER_RETRY_RESPONSE}"
  exit 1
fi

echo "Batch 4 integration tests passed."
