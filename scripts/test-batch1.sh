#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4010}"
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

CHECKOUT_HTML="$(curl -s "http://127.0.0.1:${PORT}/checkout")"
if printf '%s' "${CHECKOUT_HTML}" | grep -q 'value="pay_now"'; then
  echo "Expected checkout form to hide pay_now option, but it is still rendered."
  exit 1
fi

ADMIN_HEADERS="$(curl -s -D - -o /dev/null "http://127.0.0.1:${PORT}/admin")"
ADMIN_STATUS="$(printf '%s' "${ADMIN_HEADERS}" | awk 'toupper($1) ~ /^HTTP\// {code=$2} END {print code}')"
ADMIN_LOCATION="$(printf '%s' "${ADMIN_HEADERS}" | awk 'tolower($1)=="location:" {print $2}' | tr -d '\r' | tail -n 1)"

if [[ "${ADMIN_STATUS}" != "307" && "${ADMIN_STATUS}" != "308" ]]; then
  echo "Expected /admin to redirect when ALLOW_ADMIN_ROUTES=false, got status ${ADMIN_STATUS}"
  exit 1
fi

if [[ "${ADMIN_LOCATION}" != "/" && "${ADMIN_LOCATION}" != "http://127.0.0.1:${PORT}/" ]]; then
  echo "Expected /admin redirect location to '/', got '${ADMIN_LOCATION}'"
  exit 1
fi

ORDER_RESPONSE="$(curl -s -i -X POST "http://127.0.0.1:${PORT}/api/orders" \
  -H 'Content-Type: application/json' \
  --data '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+256700000000","fulfillmentType":"delivery","deliveryAddress":"Kampala","pickupLocation":"Main Store - Kampala","paymentMethod":"pay_now","notes":"","items":[{"product_id":"prod-1","slug":"test","name":"Test","price":1000,"image_url":"https://example.com/p.webp","quantity":1,"max_quantity":5,"availability":"in_stock"}],"subtotal":1000,"deliveryFee":5000,"total":6000}')"

ORDER_STATUS="$(printf '%s' "${ORDER_RESPONSE}" | awk 'toupper($1) ~ /^HTTP\// {print $2; exit}')"
if [[ "${ORDER_STATUS}" != "400" ]]; then
  echo "Expected pay_now payload to fail validation with 400, got status ${ORDER_STATUS}"
  exit 1
fi

if ! printf '%s' "${ORDER_RESPONSE}" | grep -q "paymentMethod"; then
  echo "Expected validation response to include paymentMethod field error."
  exit 1
fi

echo "Batch 1 integration tests passed."
