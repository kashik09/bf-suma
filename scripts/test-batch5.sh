#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4015}"
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

response_status() {
  printf '%s' "$1" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}'
}

assert_not_429() {
  local status="$1"
  local label="$2"
  if [[ "${status}" == "429" ]]; then
    echo "${label} unexpectedly rate-limited."
    exit 1
  fi
}

assert_retry_hint() {
  local response="$1"
  if ! printf '%s' "${response}" | grep -iq '^Retry-After:'; then
    echo "Expected 429 response to include Retry-After header."
    printf '%s\n' "${response}"
    exit 1
  fi
  if ! printf '%s' "${response}" | grep -q '"retryAfterSeconds"'; then
    echo "Expected 429 response body to include retryAfterSeconds."
    printf '%s\n' "${response}"
    exit 1
  fi
}

ORDER_SINGLE_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: batch5-order-single' \
  -H "Idempotency-Key: batch5-order-single-$(date +%s)" \
  --data '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_on_delivery","notes":"","items":[{"product_id":"prod-test","slug":"test","name":"Test","price":1000,"image_url":"/catalog-images/test.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":1000,"deliveryFee":5000,"total":6000}')"
ORDER_SINGLE_STATUS="$(response_status "${ORDER_SINGLE_RESPONSE}")"
assert_not_429 "${ORDER_SINGLE_STATUS}" "Single order submission"

CONTACT_SINGLE_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/contact" \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: batch5-contact-single' \
  --data '{"name":"Test User","email":"test@example.com","phone":"+256700000000","message":"Need help placing an order.","source":"contact_page"}')"
CONTACT_SINGLE_STATUS="$(response_status "${CONTACT_SINGLE_RESPONSE}")"
assert_not_429 "${CONTACT_SINGLE_STATUS}" "Single contact submission"

ORDER_BURST_429=""
for i in {1..6}; do
  ORDER_BURST_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
    -H 'Content-Type: application/json' \
    -H 'User-Agent: batch5-order-burst' \
    -H "Idempotency-Key: batch5-order-burst-${i}-$(date +%s)" \
    --data '{}')"
  ORDER_BURST_STATUS="$(response_status "${ORDER_BURST_RESPONSE}")"
  if [[ "${ORDER_BURST_STATUS}" == "429" ]]; then
    ORDER_BURST_429="${ORDER_BURST_RESPONSE}"
    break
  fi
done

if [[ -z "${ORDER_BURST_429}" ]]; then
  echo "Expected burst order requests to trigger 429."
  exit 1
fi
assert_retry_hint "${ORDER_BURST_429}"

CONTACT_BURST_429=""
for i in {1..6}; do
  CONTACT_BURST_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/contact" \
    -H 'Content-Type: application/json' \
    -H 'User-Agent: batch5-contact-burst' \
    --data '{}')"
  CONTACT_BURST_STATUS="$(response_status "${CONTACT_BURST_RESPONSE}")"
  if [[ "${CONTACT_BURST_STATUS}" == "429" ]]; then
    CONTACT_BURST_429="${CONTACT_BURST_RESPONSE}"
    break
  fi
done

if [[ -z "${CONTACT_BURST_429}" ]]; then
  echo "Expected burst contact requests to trigger 429."
  exit 1
fi
assert_retry_hint "${CONTACT_BURST_429}"

ORDERS_GET_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/api/orders")"
if [[ "${ORDERS_GET_STATUS}" == "429" ]]; then
  echo "GET /api/orders should not be rate-limited by POST policy."
  exit 1
fi

echo "Batch 5 integration tests passed."
