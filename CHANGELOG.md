# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-04-07

### Security

- **Environment secrets** — Verified `.env` and `.env.local` are absent from the repository and covered by `.gitignore`. `.env.example` contains only placeholder values with no real credentials.
- **Bootstrap admin password** — `BOOTSTRAP_ADMIN_PASSWORD` in `scripts/bootstrap-admin.ts` is read exclusively from the runtime environment; the script calls `process.exit(1)` immediately if the variable is absent.
- **Safe structured logger** — Introduced `src/lib/logger.ts` with a `logEvent` utility that automatically redacts fields whose names match sensitive patterns (`password`, `secret`, `token`, `apikey`, `authorization`, `credential`, `jwt`, `bearer`, etc.) before writing to stdout/stderr. All API routes now use this shared logger; the duplicated local `logEvent` implementations in `contact`, `newsletter`, and `orders` have been removed. The raw `console.error` call in the orders `GET` handler has been replaced with `logEvent`.
- **Cookie hardening** — All admin session cookies (`bf_admin_session`) and the flash-redirect cookie now use `sameSite: "strict"` (upgraded from `"lax"`) and `secure: true` (previously conditional on `NODE_ENV === "production"`). Affected files: `src/app/admin/login/page.tsx`, `src/app/admin/reset-password/page.tsx`, `src/app/admin/logout/route.ts`, `src/middleware.ts`.
- **Persistent rate limiting for reviews** — `src/app/api/reviews/route.ts` replaced its in-memory-only rate limiter with the same Supabase-backed implementation (`api_rate_limits` table) used by the contact, newsletter, and orders endpoints. The in-memory `Map` is retained as a graceful-degradation fallback when the database is unavailable.

## [0.1.1] - 2026-03-01

### Changed

- Initial internal release.
