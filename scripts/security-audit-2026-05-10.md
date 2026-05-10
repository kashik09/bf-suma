# Security Audit — 2026-05-10

## Executive Summary

**Overall Grade: B+**

Top 3 Critical Issues:
1. **No rate limiting on admin login** — brute force vulnerability
2. **Test function exposed to anon** — `test_decrement_product_stock` callable without auth
3. **Missing Content-Security-Policy header** — XSS protection gap

---

## RLS Policies Status

### SQL Query for Verification
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Table-by-Table Breakdown

| Table | RLS Enabled | Notes |
|-------|-------------|-------|
| `admin_users` | ❌ No | Service-role only access (acceptable) |
| `blog_posts` | ❌ No | Service-role only access |
| `categories` | ❌ No | Service-role only access |
| `contact_submissions` | ✅ Yes | Policies restrict to service_role |
| `customers` | ❌ No | ⚠️ Contains PII — should review |
| `newsletter_subscribers` | ❌ No | Contains email addresses |
| `order_items` | ❌ No | Service-role only access |
| `order_status_history` | ❌ No | Service-role only access |
| `orders` | ❌ No | Contains customer data |
| `package_items` | ✅ Yes | Policies deny anon |
| `packages` | ✅ Yes | Policies deny anon |
| `product_images` | ❌ No | Service-role only access |
| `product_reviews` | ✅ Yes | Limited public access for reads |
| `products` | ❌ No | Service-role only access |
| `wishlists` | ✅ Yes | User owns their rows |

**Risk Assessment:** Most tables rely on service-role-only access pattern. This is acceptable given all admin operations go through Server Actions with proper auth checks.

---

## Secrets Hygiene

### Grep Results

| Pattern | Found | Location | Status |
|---------|-------|----------|--------|
| `sk_` (Stripe keys) | 0 | — | ✅ Clean |
| `sb-` (Supabase tokens) | 0 | — | ✅ Clean |
| `Bearer ` | 2 | Proper usage in API calls | ✅ OK |
| Hardcoded API keys | 0 | — | ✅ Clean |
| `secret` keyword | 8 | Config/env resolution | ✅ OK |

### .gitignore Coverage

```
✅ .env
✅ .env.local
✅ .env.development.local
✅ .env.test.local
✅ .env.production.local
✅ .env*.local
```

**Status:** ✅ All sensitive env files are gitignored.

---

## Auth Flow

### Admin Login (`/admin/login`)

| Check | Status | Notes |
|-------|--------|-------|
| Input validation | ✅ | Basic email/password check |
| Rate limiting | ❌ | **MISSING** — brute force risk |
| Session cookie flags | ✅ | httpOnly, sameSite=strict, secure |
| Password verification | ✅ | Uses scrypt hashing |
| Timing attack protection | ⚠️ | Early return on missing user |

**Cookie Security Flags:**
```typescript
{
  httpOnly: true,      // ✅ Prevents XSS cookie theft
  sameSite: "strict",  // ✅ CSRF protection
  secure: true,        // ✅ HTTPS only
  maxAge: 43200,       // 12 hours
  path: "/"
}
```

### Password Reset (`/admin/reset-password`)

| Check | Status | Notes |
|-------|--------|-------|
| Session required | ✅ | Must have valid session |
| Password strength validation | ✅ | `validatePasswordStrength()` |
| Old password invalidation | ✅ | `password_version` incremented |
| Session expiry on reset | ⚠️ | 15-minute temp session |

### Logout (`/admin/logout`)

| Check | Status | Notes |
|-------|--------|-------|
| Cookie cleared | ✅ | maxAge=0 |
| Server-side invalidation | ❌ | No server-side session store |
| Redirect to login | ✅ | Redirects to /admin/login |

**Note:** Session is stateless (HMAC-signed token). No server-side session to invalidate. Token remains valid until expiry if stolen.

---

## Server Actions Coverage

### Products

| Action | File | Auth Check | Zod Validation | Role Check |
|--------|------|------------|----------------|------------|
| `createProduct` | `products/new/page.tsx:67` | ✅ | ✅ | ✅ OPERATIONAL_ROLES |
| `updateProduct` | `products/[id]/page.tsx:85` | ✅ | ✅ | ✅ OPERATIONAL_ROLES |
| `deleteProduct` | `products/[id]/page.tsx:138` | ✅ | — | ✅ canDelete() |

### Packages

| Action | File | Auth Check | Zod Validation | Role Check |
|--------|------|------------|----------------|------------|
| `createPackage` | `packages/new/page.tsx:64` | ✅ | ✅ | ✅ OPERATIONAL_ROLES |
| `updatePackage` | `packages/[id]/page.tsx:76` | ✅ | ✅ | ✅ OPERATIONAL_ROLES |
| `deletePackage` | `packages/[id]/page.tsx:135` | ✅ | — | ✅ canDelete() |

### Blog

| Action | File | Auth Check | Zod Validation | Role Check |
|--------|------|------------|----------------|------------|
| `createPost` | `blog/new/page.tsx:82` | ✅ | ✅ | ✅ OPERATIONAL_ROLES |
| `updatePost` | `blog/[id]/page.tsx:97` | ✅ | ✅ | ✅ OPERATIONAL_ROLES |
| `deletePost` | `blog/[id]/page.tsx:150` | ✅ | — | ✅ canDelete() |

### Orders

| Action | File | Auth Check | Zod Validation | Role Check |
|--------|------|------------|----------------|------------|
| `updateOrderStatus` | via API route | ✅ | ✅ | ✅ OPERATIONAL_ROLES |

### Contacts

| Action | File | Auth Check | Zod Validation | Role Check |
|--------|------|------------|----------------|------------|
| `updateContactStatus` | `contacts/page.tsx:72` | ✅ | ⚠️ Basic | ✅ ALL_ADMIN_ROLES |

### Reviews

| Action | File | Auth Check | Zod Validation | Role Check |
|--------|------|------------|----------------|------------|
| `approveReview` | `reviews/page.tsx:83` | ✅ | ⚠️ Basic | ✅ OPERATIONAL_ROLES |
| `rejectReview` | `reviews/page.tsx:101` | ✅ | ⚠️ Basic | ✅ OPERATIONAL_ROLES |

**Overall:** ✅ All Server Actions have auth checks and role validation.

---

## API Routes Coverage

| Route | Auth | Rate Limit | Validation | Error Handling |
|-------|------|------------|------------|----------------|
| `/api/contact` | ❌ Public | ✅ 3/hr IP | ✅ Zod | ✅ Generic |
| `/api/newsletter` | ❌ Public | ❌ None | ⚠️ Basic | ✅ Generic |
| `/api/search` | ❌ Public | ❌ None | ⚠️ Query | ✅ Generic |
| `/api/reviews` | ❌ Public | ❌ None | ✅ Zod | ✅ Generic |
| `/api/products` | ❌ Public | ❌ None | — | ✅ Generic |
| `/api/products/[id]` | ❌ Public | ❌ None | ✅ UUID | ✅ Generic |
| `/api/orders` | ✅ Admin | ❌ None | — | ✅ Generic |
| `/api/orders/[id]` | ✅ Admin | ❌ None | ✅ Zod | ✅ Structured |
| `/api/orders/resend-confirmation` | ⚠️ Weak | ❌ None | ✅ Zod | ✅ Generic |
| `/api/account/profile` | ✅ Supabase | ❌ None | ✅ Zod | ✅ Generic |
| `/api/account/wishlist` | ✅ Supabase | ❌ None | ✅ Zod | ✅ Generic |
| `/api/account/wishlist/sync` | ✅ Supabase | ❌ None | — | ✅ Generic |
| `/api/abandoned-cart` | ⚠️ Check | ❌ None | ✅ Zod | ✅ Generic |

**Notes:**
- Public routes (`/api/contact`, `/api/newsletter`) are intentionally unauthenticated
- Admin routes properly use `assertAdminRequest()`
- Most routes lack rate limiting (acceptable for authenticated routes)

---

## Security Headers

### Currently Set (next.config.ts)

| Header | Value | Status |
|--------|-------|--------|
| `X-Frame-Options` | `DENY` | ✅ Clickjacking protection |
| `X-Content-Type-Options` | `nosniff` | ✅ MIME sniffing protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Referrer control |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ Feature restrictions |

### Missing Headers

| Header | Risk | Recommendation |
|--------|------|----------------|
| `Content-Security-Policy` | ⚠️ Medium | Add CSP to prevent XSS |
| `Strict-Transport-Security` | ⚠️ Low | Vercel adds this automatically |
| `X-XSS-Protection` | ℹ️ Info | Deprecated, CSP preferred |

---

## CSRF Protection

| Endpoint Type | Protection | Notes |
|---------------|------------|-------|
| Server Actions | ✅ Built-in | Next.js provides automatic CSRF protection |
| Admin API routes | ✅ OK | Use custom auth tokens via headers |
| Public POST routes | ⚠️ Review | `/api/contact`, `/api/newsletter` lack CSRF |

**Public POST Routes Analysis:**

| Route | CSRF Risk | Mitigation |
|-------|-----------|------------|
| `/api/contact` | Low | Rate-limited, honeypot field |
| `/api/newsletter` | Low | Email-only, no sensitive action |
| `/api/reviews` | Medium | Should add auth or CSRF token |

---

## Supabase Function Exposure

### Functions Callable by Anon

| Function | Risk | Recommendation |
|----------|------|----------------|
| `test_decrement_product_stock` | 🔴 HIGH | **DROP immediately** — test function in production |
| `set_updated_at` | ✅ Low | Trigger function, not directly callable |
| `process_order_intake_atomic` | ⚠️ Medium | Review access control |
| `process_order_intake_atomic_v2` | ⚠️ Medium | Review access control |

### Recommended SQL Fix

```sql
-- Drop test function immediately
DROP FUNCTION IF EXISTS public.test_decrement_product_stock(uuid, integer);

-- Revoke anon access to order processing functions
REVOKE EXECUTE ON FUNCTION public.process_order_intake_atomic FROM anon;
REVOKE EXECUTE ON FUNCTION public.process_order_intake_atomic_v2 FROM anon;
```

---

## Recommendations Ranked

### 🔴 Critical (Fix Immediately)

1. **Drop test_decrement_product_stock function**
   - Risk: Allows anonymous users to manipulate stock
   - Fix: `DROP FUNCTION public.test_decrement_product_stock`

2. **Add rate limiting to admin login**
   - Risk: Brute force password attacks
   - Fix: Implement IP-based rate limiting (5 attempts/15 min)

### 🟠 High (Fix This Sprint)

3. **Add Content-Security-Policy header**
   - Risk: XSS attacks
   - Fix: Add `default-src 'self'; script-src 'self' 'unsafe-inline'...`

4. **Review order processing function access**
   - Risk: Unauthorized order creation
   - Fix: Require authenticated user or service_role

### 🟡 Medium (Fix Next Sprint)

5. **Add rate limiting to public POST routes**
   - Routes: `/api/newsletter`, `/api/reviews`
   - Fix: IP-based rate limiting

6. **Implement server-side session store**
   - Risk: Stolen tokens remain valid
   - Fix: Redis-based session with revocation

7. **Add CSRF protection to review submission**
   - Risk: Cross-site review manipulation
   - Fix: Require auth token or CSRF token

---

*Generated: 2026-05-10*
