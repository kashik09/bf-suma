# BF Suma Admin Roles — Permission Reference

Generated: 2026-05-10 (Updated with delete restrictions)

---

## Roles Overview

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full access to all admin features including deletion. Can manage other admin users. |
| `OPERATIONS` | Full operational access: create/edit products, orders, blog, packages, contacts, reviews. Cannot delete records or manage admin users. |
| `EXECUTIVE` | Same operational access as OPERATIONS. Used to distinguish the client (business owner) from internal team in audit logs. Cannot delete records. |
| `SUPPORT` | View-only access to operational data. Cannot create, edit, or delete records. |

**Source:** `admin_users.role` CHECK constraint in `supabase/migrations/20260510120000_add_executive_admin_role.sql`

```sql
CHECK (role IN ('SUPER_ADMIN', 'OPERATIONS', 'EXECUTIVE', 'SUPPORT'))
```

---

## Permissions Matrix

### Dashboard & Navigation

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| See management quick actions | ✅ | ✅ | ✅ | ❌ |
| View system health checks | ✅ | ✅ | ✅ | ✅ |
| View revenue intelligence | ✅ | ✅ | ✅ | ✅ |
| View decision board | ✅ | ✅ | ✅ | ✅ |

### Products

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View product list | ✅ | ✅ | ✅ | ✅ |
| View product details | ✅ | ✅ | ✅ | ✅ |
| Create product | ✅ | ✅ | ✅ | ❌ |
| Edit product | ✅ | ✅ | ✅ | ❌ |
| Delete product | ✅ | ❌ | ❌ | ❌ |

### Orders

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View order list | ✅ | ✅ | ✅ | ✅ |
| View order details | ✅ | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ✅ | ❌ |

### Packages

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View package list | ✅ | ✅ | ✅ | ✅ |
| View package details | ✅ | ✅ | ✅ | ❌ |
| Create package | ✅ | ✅ | ✅ | ❌ |
| Edit package | ✅ | ✅ | ✅ | ❌ |
| Delete package | ✅ | ❌ | ❌ | ❌ |

### Blog

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View blog list | ✅ | ✅ | ✅ | ✅ |
| View blog post details | ✅ | ✅ | ✅ | ❌ |
| Create blog post | ✅ | ✅ | ✅ | ❌ |
| Edit blog post | ✅ | ✅ | ✅ | ❌ |
| Delete blog post | ✅ | ❌ | ❌ | ❌ |
| Publish/unpublish post | ✅ | ✅ | ✅ | ❌ |

### Contacts

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View contact list | ✅ | ✅ | ✅ | ✅ |
| Update contact status | ✅ | ✅ | ✅ | ✅ |

### Reviews

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View reviews list | ✅ | ✅ | ✅ | ✅ |
| Approve review | ✅ | ✅ | ✅ | ❌ |
| Reject review | ✅ | ✅ | ✅ | ❌ |

### Deletion (Restricted)

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| Delete product | ✅ | ❌ | ❌ | ❌ |
| Delete package | ✅ | ❌ | ❌ | ❌ |
| Delete blog post | ✅ | ❌ | ❌ | ❌ |

**Note:** Delete operations are restricted to SUPER_ADMIN only. This prevents accidental data loss by operational staff. Records can be archived or deactivated instead of deleted.

### Admin Users

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View admin users | ⚠️ | ❌ | ❌ | ❌ |
| Create admin user | ⚠️ | ❌ | ❌ | ❌ |
| Edit admin user | ⚠️ | ❌ | ❌ | ❌ |
| Delete admin user | ⚠️ | ❌ | ❌ | ❌ |

⚠️ **Note:** No admin user management UI exists in the codebase. Admin users are created via CLI scripts only (`scripts/bootstrap-admin.ts`). This is a security feature, not a gap.

### System & Settings

| Capability | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|------------|-------------|------------|-----------|---------|
| View admin guide | ✅ | ✅ | ✅ | ✅ |
| Access settings page | ❌ | ❌ | ❌ | ❌ |

**Note:** `/admin/settings` route is disabled via middleware unless `ALLOW_ADMIN_SCAFFOLD_ROUTES=true`.

---

## Route-Level Access

### Page Routes

| Route | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT | Notes |
|-------|-------------|------------|-----------|---------|-------|
| `/admin` | ✅ | ✅ | ✅ | ✅ | Dashboard |
| `/admin/login` | — | — | — | — | Public (auth page) |
| `/admin/reset-password` | — | — | — | — | Auth-gated (session required) |
| `/admin/guide` | ✅ | ✅ | ✅ | ✅ | Explicit: ALL_ADMIN_ROLES |
| `/admin/products` | ✅ | ✅ | ✅ | 👁️ | View all, edit buttons hidden for SUPPORT |
| `/admin/products/new` | ✅ | ✅ | ✅ | ❌ | Explicit: OPERATIONAL_ROLES |
| `/admin/products/[id]` | ✅ | ✅ | ✅ | ❌ | Delete button hidden for non-SUPER_ADMIN |
| `/admin/orders` | ✅ | ✅ | ✅ | ✅ | No explicit role check (all authenticated) |
| `/admin/orders/[id]` | ✅ | ✅ | ✅ | 👁️ | View all, status buttons hidden for SUPPORT |
| `/admin/packages` | ✅ | ✅ | ✅ | 👁️ | View all, edit buttons hidden for SUPPORT |
| `/admin/packages/new` | ✅ | ✅ | ✅ | ❌ | Explicit: OPERATIONAL_ROLES |
| `/admin/packages/[id]` | ✅ | ✅ | ✅ | ❌ | Delete button hidden for non-SUPER_ADMIN |
| `/admin/blog` | ✅ | ✅ | ✅ | 👁️ | View all, edit buttons hidden for SUPPORT |
| `/admin/blog/new` | ✅ | ✅ | ✅ | ❌ | Explicit: OPERATIONAL_ROLES |
| `/admin/blog/[id]` | ✅ | ✅ | ✅ | ❌ | Delete button hidden for non-SUPER_ADMIN |
| `/admin/contacts` | ✅ | ✅ | ✅ | ✅ | Explicit: ALL_ADMIN_ROLES |
| `/admin/reviews` | ✅ | ✅ | ✅ | 👁️ | View all, approve/reject for OPERATIONAL_ROLES |
| `/admin/customers` | ❌ | ❌ | ❌ | ❌ | Disabled (scaffold route) |
| `/admin/analytics` | ❌ | ❌ | ❌ | ❌ | Disabled (scaffold route) |
| `/admin/settings` | ❌ | ❌ | ❌ | ❌ | Disabled (scaffold route) |

**Legend:**
- ✅ Full access
- 👁️ View-only (edit actions hidden in UI)
- ❌ Blocked (redirect to login or 403)
- — Not applicable (public or auth-specific)

---

## Server Actions

All admin Server Actions are inline in page components (no separate `/api/admin` routes).

### Products

| Action | File | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|--------|------|-------------|------------|-----------|---------|
| `createProduct` | `products/new/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `updateProduct` | `products/[id]/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `deleteProduct` | `products/[id]/page.tsx` | ✅ | ❌ | ❌ | ❌ |

### Orders

| Action | File | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|--------|------|-------------|------------|-----------|---------|
| `updateOrderStatus` | `orders/[id]/page.tsx` | ✅ | ✅ | ✅ | ❌ |

### Packages

| Action | File | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|--------|------|-------------|------------|-----------|---------|
| `createPackage` | `packages/new/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `updatePackage` | `packages/[id]/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `deletePackage` | `packages/[id]/page.tsx` | ✅ | ❌ | ❌ | ❌ |

### Blog

| Action | File | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|--------|------|-------------|------------|-----------|---------|
| `createPost` | `blog/new/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `updatePost` | `blog/[id]/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `deletePost` | `blog/[id]/page.tsx` | ✅ | ❌ | ❌ | ❌ |

### Contacts

| Action | File | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|--------|------|-------------|------------|-----------|---------|
| `updateContactStatus` | `contacts/page.tsx` | ✅ | ✅ | ✅ | ✅ |

### Reviews

| Action | File | SUPER_ADMIN | OPERATIONS | EXECUTIVE | SUPPORT |
|--------|------|-------------|------------|-----------|---------|
| `approveReview` | `reviews/page.tsx` | ✅ | ✅ | ✅ | ❌ |
| `rejectReview` | `reviews/page.tsx` | ✅ | ✅ | ✅ | ❌ |

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

## Implementation Details

### Role Constants (src/lib/admin-permissions.ts)

```typescript
export const OPERATIONAL_ROLES: AdminRole[] = ["SUPER_ADMIN", "OPERATIONS", "EXECUTIVE"];
export const VIEW_ONLY_ROLES: AdminRole[] = ["SUPPORT"];
export const ALL_ADMIN_ROLES: AdminRole[] = [...OPERATIONAL_ROLES, ...VIEW_ONLY_ROLES];

export function canEdit(role): boolean {
  return OPERATIONAL_ROLES.includes(role);
}

export function canDelete(role): boolean {
  return role === "SUPER_ADMIN";
}
```

---

## Summary

| Role | Create/Edit | Delete | View-Only | No Access |
|------|-------------|--------|-----------|-----------|
| `SUPER_ADMIN` | Everything | Everything | — | — |
| `OPERATIONS` | Products, Orders, Packages, Blog, Contacts, Reviews | ❌ Nothing | — | Admin Users, Delete actions |
| `EXECUTIVE` | Products, Orders, Packages, Blog, Contacts, Reviews | ❌ Nothing | — | Admin Users, Delete actions |
| `SUPPORT` | ❌ Nothing | ❌ Nothing | Products, Orders, Reviews, Blog list, Packages list | Create/Edit/Delete anything, Package details, Blog details |

**Key differences:**
- **SUPER_ADMIN** is the only role that can delete products, packages, or blog posts.
- **EXECUTIVE** and **OPERATIONS** have identical create/edit permissions but cannot delete.
- **EXECUTIVE** is used for client/business owner accounts to distinguish them from internal team members in audit logs.

---

*End of Reference*
