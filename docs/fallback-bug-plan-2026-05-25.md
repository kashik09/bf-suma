# Catalog Fallback Bug — Intricate Fix Plan

**Date:** 2026-05-25
**Author:** Kashi + Claude Code
**Status:** PLAN — not yet implemented
**Estimated execution:** ~3-4 hours

---

## TL;DR

The fallback catalog data is stale Kenyan content (KES prices, old categories, broken images). When Supabase times out, customers see this stale data labeled as UGX. While checkout IS blocked during fallback mode, showing wildly incorrect prices destroys customer trust.

**Recommended fix:** Regenerate fallback from real DB at build time (Approach B) + detect fallback mode and show warning banner (Approach C).

---

## 1. Current State

### Catalog Fetch Flow

```
fetchCatalogFromSupabase()  →  SELECT * from categories, products, product_images
         ↓
         ↓ success: buildLiveCatalogHealth() → commerceReady: true
         ↓ error: throws
         ↓
fetchCatalogData()  →  try/catch wrapper
         ↓
         ↓ success: enrichCatalogData(liveCatalog)
         ↓ error: enrichCatalogData(FALLBACK) + buildFallbackCatalogHealth()
         ↓         → commerceReady: false
         ↓
getCatalogData()  →  unstable_cache wrapper
         ↓
         ↓ Cache key: ["storefront-catalog"]
         ↓ TTL: 60 seconds
         ↓ Tags: ["catalog"]
```

### Fallback Data Source

| Field | Value |
|-------|-------|
| File | `data/catalog/catalog_manifest.json` |
| Source | bfsumaproducts.co.ke, wellthessentials.co.ke (Kenya) |
| Total products | 50 |
| Total categories | 13 |
| **Currency in JSON** | **KES (Kenyan Shillings)** |

### The Price Bug

```typescript
// bfsuma-catalog.ts
const currency = STORE_CURRENCY;  // "UGX"
price: toMinorUnits(product.price, currency)  // Treats KES as UGX
```

**Result:** KES 5,371 → displays as UGX 5,371 (should be ~UGX 165,000)

### Existing Protection

Commerce IS blocked when fallback active:
- `cart-panel.tsx` → Checkout button hidden
- `checkout-form.tsx` → Form disabled, button says "Checkout Unavailable"
- `product-detail.tsx` → Add-to-cart disabled

**Customers cannot accidentally order at wrong prices.** But they see them.

---

## 2. Failure Modes

| # | Failure | What Customer Sees | Severity |
|---|---------|-------------------|----------|
| A | **Wrong prices** | "UGX 5,371" instead of UGX 165,000 | 🔴 Trust destruction |
| B | **Wrong categories** | "Anti-Aging", "Brain Health" (don't exist) | 🟠 Confusion |
| C | **Wrong products** | 50 Kenyan products, not Ugandan catalog | 🟠 Confusion |
| D | **Broken images** | Placeholders or 404s | 🟡 Cosmetic |
| E | **Commerce blocked** | Warning banner + disabled buttons | ✅ Correct |
| F | **60s cache** | Bad data persists after recovery | 🟡 UX delay |

---

## 3. Fix Approaches

### Approach A — Delete Fallback Entirely

**What:** Remove fallback. Supabase failure = error page.

| Aspect | Value |
|--------|-------|
| Wrong prices shown | Never |
| Site available during outage | ❌ No |
| Effort | 30 min |
| Risk | 🟡 Medium |
| **Verdict** | ❌ Too aggressive |

### Approach B — Regenerate Fallback from DB

**What:** Script that exports current Supabase catalog to JSON. Run at build time.

| Aspect | Value |
|--------|-------|
| Wrong prices shown | Never |
| Site available during outage | ✅ Yes |
| Effort | 1.5 hr |
| Risk | 🟢 Low |
| **Verdict** | ⚠️ Good, but no warning |

### Approach C — Detect Fallback + Banner

**What:** Enhance existing warning with prominent site-wide banner.

| Aspect | Value |
|--------|-------|
| Wrong prices shown | Yes (with warning) |
| Site available during outage | ✅ Yes |
| Effort | 1.5 hr |
| Risk | 🟢 Low |
| **Verdict** | ⚠️ Good, but wrong data still shown |

### Approach B + C Combined (RECOMMENDED)

**What:** Regenerate fallback (correct data) + add warning banner (clear communication).

| Aspect | Value |
|--------|-------|
| Wrong prices shown | Never |
| Site available during outage | ✅ Yes |
| Customer warned | ✅ Banner |
| Commerce blocked | ✅ Existing behavior |
| Effort | 3-3.5 hr |
| Risk | 🟢 Low |
| **Verdict** | ✅ Best |

---

## 4. Recommended Path: B + C Combined

### Phase Breakdown

| Phase | Task | Effort |
|-------|------|--------|
| α | Build-time fallback regeneration script | 45 min |
| β | Wire script into Vercel build | 30 min |
| γ | Server detection of fallback state | 30 min |
| δ | Site-wide banner component when fallback active | 30 min |
| ε | Smoke test all paths (manually trigger fallback) | 30 min |

**Total: ~3 hours focused work**

### Phase α — Regeneration Script

Create `scripts/generate-fallback-catalog.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id, name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id")
      .eq("status", "ACTIVE")
  ]);

  if (categoriesRes.error || productsRes.error) {
    console.error("Failed to fetch catalog");
    process.exit(1);
  }

  const manifest = {
    metadata: {
      generated_at: new Date().toISOString(),
      source: "supabase",
      product_count: productsRes.data.length,
      category_count: categoriesRes.data.length
    },
    categories: categoriesRes.data,
    products: productsRes.data.map(p => ({
      ...p,
      category_slug: null, // Will be resolved at runtime
      image_url: null      // Will be resolved at runtime
    }))
  };

  writeFileSync(
    "data/catalog/catalog_manifest.json",
    JSON.stringify(manifest, null, 2)
  );

  console.log(`Generated fallback: ${manifest.metadata.product_count} products, ${manifest.metadata.category_count} categories`);
}

main();
```

### Phase β — Build Integration

Update `package.json`:

```json
{
  "scripts": {
    "generate-fallback": "tsx scripts/generate-fallback-catalog.ts",
    "prebuild": "npm run generate-fallback"
  }
}
```

For Vercel, the `prebuild` script runs automatically before `build`.

### Phase γ — Fallback State Detection

The existing `health.commerceReady` and `health.source` already track this. No changes needed — just pass health through to the banner component.

### Phase δ — Site-Wide Banner

In `src/app/(store)/layout.tsx` or `page-container.tsx`:

```typescript
{health.source === "fallback" && (
  <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
    <p className="text-sm font-medium text-amber-900">
      ⚠️ We're experiencing technical difficulties.
      Catalog information may be outdated. Ordering is temporarily disabled.
    </p>
    {health.metadata?.generated_at && (
      <p className="text-xs text-amber-700 mt-1">
        Last synced: {formatDistanceToNow(health.metadata.generated_at)} ago
      </p>
    )}
  </div>
)}
```

### Phase ε — Smoke Test

1. Locally set `SUPABASE_URL` to invalid value
2. Start dev server: `npm run dev`
3. Verify:
   - [ ] Site loads with fallback data
   - [ ] Prices are correct UGX values (from regenerated fallback)
   - [ ] Banner appears site-wide
   - [ ] "Add to cart" disabled
   - [ ] Checkout form disabled
   - [ ] Cart panel shows warning
4. Restore correct URL
5. Verify site recovers after cache TTL (60s)

---

## 5. Supporting Hardening (Optional, Separate Sessions)

| # | Item | Effort | Risk |
|---|------|--------|------|
| 1 | Sentry alert on CATALOG_FETCH_FAILED | 30 min | 🟢 Low |
| 2 | Optimize SELECT * to specific columns | 30 min | 🟢 Low |
| 3 | Verify idx_products_status usage via EXPLAIN | 10 min | 🟢 None |
| 4 | Verify Supabase connection pooling (Transaction mode) | 15 min | 🟢 None |
| 5 | Add catalog freshness timestamp to banner | Included in Phase δ | 🟢 Low |

### Sentry Alert Implementation

```typescript
// src/services/products.ts, in catch block
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error, {
  tags: { scope: "catalog", severity: "critical" },
  extra: {
    fallbackProductCount: FALLBACK_PRODUCTS.length,
    fallbackCategoryCount: FALLBACK_CATEGORIES.length
  }
});
```

### Optimized Product Query

```sql
-- Instead of SELECT *
SELECT id, name, slug, description, price, compare_at_price,
       currency, sku, stock_qty, status, category_id
FROM products
WHERE status = 'ACTIVE'
```

---

## 6. Decisions Needed Before Execution

- [ ] **Confirm:** Approve B+C combined approach?
- [ ] **Confirm:** Banner copy — "We're experiencing technical difficulties. Catalog information may be outdated. Ordering is temporarily disabled."
- [ ] **Confirm:** Regenerate fallback on EVERY deploy or only on production deploys?
- [ ] **Confirm:** Should Sentry alert fire on first CATALOG_FETCH_FAILED or only after 3+ in a row?
- [ ] **Confirm:** Show "Last synced X ago" in banner? (Requires storing timestamp in manifest)

---

## 7. Execution Plan (for tomorrow's session)

Copy-paste this prompt to execute:

```
EXECUTE the fallback bug fix plan from docs/fallback-bug-plan-2026-05-25.md.

Approach: B + C Combined (regenerate fallback + warning banner)

═══════════════════════════════════════════════════════
PHASE α — Create regeneration script
═══════════════════════════════════════════════════════

Create scripts/generate-fallback-catalog.ts per the plan.
Test it locally: npx tsx scripts/generate-fallback-catalog.ts

Verify data/catalog/catalog_manifest.json is regenerated with:
- "source": "supabase"
- Correct UGX prices
- Real categories from DB

STOP and confirm.

═══════════════════════════════════════════════════════
PHASE β — Wire into build
═══════════════════════════════════════════════════════

Update package.json:
- Add "generate-fallback" script
- Add "prebuild": "npm run generate-fallback"

Test: npm run build (should run generate-fallback first)

STOP and confirm.

═══════════════════════════════════════════════════════
PHASE γ — Add Sentry alerting
═══════════════════════════════════════════════════════

In src/services/products.ts, add Sentry.captureException
in the catch block per the plan.

STOP and confirm.

═══════════════════════════════════════════════════════
PHASE δ — Site-wide banner
═══════════════════════════════════════════════════════

In src/components/layout/page-container.tsx or appropriate location,
add the fallback warning banner that shows when health.source === "fallback".

STOP and confirm.

═══════════════════════════════════════════════════════
PHASE ε — Smoke test
═══════════════════════════════════════════════════════

1. Set SUPABASE_URL to invalid value locally
2. npm run dev
3. Verify checklist from plan
4. Restore correct URL
5. Verify recovery

STOP and report results.

═══════════════════════════════════════════════════════
PHASE ζ — Commit and deploy
═══════════════════════════════════════════════════════

Stage changes by concern:

Commit 1: scripts/generate-fallback-catalog.ts + package.json scripts
Commit 2: src/services/products.ts (Sentry alerting)
Commit 3: Banner component changes

Push and verify Vercel deploy.

STOP and report final status.
```

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Script fails at build time | Low | High (no fallback) | Script exits 0 on failure, uses existing fallback |
| Supabase unavailable at build | Low | Medium | Script has timeout, falls back to existing JSON |
| Banner annoys users | Low | Low | Only shows during actual outages |
| Cache causes stale banner | Medium | Low | 60s TTL is acceptable |

---

## 9. Success Criteria

After implementation:

- [ ] Fallback data has correct UGX prices matching production DB
- [ ] Fallback data has correct categories matching production DB
- [ ] Site-wide banner appears when in fallback mode
- [ ] Sentry alert fires when catalog fetch fails
- [ ] Checkout remains blocked in fallback mode (existing behavior)
- [ ] All smoke test items pass

---

**Plan document complete. Ready for user review and approval.**
