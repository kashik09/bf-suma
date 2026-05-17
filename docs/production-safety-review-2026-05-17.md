# Production Safety Review — 2026-05-17

**Reviewed commit:** `a3c4540`
**Reviewer:** Claude Code (automated)
**Scope:** Full pre-launch security, performance, and compliance audit

---

## Verdict

### 🟡 LAUNCH WITH KNOWN GAPS

The application is functionally ready for production. Authentication, authorization, and critical user flows are solid. However, several database tables containing PII lack Row-Level Security (RLS), and Content-Security-Policy headers are not configured. These are addressable post-launch but represent known risk surface.

**Recommendation:** Proceed with soft launch. Prioritize RLS + CSP within first week.

---

## Scorecard

| Category | Grade | Comment |
|----------|-------|---------|
| Build & Types | **A** | Clean build, 0 TypeScript errors |
| Authentication | **A** | scrypt hashing, rate limiting, secure cookies |
| Authorization | **A** | All admin actions require session + role check |
| Data Protection | **C** | 15 tables lack RLS, including customers/orders |
| Database Hardening | **C** | 4 SECURITY DEFINER functions callable by anon |
| Frontend Security | **B** | Missing CSP header |
| Data Integrity | **B** | 24 test orders to clean before launch |
| Performance | **B** | 6 routes 200-240KB, 1 oversized image |
| Compliance | **A** | Legal pages, contact info, Uganda localization complete |
| SEO | **B+** | Strong foundation, missing some JSON-LD schemas |

---

## Ranked Findings

### 1. [HIGH] PII Tables Without Row-Level Security

**Tables affected:** customers, orders, newsletter_subscribers, admin_users, order_items, order_events, order_status_history

**Risk:** If anon key is exposed or RLS bypass occurs, customer PII (emails, phones, addresses) could be leaked.

**Fix:** Enable RLS on all PII tables with appropriate policies:
```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Add policies for service_role and authenticated users
```

**Effort:** 2-4 hours
**Blocks launch?** No (service-role access pattern mitigates immediate risk)

---

### 2. [HIGH] Missing Content-Security-Policy Header

**Risk:** XSS attacks have no CSP mitigation. Inline scripts could be injected.

**Fix:** Add CSP to middleware security headers:
```typescript
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self';"
```

**Effort:** 30 minutes
**Blocks launch?** No

---

### 3. [MEDIUM] SECURITY DEFINER Functions Callable by Anon

**Functions:** process_order_intake_atomic, process_order_intake_atomic_v2, update_order_status_with_history, invoke_lifecycle_edge_function

**Risk:** These bypass RLS by design for checkout flow. If exploited, could manipulate orders.

**Fix:** REVOKE EXECUTE from anon, grant only to service_role:
```sql
REVOKE EXECUTE ON FUNCTION public.process_order_intake_atomic_v2 FROM anon;
GRANT EXECUTE ON FUNCTION public.process_order_intake_atomic_v2 TO service_role;
```

**Effort:** 1 hour (requires testing checkout flow)
**Blocks launch?** No

---

### 4. [MEDIUM] 24 Test Orders in Production Database

**Risk:** Pollutes analytics, confuses order management, test emails in customer list.

**Fix:** Run cleanup SQL before launch:
```sql
-- Delete test order data
DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE created_at < '2026-05-15');
DELETE FROM public.order_events WHERE order_id IN (SELECT id FROM public.orders WHERE created_at < '2026-05-15');
DELETE FROM public.order_status_history WHERE order_id IN (SELECT id FROM public.orders WHERE created_at < '2026-05-15');
DELETE FROM public.orders WHERE created_at < '2026-05-15';
DELETE FROM public.customers WHERE id NOT IN (SELECT DISTINCT customer_id FROM public.orders);
```

**Effort:** 15 minutes
**Blocks launch?** No (but recommended)

---

### 5. [MEDIUM] 1 HIGH npm Vulnerability (Next.js)

**Package:** next@15.5.15

**Risk:** Multiple advisories including DoS and cache poisoning vectors.

**Fix:** Check for patch release:
```bash
npm update next
```

**Effort:** 15 minutes
**Blocks launch?** No (advisories are theoretical, not actively exploited)

---

### 6. [LOW] Oversized Product Image

**File:** `public/products/detoxilive-pro-oil.jpg` (536KB)

**Risk:** Slow page load on mobile networks.

**Fix:** Compress to <200KB or convert to WebP.

**Effort:** 10 minutes
**Blocks launch?** No

---

### 7. [LOW] Missing SEO JSON-LD Schemas

**Missing:** BreadcrumbList, FAQPage, LocalBusiness, multi-image Product, brand property

**Risk:** Reduced rich result eligibility in Google Search.

**Fix:** Add structured data (see Post-Launch Roadmap).

**Effort:** 2-3 hours
**Blocks launch?** No

---

## Pre-Launch Checklist

Items recommended before going live:

- [ ] Clean 24 test orders from database (15 min)
- [ ] Verify 2 admin users completed password reset (5 min)
- [ ] Check `npm update next` for security patch (15 min)
- [ ] Compress detoxilive-pro-oil.jpg (10 min)

---

## Post-Launch Roadmap

### Week 1 Priority

- [ ] **Add CSP header** — 30 min
  ```typescript
  // In src/middleware.ts SECURITY_HEADERS
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self';"
  ```

- [ ] **Enable RLS on PII tables** — 2-4 hours
  - customers, orders, order_items, order_events, order_status_history
  - newsletter_subscribers, admin_users

- [ ] **REVOKE anon EXECUTE on SECURITY DEFINER functions** — 1 hour

### Week 2-4

- [ ] **Add BreadcrumbList JSON-LD** — 30 min
  ```typescript
  // In src/lib/seo.ts
  export function buildBreadcrumbJsonLd(items: {name: string; url: string}[]) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": item.name,
        "item": item.url
      }))
    };
  }
  ```

- [ ] **Add FAQPage JSON-LD to /faq** — 30 min
  ```typescript
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  ```

- [ ] **Add LocalBusiness JSON-LD** — 20 min
  ```typescript
  export function buildLocalBusinessJsonLd() {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "BF Suma Uganda",
      "image": toAbsoluteUrl("/bf-suma-logo.png"),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Plot 1 Entebbe Road, Lloyds Mall, 2nd Floor Room F9",
        "addressLocality": "Kampala",
        "addressCountry": "UG"
      },
      "telephone": "+256778928815",
      "url": getSiteUrl(),
      "priceRange": "$$"
    };
  }
  ```

- [ ] **Add brand to Product JSON-LD** — 10 min
  ```typescript
  // In product schema
  brand: {
    "@type": "Brand",
    "name": "BF Suma"
  }
  ```

- [ ] **Multi-image Product schema** — 20 min
  ```typescript
  // Change from single image to array of all product images
  image: product.images.map(img => toAbsoluteUrl(img.url))
  ```

- [ ] **Move pg_net to extensions schema** — 1 hour (requires cron job pause)

---

## Appendix: Tables RLS Status

| Table | RLS | Contains PII |
|-------|-----|--------------|
| abandoned_carts | ✅ | No |
| admin_users | ❌ | Yes |
| api_rate_limits | ❌ | No |
| blog_posts | ❌ | No |
| categories | ❌ | No |
| contact_submissions | ✅ | Yes |
| customers | ❌ | **Yes** |
| inquiries | ❌ | Yes |
| newsletter_subscribers | ❌ | Yes |
| order_events | ❌ | No |
| order_idempotency_keys | ❌ | No |
| order_items | ❌ | No |
| order_notification_outbox | ❌ | No |
| order_request_replays | ✅ | No |
| order_status_history | ❌ | No |
| orders | ❌ | **Yes** |
| package_items | ✅ | No |
| packages | ✅ | No |
| product_images | ❌ | No |
| product_reviews | ✅ | No |
| products | ❌ | No |
| wishlists | ✅ | No |

---

## Appendix: API Route Security Matrix

| Route | Methods | Auth | Rate Limited | Validation |
|-------|---------|------|--------------|------------|
| /api/orders | GET, POST | ✅ Admin | ✅ 5/60s | ✅ Zod |
| /api/orders/[id] | GET, PATCH | ✅ Admin | ❌ | ✅ Zod |
| /api/orders/resend-confirmation | POST | Public* | ❌ | ✅ Zod |
| /api/contact | POST | Public | ✅ 3/hour | ✅ Zod |
| /api/newsletter | POST | Public | ✅ 5/60s | ✅ Zod |
| /api/reviews | POST | Public | ✅ 3/5min | ✅ Zod |
| /api/products | GET | Public | ❌ | ❌ |
| /api/search | GET | Public | ❌ | ❌ |
| /api/account/* | Various | ✅ User | ❌ | ✅ Zod |
| /api/abandoned-cart | POST, DELETE | ✅ Bearer | ✅ 10/60s | ✅ Zod |

*Validates email matches order

---

**Review completed:** 2026-05-17
**Next review recommended:** Post-launch + 30 days
