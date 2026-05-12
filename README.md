# BF Suma

BF Suma is a Next.js storefront and admin dashboard for managing products, orders, blog content, contacts, and reviews.

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Create your env file:
```bash
cp .env.example .env.local
```

3. Fill required variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET` (32+ characters)

4. Run the app:
```bash
npm run dev
```

5. Open:
- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Production Run

1. Build:
```bash
npm run build
```

2. Start:
```bash
npm run start
```

3. Run checks:
```bash
npm run typecheck
npm test
```

## Admin Access and First Admin User

Create the first admin user with the bootstrap script:

```bash
BOOTSTRAP_ADMIN_EMAIL="admin@yourcompany.com" \
BOOTSTRAP_ADMIN_PASSWORD="YourStrongP@ssw0rd123!" \
BOOTSTRAP_ADMIN_NAME="Admin User" \
BOOTSTRAP_ADMIN_ROLE="SUPER_ADMIN" \
npx ts-node scripts/bootstrap-admin.ts
```

Then sign in at `/admin/login`.

Notes:
- Password must be at least 12 characters and include uppercase, lowercase, number, and special character.
- `BOOTSTRAP_ADMIN_ROLE` can be `SUPER_ADMIN`, `OPERATIONS`, or `SUPPORT`.

## Admin Guide

After login, use `/admin/guide` for non-technical onboarding:
- Order status workflow
- Product inventory workflow
- Contacts and reviews handling
- System health warnings and next actions

## Troubleshooting

1. **I keep getting redirected to `/admin/reset-password`**
- Your session is marked `mustResetPassword`.
- Set a new password on that page, then continue.

2. **Dashboard shows critical environment warnings**
- Open `.env.local` and confirm required values are set.
- Restart the server after env changes.

3. **Admin pages show data unavailable / missing table warnings**
- Ensure Supabase migrations are applied.
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct.
- Re-check database connectivity and retry.
