# BF Suma — Project Context

This project follows `~/.claude/CLAUDE.md` for global communication, commit, and safety rules.

---

## Project Overview

E-commerce storefront for BF Suma Uganda, a health and wellness brand. Includes public shop, admin dashboard, lifecycle email automation, and analytics integration.

**Live domain:** bfsumauganda.com (or as configured in `NEXT_PUBLIC_SITE_URL`)

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) |
| Auth | Custom admin sessions (`src/lib/admin-session.ts`) |
| Email | Resend |
| Monitoring | Sentry |
| CAPTCHA | Cloudflare Turnstile |
| Analytics | GA4 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Hosting | Vercel |

---

## Design Tokens

All colors defined in `src/app/globals.css`:

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand` | #1E9E5A | Primary brand green, CTAs |
| `--logo-green` | #1E9E5A | Logo green |
| `--logo-blue` | #00aadb | Logo blue accent |
| `--logo-orange` | #f48132 | Logo orange |
| `--logo-amber` | #f9a533 | Logo amber |
| `--logo-pink` | #ec297b | Logo pink |
| `--background` | #f7f6f2 | Page background |
| `--surface` | #ffffff | Card surfaces |
| `--foreground` | #231f20 | Text |

**Font:** Ubuntu (`--font-ubuntu`)

---

## Repo Structure

```
src/
├── app/
│   ├── (store)/          # Public storefront routes
│   ├── (account)/        # Customer account routes
│   ├── admin/            # Admin dashboard routes
│   ├── api/              # API routes
│   ├── auth/             # Auth callback routes
│   └── globals.css       # Design tokens
├── components/           # UI components
├── config/
│   ├── contact.ts        # Phone numbers (NOT env vars)
│   └── delivery-zones.ts # Delivery configuration
├── hooks/                # React hooks
├── lib/                  # Core utilities
│   ├── supabase/         # Supabase clients
│   ├── email/            # Email templates and sending
│   ├── admin-session.ts  # Admin auth
│   ├── turnstile.ts      # CAPTCHA verification
│   ├── rate-limit.ts     # Rate limiting
│   └── analytics.ts      # GA4 event tracking
├── services/             # Business logic services
└── types/                # TypeScript definitions

supabase/
├── functions/            # Edge functions for lifecycle emails
│   ├── send-abandoned-cart/
│   ├── send-review-request/
│   ├── send-reengagement/
│   └── _shared/          # Shared email layout
└── migrations/           # Database migrations

tests/                    # Test files
scripts/                  # Utility scripts
docs/                     # Documentation
```

---

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run test          # Run critical path tests
npm run test:critical # Production hardening tests
npm run email:preview # Preview email templates
```

---

## Coding Rules

1. **No hardcoded colors** — Use CSS custom properties from `globals.css`
2. **Phone numbers in config** — Edit `src/config/contact.ts`, NOT env vars
3. **Server components by default** — Use `'use client'` only when needed
4. **Zod validation** — All form inputs validated with Zod schemas
5. **No disease-cure claims** — Use supportive wellness language only

---

## Content and Copy Rules

BF Suma is a health/wellness brand. All copy must:

- Use supportive wellness language ("supports immune health", "promotes digestive comfort")
- Never claim to cure, treat, or diagnose diseases
- Avoid medical terminology that implies therapeutic claims
- Follow Uganda/Kenya advertising standards for supplements

---

## SEO Rules

- Product pages generate SEO descriptions automatically
- Blog titles can have SEO overrides for search intent
- Internal linking: Shop ↔ Blog ↔ Product pages
- Image alt text must be descriptive
- Sitemap generated at `/sitemap.xml`

---

## E-commerce Rules

- Cart activity tracked for abandoned cart recovery
- Conversion events: `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead`, `sign_up`
- Order confirmation emails via Resend
- Lifecycle emails controlled by `LIFECYCLE_EMAILS_ENABLED` env var

---

## Security-Sensitive Areas

Do NOT modify without explicit request:

| Path | Purpose |
|------|---------|
| `src/lib/supabase/` | Database clients |
| `src/lib/admin-session.ts` | Admin authentication |
| `src/lib/turnstile.ts` | CAPTCHA verification |
| `src/lib/rate-limit.ts` | Rate limiting |
| `src/middleware.ts` | Request middleware, CSP, HSTS |
| `supabase/migrations/` | Database schema |
| `supabase/functions/` | Edge functions |
| `.env*` files | Never read or modify |
| `sentry.*.config.ts` | Error monitoring |

---

## Environment Variables

See `.env.example` for full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Supabase key (server only) |
| `ADMIN_SESSION_SECRET` | Admin session signing |
| `RESEND_API_KEY` | Email delivery |
| `LIFECYCLE_EMAILS_ENABLED` | Lifecycle automation switch (default: false) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Analytics tracking |
| `NEXT_PUBLIC_GSC_VERIFICATION_TOKEN` | Search Console verification |

**Phone numbers are NOT env vars** — they live in `src/config/contact.ts`.

---

## Lifecycle Email System

Three scheduled edge functions (Supabase):

1. `send-abandoned-cart` — 1 hour after cart abandonment
2. `send-review-request` — 4 days after delivery
3. `send-reengagement` — 60 days after last order

**Safety:** `LIFECYCLE_EMAILS_ENABLED=false` by default. Enable only after testing.

---

## Handover Rules

- See `HANDOVER.md` for client handover documentation
- See `STATUS.md` for current session state
- Phone number changes require updating both `src/config/contact.ts` AND `supabase/functions/_shared/email-layout.ts`

---

## Git Rules

- Atomic commits, max 6 files, max 250 lines
- No AI attribution
- Conventional prefixes used: `feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `refactor:`
- Never commit `.env*` files
- Never commit `STATUS.md`

---

## Testing

```bash
npm run test:critical    # Production hardening tests
npm run test:integration # Critical path + money model tests
```

Test files in `tests/`:
- `production-hardening.test.mjs`
- `critical-path.test.mjs`
- `money-model.test.mjs`
- `lifecycle-email-functions.test.mjs`

---

## Current Status

See `STATUS.md` for session state.

**Done:**
- Lifecycle email automation (Phase A)
- GA4 + Search Console readiness (Phase B)
- Content SEO improvements (Phase C)
- Performance + Lighthouse readiness (Phase D)
- Turnstile CAPTCHA integration
- CSP + HSTS security headers

**Pending:**
- Confirm GA4 tracking live
- Submit sitemap to Search Console
- Enable lifecycle emails after client testing
- Full production e2e purchase test

---

## Agent Instructions

1. **Read before writing** — Check existing patterns in similar files
2. **Check `globals.css`** — Design tokens already defined
3. **Check `src/config/`** — Config values live there, not in env
4. **Run lint before commit** — `npm run lint`
5. **Update `STATUS.md`** — After significant work or before ending session
6. **Refer to `HANDOVER.md`** — For client-facing documentation context
