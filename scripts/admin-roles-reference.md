# BF Suma Admin Roles — Permission Reference

Generated: 2026-05-10

---

## Roles Overview

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full access to all admin features. Can manage other admin users. |
| `OPERATIONS` | Full operational access: products, orders, blog, packages, contacts, reviews. Cannot manage admin users. |
| `SUPPORT` | View-only access to operational data. Cannot create, edit, or delete records. |

**Source:** `admin_users.role` CHECK constraint in `supabase/migrations/20260404170000_admin_auth_and_schema_reconcile.sql:7-8`

```sql
role text not null default 'OPERATIONS'
  check (role in ('SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'))
```

---

## Permissions Matrix

### Dashboard & Navigation

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View dashboard | ✅ | ✅ | ✅ |
| See management quick actions | ✅ | ✅ | ❌ |
| View system health checks | ✅ | ✅ | ✅ |
| View revenue intelligence | ✅ | ✅ | ✅ |
| View decision board | ✅ | ✅ | ✅ |

### Products

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View product list | ✅ | ✅ | ✅ |
| View product details | ✅ | ✅ | ✅ |
| Create product | ✅ | ✅ | ❌ |
| Edit product | ✅ | ✅ | ❌ |
| Delete product | ✅ | ✅ | ❌ |

### Orders

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View order list | ✅ | ✅ | ✅ |
| View order details | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ❌ |

### Packages

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View package list | ✅ | ✅ | ✅ |
| View package details | ✅ | ✅ | ❌ |
| Create package | ✅ | ✅ | ❌ |
| Edit package | ✅ | ✅ | ❌ |
| Delete package | ✅ | ✅ | ❌ |

### Blog

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View blog list | ✅ | ✅ | ✅ |
| View blog post details | ✅ | ✅ | ❌ |
| Create blog post | ✅ | ✅ | ❌ |
| Edit blog post | ✅ | ✅ | ❌ |
| Delete blog post | ✅ | ✅ | ❌ |
| Publish/unpublish post | ✅ | ✅ | ❌ |

### Contacts

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View contact list | ✅ | ✅ | ✅ |
| Update contact status | ✅ | ✅ | ✅ |

### Reviews

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View reviews list | ✅ | ✅ | ✅ |
| Approve review | ✅ | ✅ | ❌ |
| Reject review | ✅ | ✅ | ❌ |

### Admin Users

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View admin users | ⚠️ | ❌ | ❌ |
| Create admin user | ⚠️ | ❌ | ❌ |
| Edit admin user | ⚠️ | ❌ | ❌ |
| Delete admin user | ⚠️ | ❌ | ❌ |

⚠️ **Note:** No admin user management UI exists in the codebase. Admin users are created via CLI scripts only (`scripts/bootstrap-admin.ts`). This is a security feature, not a gap.

### System & Settings

| Capability | SUPER_ADMIN | OPERATIONS | SUPPORT |
|------------|-------------|------------|---------|
| View admin guide | ✅ | ✅ | ✅ |
| Access settings page | ❌ | ❌ | ❌ |

**Note:** `/admin/settings` route is disabled via middleware unless `ALLOW_ADMIN_SCAFFOLD_ROUTES=true`.

---

## Route-Level Access

### Page Routes

| Route | SUPER_ADMIN | OPERATIONS | SUPPORT | Notes |
|-------|-------------|------------|---------|-------|
| `/admin` | ✅ | ✅ | ✅ | Dashboard (no explicit role check) |
| `/admin/login` | — | — | — | Public (auth page) |
| `/admin/reset-password` | — | — | — | Auth-gated (session required) |
| `/admin/guide` | ✅ | ✅ | ✅ | Explicit: all 3 roles |
| `/admin/products` | ✅ | ✅ | 👁️ | View all, edit buttons hidden for SUPPORT |
| `/admin/products/new` | ✅ | ✅ | ❌ | Explicit: SUPER_ADMIN, OPERATIONS |
| `/admin/products/[id]` | ✅ | ✅ | ❌ | Explicit: SUPER_ADMIN, OPERATIONS |
| `/admin/orders` | ✅ | ✅ | ✅ | No explicit role check (all authenticated) |
| `/admin/orders/[id]` | ✅ | ✅ | 👁️ | View all, status buttons hidden for SUPPORT |
| `/admin/packages` | ✅ | ✅ | 👁️ | View all, edit buttons hidden for SUPPORT |
| `/admin/packages/new` | ✅ | ✅ | ❌ | Explicit: SUPER_ADMIN, OPERATIONS |
| `/admin/packages/[id]` | ✅ | ✅ | ❌ | Explicit: SUPER_ADMIN, OPERATIONS |
| `/admin/blog` | ✅ | ✅ | 👁️ | View all, edit buttons hidden for SUPPORT |
| `/admin/blog/new` | ✅ | ✅ | ❌ | Explicit: SUPER_ADMIN, OPERATIONS |
| `/admin/blog/[id]` | ✅ | ✅ | ❌ | Explicit: SUPER_ADMIN, OPERATIONS |
| `/admin/contacts` | ✅ | ✅ | ✅ | Explicit: all 3 roles |
| `/admin/reviews` | ✅ | ✅ | 👁️ | View all, approve/reject for SUPER_ADMIN/OPS |
| `/admin/customers` | ❌ | ❌ | ❌ | Disabled (scaffold route) |
| `/admin/analytics` | ❌ | ❌ | ❌ | Disabled (scaffold route) |
| `/admin/settings` | ❌ | ❌ | ❌ | Disabled (scaffold route) |

**Legend:**
- ✅ Full access
- 👁️ View-only (edit actions hidden in UI)
- ❌ Blocked (redirect to login or 403)
- — Not applicable (public or auth-specific)

---

## Server Actions

All admin Server Actions are inline in page components (no separate `/api/admin` routes).

### Products

| Action | File:Line | SUPER_ADMIN | OPERATIONS | SUPPORT |
|--------|-----------|-------------|------------|---------|
| `createProduct` | `products/new/page.tsx:66` | ✅ | ✅ | ❌ |
| `updateProduct` | `products/[id]/page.tsx:84` | ✅ | ✅ | ❌ |
| `deleteProduct` | `products/[id]/page.tsx:137` | ✅ | ✅ | ❌ |

### Orders

| Action | File:Line | SUPER_ADMIN | OPERATIONS | SUPPORT |
|--------|-----------|-------------|------------|---------|
| `updateOrderStatus` | `orders/[id]/page.tsx:48` | ✅ | ✅ | ❌ |

### Packages

| Action | File:Line | SUPER_ADMIN | OPERATIONS | SUPPORT |
|--------|-----------|-------------|------------|---------|
| `createPackage` | `packages/new/page.tsx:63` | ✅ | ✅ | ❌ |
| `updatePackage` | `packages/[id]/page.tsx:75` | ✅ | ✅ | ❌ |
| `deletePackage` | `packages/[id]/page.tsx:134` | ✅ | ✅ | ❌ |

### Blog

| Action | File:Line | SUPER_ADMIN | OPERATIONS | SUPPORT |
|--------|-----------|-------------|------------|---------|
| `createPost` | `blog/new/page.tsx:81` | ✅ | ✅ | ❌ |
| `updatePost` | `blog/[id]/page.tsx:96` | ✅ | ✅ | ❌ |
| `deletePost` | `blog/[id]/page.tsx:149` | ✅ | ✅ | ❌ |

### Contacts

| Action | File:Line | SUPER_ADMIN | OPERATIONS | SUPPORT |
|--------|-----------|-------------|------------|---------|
| `updateContactStatus` | `contacts/page.tsx:71` | ✅ | ✅ | ✅ |

### Reviews

| Action | File:Line | SUPER_ADMIN | OPERATIONS | SUPPORT |
|--------|-----------|-------------|------------|---------|
| `approveReview` | `reviews/page.tsx:82` | ✅ | ✅ | ❌ |
| `rejectReview` | `reviews/page.tsx:100` | ✅ | ✅ | ❌ |

---

## RLS Policies on Admin Tables

Most admin-relevant tables use **service-role-only access** (RLS disabled or service_role granted ALL).

| Table | RLS Status | Client Access | Service Role |
|-------|------------|---------------|--------------|
| `admin_users` | Disabled | ❌ None | ✅ Full |
| `orders` | Disabled | ❌ None | ✅ Full |
| `order_items` | Disabled | ❌ None | ✅ Full |
| `order_status_history` | Disabled | ❌ None | ✅ Full |
| `products` | Disabled | ❌ None | ✅ Full |
| `product_images` | Disabled | ❌ None | ✅ Full |
| `categories` | Disabled | ❌ None | ✅ Full |
| `packages` | Enabled | ❌ Denied | ✅ Full |
| `package_items` | Enabled | ❌ Denied | ✅ Full |
| `blog_posts` | Disabled | ❌ None | ✅ Full |
| `contact_submissions` | Enabled | ❌ Denied | ✅ Full |
| `product_reviews` | Enabled | ⚠️ Limited | ✅ Full |
| `newsletter_subscribers` | Disabled | ❌ None | ✅ Full |
| `wishlists` | Enabled | ⚠️ Own rows | ✅ Full |

**Security model:** All admin operations go through Next.js Server Actions using the service role key. No direct PostgREST access to admin tables from browser.

---

## Gaps / Inconsistencies

### 1. Dashboard has no explicit role check

**File:** `src/app/admin/page.tsx:90`
```typescript
const session = await requireAdminSession(); // No role array = any authenticated admin
```

**Impact:** Low. All three roles should see the dashboard. The `canManageContent` flag hides management shortcuts for SUPPORT.

### 2. Orders list has no explicit role check

**File:** `src/app/admin/orders/page.tsx:48`
```typescript
await requireAdminSession(); // No role array
```

**Impact:** Low. All roles can view orders. Edit actions are gated at the detail page level.

### 3. No admin user management UI

**Status:** Intentional. Admin users are created via CLI scripts only.

**Recommendation:** If UI-based admin management is needed later, add `/admin/admin-users` route with `requireAdminSession(["SUPER_ADMIN"])`.

### 4. SUPPORT can update contact status

**File:** `src/app/admin/contacts/page.tsx:71`
```typescript
await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
```

**Impact:** This is likely intentional — SUPPORT should handle customer inquiries.

### 5. Package detail page blocks SUPPORT entirely

**File:** `src/app/admin/packages/[id]/page.tsx:59`
```typescript
await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
```

**Impact:** SUPPORT cannot even view package details. Consider changing to view-only access like products/orders if SUPPORT needs to answer customer questions about packages.

---

## Summary

| Role | Full Access | View-Only | No Access |
|------|-------------|-----------|-----------|
| `SUPER_ADMIN` | Everything | — | — |
| `OPERATIONS` | Products, Orders, Packages, Blog, Contacts, Reviews | — | Admin Users (no UI exists) |
| `SUPPORT` | Contacts | Products, Orders, Reviews, Blog list, Packages list | Create/Edit/Delete anything, Package details, Blog details |

---

*End of Reference*
