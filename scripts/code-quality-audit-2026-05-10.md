# Code Quality Audit — 2026-05-10

## Summary

| Category | Status | Notes |
|----------|--------|-------|
| Lint | ⚠️ | ESLint config needs migration to flat config (v9+) |
| Types | ✅ | Zero TypeScript errors |
| Dead Code | ⚠️ | 19 unused files, 28 unused exports identified |
| Bundle Size | ⚠️ | 4 routes over 200KB First Load JS |
| Console Statements | ⚠️ | 29 statements (mostly appropriate error logging) |
| TODOs | ✅ | Only 2 TODOs in codebase |
| Outdated Deps | ⚠️ | 6 packages with major version gaps |

---

## Lint

**Status:** ESLint v9 requires flat config (`eslint.config.js`). Current setup uses deprecated `.eslintrc.*` format.

**Action Required:**
```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

---

## Types

**Status:** ✅ Zero errors

```
npx tsc --noEmit
# No output (clean)
```

---

## Dead Code

### Unused Files (19)

| File | Type |
|------|------|
| `scripts/add-missing-products.ts` | CLI script |
| `scripts/bootstrap-admin.ts` | CLI script |
| `scripts/create-admin-users-2026-05-10.ts` | CLI script |
| `scripts/generate-admin-password.ts` | CLI script |
| `scripts/hash-password-once.ts` | CLI script |
| `scripts/import-bfsuma-catalog.ts` | CLI script |
| `scripts/preflight-check.js` | CLI script |
| `scripts/price-reconciliation.ts` | CLI script |
| `scripts/upload-to-storage.mjs` | CLI script |
| `src/lib/commerce-integrity.ts` | Unused module |
| `src/lib/email/index.ts` | Barrel export |
| `src/lib/idempotency-decision.ts` | Unused module |
| `src/services/inquiries.ts` | Unused service |
| `supabase/functions/_shared/email-layout.ts` | Edge function shared |
| `supabase/functions/_shared/lifecycle-workers.ts` | Edge function shared |
| `supabase/functions/_shared/runtime.ts` | Edge function shared |
| `supabase/functions/send-abandoned-cart/index.ts` | Edge function |
| `supabase/functions/send-reengagement/index.ts` | Edge function |
| `supabase/functions/send-review-request/index.ts` | Edge function |

**Note:** Scripts in `scripts/` are intentionally standalone CLI tools. Supabase edge functions may be deployed separately.

### Unused Exports (Top 10)

| File | Export |
|------|--------|
| `src/lib/catalog/bfsuma-catalog.ts` | `BFSUMA_CATEGORIES`, `BFSUMA_PRODUCTS`, `BFSUMA_CATALOG_SEED` |
| `src/lib/constants.ts` | `PRODUCT_STATUSES`, `PAYMENT_STATUSES`, `DELIVERY_STATUSES` |
| `src/lib/email/resend.ts` | `sendAbandonedCartReminderEmail`, `sendPostPurchaseReviewRequestEmail` |
| `src/lib/validation.ts` | `productSchema`, `cartItemSchema`, `orderIntakeItemSchema` |
| `src/services/customers.ts` | `listCustomers`, `getCustomerById` |
| `src/lib/admin-permissions.ts` | `VIEW_ONLY_ROLES`, `canViewAdmin` |
| `src/config/delivery-zones.ts` | `getZoneById`, `getDeliveryFeeForZone` |
| `src/lib/wishlist.ts` | `removeFromWishlist`, `isInWishlist` |
| `src/services/admin-auth.ts` | `PasswordResetRequiredError`, `WeakPasswordError` |
| `src/components/storefront/search-autocomplete.tsx` | `SearchAutocomplete` |

---

## Bundle Size

### Routes Over 200KB First Load JS

| Route | Size | First Load JS | Status |
|-------|------|---------------|--------|
| `/` (homepage) | 250 B | 232 kB | ⚠️ Over 200KB |
| `/shop` | 1.38 kB | 233 kB | ⚠️ Over 200KB |
| `/shop/[slug]` | 4.23 kB | 236 kB | ⚠️ Over 200KB |
| `/cart` | 242 B | 232 kB | ⚠️ Over 200KB |
| `/checkout` | 242 B | 232 kB | ⚠️ Over 200KB |

### Key Routes Summary

| Route | First Load JS |
|-------|---------------|
| `/` | 232 kB |
| `/shop` | 233 kB |
| `/checkout` | 232 kB |
| `/admin` | 119 kB |
| `/admin/products` | 115 kB |
| `/admin/orders` | 115 kB |

**Note:** Storefront routes share a large JS chunk (likely cart/currency context). Admin routes are well-optimized.

---

## Console Statements

**Total:** 29 statements

### Breakdown by Type

| Type | Count | Appropriate? |
|------|-------|--------------|
| `console.error` | 18 | ✅ Error logging |
| `console.warn` | 7 | ✅ Warning logging |
| `console.log` | 4 | ⚠️ Review needed |

### Sample Statements

| File | Line | Statement |
|------|------|-----------|
| `src/lib/logger.ts` | 41 | `console.error(line)` — Structured logger |
| `src/lib/logger.ts` | 46 | `console.warn(line)` — Structured logger |
| `src/lib/logger.ts` | 50 | `console.log(line)` — Structured logger |
| `src/app/api/contact/route.ts` | 82 | `console.error("Failed to save contact submission:", dbError)` |
| `src/app/api/orders/[id]/route.ts` | 46 | `console.error("order.get_failed", error)` |
| `src/services/blog.ts` | 104 | `console.error("blog list error:", error)` |
| `src/components/storefront/hero.tsx` | 77 | `console.warn("[Hero] Duplicate hero image...")` |

**Assessment:** Most console statements are appropriate error/warning logging. The `src/lib/logger.ts` provides structured logging.

---

## TODOs

**Total:** 2 items

| File | Line | Comment |
|------|------|---------|
| `src/app/api/contact/route.ts` | 16 | `// TODO: In production, replace with Vercel KV or Redis for distributed rate limiting` |
| `src/components/admin/package-form.tsx` | 270 | `TODO: Image upload component. For now, paste direct URLs.` |

---

## Outdated Dependencies

### Major Version Gaps

| Package | Current | Latest | Gap |
|---------|---------|--------|-----|
| `@hookform/resolvers` | 3.10.0 | 5.2.2 | 2 majors |
| `eslint` | 9.39.4 | 10.3.0 | 1 major |
| `eslint-config-next` | 15.5.14 | 16.2.6 | 1 major |
| `lucide-react` | 0.577.0 | 1.14.0 | 1 major |
| `next` | 15.5.15 | 16.2.6 | 1 major |
| `tailwind-merge` | 2.6.1 | 3.6.0 | 1 major |
| `tailwindcss` | 3.4.19 | 4.3.0 | 1 major |
| `typescript` | 5.9.3 | 6.0.3 | 1 major |
| `zod` | 3.25.76 | 4.4.3 | 1 major |

### Minor/Patch Updates Available

| Package | Current | Wanted |
|---------|---------|--------|
| `@supabase/supabase-js` | 2.101.1 | 2.105.4 |
| `@supabase/ssr` | 0.5.2 | 0.10.3 |
| `supabase` | 2.84.6 | 2.98.2 |
| `react` | 19.2.4 | 19.2.6 |
| `react-dom` | 19.2.4 | 19.2.6 |

---

## Namespace Imports

**Found:** 4 instances (acceptable)

| File | Import |
|------|--------|
| `src/components/ui/textarea.tsx` | `import * as React from "react"` |
| `src/components/ui/select.tsx` | `import * as React from "react"` |
| `src/components/ui/input.tsx` | `import * as React from "react"` |
| `src/components/ui/button.tsx` | `import * as React from "react"` |

**Note:** `import * as React` is a common pattern for UI components and doesn't significantly impact tree-shaking.

---

## Recommendations

### Priority 1 — High Impact

1. **Migrate ESLint to flat config**
   ```bash
   npx @next/codemod@canary next-lint-to-eslint-cli .
   ```

2. **Update Supabase packages** (security patches)
   ```bash
   npm update @supabase/supabase-js @supabase/ssr supabase
   ```

### Priority 2 — Medium Impact

3. **Reduce storefront bundle size**
   - Audit shared chunk (232KB base)
   - Consider dynamic imports for cart/currency context
   - Target: <200KB First Load JS

4. **Clean up unused exports**
   - Remove or mark as internal: `VIEW_ONLY_ROLES`, `canViewAdmin`, etc.
   - Review `src/lib/catalog/` exports

### Priority 3 — Low Impact

5. **Address TODOs**
   - Rate limiting: Consider Vercel KV for production
   - Image upload: Add component or document URL-only workflow

---

*Generated: 2026-05-10*
