#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4011}"
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

VALID_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  --data '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_on_delivery","notes":"","items":[{"product_id":"prod-1","slug":"test","name":"Test","price":1000,"image_url":"/catalog-images/test.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":1000,"deliveryFee":5000,"total":6000}')"

VALID_STATUS="$(printf '%s' "${VALID_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${VALID_STATUS}" == "400" ]]; then
  echo "Expected relative image_url payload to pass schema, got validation 400."
  printf '%s\n' "${VALID_RESPONSE}"
  exit 1
fi

INVALID_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  --data '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_on_delivery","notes":"","items":[{"product_id":"prod-1","slug":"test","name":"Test","price":1000,"image_url":"catalog-images/test.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":1000,"deliveryFee":5000,"total":6000}')"

INVALID_STATUS="$(printf '%s' "${INVALID_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${INVALID_STATUS}" != "400" ]]; then
  echo "Expected malformed item payload to fail validation with 400, got ${INVALID_STATUS}."
  printf '%s\n' "${INVALID_RESPONSE}"
  exit 1
fi

if ! printf '%s' "${INVALID_RESPONSE}" | grep -q "Invalid checkout payload"; then
  echo "Expected invalid item response to include validation message."
  exit 1
fi

echo "Batch 2 integration tests passed."
