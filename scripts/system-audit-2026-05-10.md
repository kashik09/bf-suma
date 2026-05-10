# System Diagnostic Audit — 2026-05-10

## Part A: Catalog Health & commerceReady Status

### How `commerceReady` Works

**Location:** `src/lib/catalog-health.ts`

The `commerceReady` flag controls checkout availability across the storefront.

```
commerceReady = true  → Checkout enabled
commerceReady = false → Checkout disabled, degraded-mode banners shown
```

### Decision Logic

1. **Manual override check** (line 13-15):
   ```typescript
   function isInventorySyncBroken(): boolean {
     return process.env.NEXT_PUBLIC_INVENTORY_SYNC_BROKEN === "true";
   }
   ```

2. **Live catalog path** (`buildLiveCatalogHealth`):
   - If `NEXT_PUBLIC_INVENTORY_SYNC_BROKEN === "true"` → `commerceReady: false`
   - Otherwise → `commerceReady: true`

3. **Fallback path** (`buildFallbackCatalogHealth`):
   - Always → `commerceReady: false`
   - Triggered when Supabase catalog fetch fails

### Where Catalog Fetch Can Fail

**Location:** `src/services/products.ts:234-316`

The `fetchCatalogFromSupabase()` function can fail if:
- `categoriesRes.error`, `productsRes.error`, or `imagesRes.error` is truthy
- No products or categories are returned (line 307-309)

When failure occurs:
- `logCatalogFallback()` writes a JSON warning to console
- Fallback static catalog (`BFSUMA_CATALOG`) is used
- All products are coerced to `OUT_OF_STOCK`
- `commerceReady` becomes `false`

### Env Var to Check

```
NEXT_PUBLIC_INVENTORY_SYNC_BROKEN
```

If this is set to `"true"`, commerce is forcibly degraded regardless of DB health.

---

## Part B: Cart/Checkout Image Sourcing

### How Cart Gets Product Images

**Location:** `src/lib/cart.ts:61-72`

When adding to cart, `image_url` is captured from the `StorefrontProduct` object:

```typescript
current.push({
  product_id: product.id,
  // ...
  image_url: product.image_url,  // ← comes from StorefrontProduct
  // ...
});
```

### How StorefrontProduct Gets Its image_url

**Location:** `src/services/products.ts:274-305`

```typescript
const productImages = imagesByProductId.get(product.id) || [];
const imageUrls = productImages.map((image) => image.url).filter(Boolean);

return {
  // ...
  image_url:
    imageUrls[0] ||                                                        // 1st: DB product_images
    FALLBACK_PRODUCTS.find((fp) => fp.slug === product.slug)?.image_url || // 2nd: static fallback
    FALLBACK_PRODUCTS[0].image_url,                                        // 3rd: generic fallback
  // ...
};
```

### Image Resolution Order

1. **First** `product_images` row with `sort_order=0` from DB
2. **Second** matching slug in static `BFSUMA_CATALOG.products`
3. **Third** generic fallback image

### Cart Display

**Location:** `src/components/storefront/cart-panel.tsx:140-147`

```typescript
<Image
  src={item.image_url || "/catalog-images/placeholder.svg"}
  // ...
/>
```

### Finding: No Broken Join

The `product_images` table IS being joined correctly (line 240):
```typescript
supabase.from("product_images").select("*").order("sort_order", { ascending: true })
```

If cart shows placeholders, likely causes:
- Part 1 SQL not yet executed
- `product_images` rows don't exist for those SKUs
- Cache hasn't refreshed (60-second unstable_cache)

---

## Part C: Admin System Audit

### Authentication Flow

**Location:** `src/app/admin/login/page.tsx`

1. Checks for existing session via `getAdminSessionFromCookies()`
2. If authenticated + `mustResetPassword: true` → redirect to `/admin/reset-password`
3. If authenticated → redirect to `/admin`
4. Otherwise → render login form

### Middleware Protection

**Location:** `src/middleware.ts:136-154`

```typescript
if (isAdminRoute(pathname) && !isAdminLoginRoute && !isAdminLogoutRoute && !isAdminResetPasswordRoute) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const adminSession = await verifyAdminSessionToken(token);

  if (!adminSession) {
    // Redirect to login, set flash cookie for return path
  }

  if (adminSession.mustResetPassword) {
    // Redirect to reset-password page
  }
}
```

### Known Edge Cases

1. **Reset password loop**: If `mustResetPassword` flag stuck, user can't access admin
2. **Legacy scaffold routes**: Disabled unless `ALLOW_ADMIN_SCAFFOLD_ROUTES=true`
   - `/admin/customers`, `/admin/analytics`, `/admin/settings` redirect to `/admin`

### Session Cookie Details

- Cookie name: `ADMIN_SESSION_COOKIE_NAME` (from `@/lib/admin-session`)
- HttpOnly: true
- SameSite: strict
- Secure: true
- Standard max age: `ADMIN_SESSION_MAX_AGE_SECONDS`
- Reset session max age: 15 minutes

### Layout Behavior

**Location:** `src/app/admin/layout.tsx:15-17`

Login and reset-password pages bypass the admin shell layout:
```typescript
if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
  return <>{children}</>;
}
```

---

## Part D: Image Audit Verification

### Product Images on Disk

**Location:** `public/products/`

| File | Exists |
|------|--------|
| detoxilive-pro-oil.jpg | ✅ |
| sharp-vision.jpg | ✅ |
| anatic-herbal-soap.jpg | ✅ |
| ntdiarr-pills.jpg | ✅ |
| dr-toothpaste.jpg | ✅ |
| prostatrelax.jpg | ✅ |
| xpower-coffee.jpg | ✅ |
| xpower-man-plus.jpg | ✅ |
| gluzojoint-ultra-pro.jpg | ✅ |
| cerebrain.jpg | ✅ |
| micro2-cycle.jpg | ✅ |

**Result:** All 11 product images present.

### Package Images on Disk

**Location:** `public/package-images/`

The SQL file references `/package-images/final/*.webp` but **no `final/` subdirectory exists**.

Available package images in root:
| File | Path |
|------|------|
| cardiovascular-health.webp | `/package-images/cardiovascular-health.webp` |
| digestive-health-ulcers.webp | `/package-images/digestive-health-ulcers.webp` |
| fibroids-support.webp | `/package-images/fibroids-support.webp` |
| immunity.webp | `/package-images/immunity.webp` |
| kidney-health.webp | `/package-images/kidney-health.webp` |
| liver-health.webp | `/package-images/liver-health.webp` |
| mens-health.webp | `/package-images/mens-health.webp` |
| weight-loss.webp | `/package-images/weight-loss.webp` |
| weight-management.webp | `/package-images/weight-management.webp` |
| womens-health.webp | `/package-images/womens-health.webp` |
| blood-sugar-pack.webp | `/package-images/blood-sugar-pack.webp` |
| prostate-zaminocal.webp | `/package-images/prostate-zaminocal.webp` (orphan) |

### SQL Path Mismatch

**Part 2 SQL uses:**
```sql
'/package-images/final/cardiovascular-health.webp'
```

**Actual path:**
```
/package-images/cardiovascular-health.webp
```

**Action required:** Either:
1. Create `public/package-images/final/` and move images there, OR
2. Update SQL to use `/package-images/` (no `final/` subfolder)

### Database Verification SQL

Run after Part 1 (already verified ✅):
```sql
SELECT p.sku, p.name, pi.url
FROM public.products p
JOIN public.product_images pi ON pi.product_id = p.id
WHERE p.sku IN ('AP166B','AP188A','AP024E','AP132B','AP10/E','AP009F','AP113A','AP029E','AP190A','AP077E','AP004E')
  AND pi.sort_order = 0
ORDER BY p.sku;
```

Run after Part 2:
```sql
SELECT slug, hero_image_url
FROM public.packages
WHERE slug IN (
  'cardiovascular-health',
  'digestive-health-ulcers',
  'fibroids-package',
  'immunity-package',
  'kidney-health',
  'liver-health',
  'xpower-mens-health',
  'weight-loss-reset-system',
  'weight-management-loss',
  'womens-health-beauty',
  'blood-sugar-diabetic-pack',
  'bone-joint-care'
)
ORDER BY slug;
```

---

## Part E: Code Hygiene Scan

### Console Statements

**Files with console.log/warn/error:** 11 files

| File | Type | Purpose |
|------|------|---------|
| `src/services/products.ts:101` | warn | Catalog fallback JSON log |
| `src/services/product-reviews.ts` | error | Review fetch/submit failures (4 locations) |
| `src/services/blog.ts` | warn/error | Blog unavailable/errors (4 locations) |
| `src/services/blog-submissions.ts` | error | Submission errors (4 locations) |
| `src/lib/logger.ts` | log/warn/error | Structured logger implementation |
| `src/components/storefront/hero.tsx` | warn | Duplicate/missing hero images |
| `src/app/api/contact/route.ts` | error | Contact form failures |
| `src/app/api/orders/[id]/route.ts` | error | Order get/patch failures |
| `src/app/api/account/wishlist/*.ts` | error | Wishlist API failures |
| `src/app/api/account/profile/route.ts` | error | Profile update failure |

**Assessment:** Most console statements are intentional error logging. No debug/dev cruft detected.

### TODO/FIXME Comments

**2 items found:**

1. `src/components/admin/package-form.tsx:270`
   ```
   TODO: Image upload component. For now, paste direct URLs.
   ```

2. `src/app/api/contact/route.ts:14`
   ```
   TODO: In production, replace with Vercel KV or Redis for distributed rate limiting
   ```

**Assessment:** Both are known deferred features, not blockers.

### Hardcoded Values

**Phone numbers:** Consolidated to `src/config/contact.ts` ✅

**Till numbers:** In `src/config/contact.ts`
```typescript
airtelTill: "7063501",
mtnTill: "82661246",
```

**Social links:** In `src/config/contact.ts` (all 5 updated)

**Store currency:** `src/lib/utils.ts` exports `STORE_CURRENCY`

**No env-dependent hardcodes detected in application code.**

---

## Part F: Summary & Action Items

### Status Summary

| Area | Status | Notes |
|------|--------|-------|
| commerceReady logic | ✅ Working | Check env var if degraded |
| Cart image sourcing | ✅ Correct | Uses product_images table |
| Admin auth | ✅ Working | Standard session flow |
| Part 1 SQL | ✅ Executed | 11 products verified |
| Part 2 SQL | ⚠️ Path issue | `final/` subfolder doesn't exist |
| Code hygiene | ✅ Clean | 2 minor TODOs |

### Immediate Actions

1. **Fix Part 2 SQL paths:**
   - Update all `/package-images/final/*.webp` to `/package-images/*.webp`
   - OR create `final/` subfolder and move images

2. **Verify cache refresh:**
   - After DB updates, wait 60s for `unstable_cache` to refresh
   - OR trigger revalidation if available

### Potential Issues to Monitor

1. If `NEXT_PUBLIC_INVENTORY_SYNC_BROKEN=true`, checkout stays disabled
2. If DB connection fails, fallback catalog activates (all OUT_OF_STOCK)
3. Part 2 SQL will succeed but images won't display until paths match disk

---

*Generated: 2026-05-10*
*Scope: Read-only diagnostic audit*
