# BF Suma Uganda

## Project Overview

E-commerce storefront and admin dashboard for BF Suma Uganda - a health and wellness products distributor.

**Live URL:** https://www.bfsumauganda.com
**Admin:** `/admin/login`
**Storefront:** `/`

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT sessions (admin), Supabase Auth (customers) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Monitoring | Sentry |

## Design Tokens

### Brand Colors
```
--brand:        #1E9E5A  (primary green)
--logo-blue:    #00aadb
--logo-orange:  #f48132
--logo-amber:   #f9a533
--logo-pink:    #ec297b
--logo-ink:     #231f20
```

### Semantic Colors
```
--background:   #f7f6f2
--foreground:   #231f20
--surface:      #ffffff
--border:       #d6ddd3
```

### Radius
```
--radius-sm:    0.5rem
--radius-md:    0.75rem
--radius-lg:    1rem
```

## Repo Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (store)/           # Public storefront routes
│   ├── admin/             # Admin dashboard routes
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin-specific components
│   ├── account/           # Customer account components
│   ├── dashboard/         # Shared dashboard components
│   ├── layout/            # Layout primitives
│   ├── storefront/        # Store UI components
│   └── ui/                # Generic UI primitives
├── lib/                   # Utilities, constants, helpers
├── services/              # Data fetching, Supabase queries
└── types/                 # TypeScript types
supabase/
└── migrations/            # Database migrations
```

## Coding Rules

1. **TypeScript strict mode** - no `any` unless absolutely necessary
2. **Server Components by default** - use `"use client"` only when needed
3. **Tailwind only** - no inline styles, no CSS modules
4. **Zod for validation** - all forms and API inputs
5. **Service functions for data** - no direct Supabase calls in components
6. **Prices in cents (integers)** - UGX has 0 decimal places, store as integers
7. **Error boundaries** - wrap async components

## Git Rules

1. **Atomic commits** - one concern per commit
2. **Max 6 files per commit** - split if larger
3. **Max 250 lines changed** - excluding lockfiles
4. **Conventional or plain commits** - both acceptable
5. **No AI attribution** - no co-author lines, no tool signatures
6. **Never force push main** - use `--force-with-lease` on feature branches

## Testing Rules

| Command | Purpose |
|---------|---------|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Critical path tests |
| `npm run test:integration` | Full integration suite |

Run before every PR:
```bash
npm run lint && npm run typecheck && npm test
```

## Security Rules

1. **Never commit .env files** - use `.env.example` for templates
2. **Never commit secrets** - API keys, passwords, tokens
3. **Validate all inputs** - especially user-facing forms
4. **Use service role carefully** - only in server-side code
5. **RLS policies required** - all tables must have row-level security

## Current Status

- [x] Storefront functional
- [x] Admin dashboard with charts
- [x] Partners system with leaderboard
- [x] Customer account portal
- [x] SEO and JSON-LD structured data
- [x] Google Business Profile setup
- [ ] [INDEXING_STATUS] - Awaiting Google indexing

## Known Issues

1. **Site not in search results** - Domain is new, waiting for Google to index (2-4 weeks)
2. [ADD_KNOWN_ISSUES_HERE]

## Agent Instructions

When working on this codebase:

1. **Read before editing** - always read a file before modifying it
2. **Use existing patterns** - check similar files for conventions
3. **Commit incrementally** - don't batch unrelated changes
4. **Run checks** - lint and typecheck before committing
5. **Don't touch auth/payment** - unless explicitly asked
6. **Preserve existing functionality** - don't remove features without asking
