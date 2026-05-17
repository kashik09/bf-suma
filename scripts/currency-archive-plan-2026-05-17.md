# Multi-Currency System Inventory

**Date:** 2026-05-17
**Purpose:** Archive multi-currency for UGX-only display

---

## A. UI Surface

| Location | Component | File |
|----------|-----------|------|
| Header | `<CurrencySwitcher />` dropdown | `src/components/storefront/store-header.tsx:48` |

**Renders:** Dropdown with UGX, USD, KES options in site header.

---

## B. Active Currencies

Defined in `src/lib/currency.ts:1`:

```typescript
export const SUPPORTED_CURRENCIES = ["UGX", "USD", "KES"] as const;
```

**Hardcoded rates (no API):**
- `UGX_PER_USD = 4464`
- `KES_PER_USD = 129`

---

## C. Storage

| Mechanism | Key | File |
|-----------|-----|------|
| localStorage | `"storefront-currency"` | `src/lib/currency.ts:4` |
| Custom event | `"storefront-currency-changed"` | `src/lib/currency.ts:5` |

**Functions:**
- `getCurrency()` - reads from localStorage, defaults to UGX
- `setCurrency()` - writes to localStorage, dispatches event

---

## D. Conversion Logic

| Function | File | Purpose |
|----------|------|---------|
| `convertPrice()` | `src/lib/currency.ts:60` | Convert between currencies using hardcoded rates |
| `formatPrice()` | `src/lib/currency.ts:39` | Format for display (handles decimals per currency) |

**No API calls.** Conversion is synchronous with hardcoded rates.

---

## E. Components Using Conversion

| Component | File | Usage |
|-----------|------|-------|
| `ProductCard` | `src/components/storefront/product-card.tsx:19-20` | `useSelectedCurrency` + `convertPrice` |
| `ProductDetail` | `src/components/storefront/product-detail.tsx:200` | `useSelectedCurrency` |
| `PackageCard` | `src/components/storefront/package-card.tsx:23-25` | `useSelectedCurrency` + `convertPrice` |
| `PackageAddToCart` | `src/components/storefront/package-add-to-cart.tsx:23-29` | `useSelectedCurrency` + `convertPrice` |
| `CartPanel` | `src/components/storefront/cart-panel.tsx:72` | `useSelectedCurrency` |
| `AccountAmount` | `src/components/storefront/account-amount.tsx:13-14` | `useSelectedCurrency` + `convertPrice` |

---

## F. Hook

| Hook | File |
|------|------|
| `useSelectedCurrency()` | `src/hooks/use-selected-currency.ts` |

**Behavior:**
- SSR: returns `DEFAULT_CURRENCY` ("UGX")
- Client: reads localStorage, subscribes to change events
- Returns `{ currency, setCurrency }`

---

## G. API Routes

**None.** No `/api/rates` or similar. All conversion is client-side with hardcoded rates.

---

## Summary

- **Switcher:** 1 component in header
- **Hook:** 1 hook used by 6 components
- **Conversion:** Synchronous, hardcoded rates (no API overhead)
- **Storage:** localStorage only
- **Currencies:** UGX (default), USD, KES
