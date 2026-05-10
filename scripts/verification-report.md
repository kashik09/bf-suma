# Verification Report — 2026-05-09

## Part A: Social Media URLs

**Location:** `src/config/contact.ts` (lines 27-33)

### Current Values vs Client-Provided

| Platform | Current URL | Client URL | Status |
|----------|-------------|------------|--------|
| Facebook | `https://facebook.com/bfsumauganda` | `https://www.facebook.com/profile.php?id=61568820027321` | ❌ DIFFERS |
| Instagram | `https://instagram.com/bfsumauganda` | `https://instagram.com/bfsumaugandaoriginal` | ❌ DIFFERS |
| TikTok | `https://tiktok.com/@bfsumauganda` | `https://tiktok.com/bfsuma_ugandaoriginal` | ❌ DIFFERS |
| X | `https://x.com/bfsumauganda` | `https://x.com/BfsumaUga` | ❌ DIFFERS |
| YouTube | `https://youtube.com/@bfsumauganda` | `https://youtube.com/@Bfsumaugandaoriginal` | ❌ DIFFERS |

**Summary:** All 5 social URLs need updating.

---

## Part B: "FOCUS AREA" Label

**Grep results:** No matches found

```
Pattern: "FOCUS AREA" (case-insensitive)
Scope: src/
Matches: 0
```

**Summary:** ✅ "FOCUS AREA" text has been removed.

---

## Part C: "Live inventory validation is unavailable" Message

**Grep results:** 5 matches found

| File | Line | Context |
|------|------|---------|
| `src/lib/catalog-health.ts` | 63 | `return "Live inventory validation is unavailable. Browsing is read-only and checkout is temporarily disabled.";` |
| `src/components/storefront/checkout-form.tsx` | 241 | Fallback message in toast |
| `src/components/storefront/checkout-form.tsx` | 370 | Degraded commerce banner |
| `src/components/storefront/product-detail.tsx` | 425 | Product page degraded notice |
| `src/components/storefront/cart-panel.tsx` | 229 | Cart panel degraded notice |

**Summary:** ❌ Text still exists in 4 files (5 locations). These are fallback messages shown when `commerceReady === false`. They render when the catalog health check fails.

**Note:** This text is intentional for degraded-mode UX. It should NOT appear when inventory is working normally. If client is seeing this in production, it indicates a catalog health issue — not a code removal task.

---

## Part D: X Power Coffee SKU

**SQL Query to run in Supabase:**

```sql
SELECT sku, name, price, status
FROM public.products
WHERE name ILIKE '%xpower%coffee%' OR name ILIKE '%x power%coffee%'
   OR sku IN ('AP133A', 'AP113A');
```

**Expected:** Should return X Power Coffee row. Verify SKU matches spreadsheet (AP133A vs AP113A).

---

## Action Items

1. **Social URLs:** Update all 5 URLs in `src/config/contact.ts` SOCIAL_LINKS array
2. **FOCUS AREA:** No action needed (already removed)
3. **Live inventory message:** No action needed (intentional degraded-mode fallback)
4. **X Power Coffee SKU:** Run SQL query and compare against spreadsheet
