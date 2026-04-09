# BF Suma Storefront + Automation Handover

## What was built (Phases A-D)

### Phase A: Lifecycle Email Automation
- Added abandoned cart tracking in the database.
- Connected cart activity so abandoned carts are saved automatically.
- Added automatic cart cleanup after successful order.
- Built 3 scheduled email jobs:
  - Abandoned cart reminder (after 1 hour)
  - Review request (4 days after delivery)
  - Re-engagement (60 days after last order)
- Added safety switch so lifecycle emails stay OFF until you intentionally enable them.

### Phase B: Search Console + Analytics Setup Readiness
- Added Google Search Console meta-tag support from env.
- Added GA4 integration for storefront only (not admin).
- Added conversion tracking for:
  - add_to_cart
  - begin_checkout
  - purchase
  - generate_lead
  - sign_up
- Updated Admin Guide with plain-language setup instructions for Search Console + GA4.

### Phase C: Content SEO Improvements
- Improved product-page SEO descriptions and lead copy generation.
- Added SEO-friendly blog title overrides for search intent in Kenya.
- Strengthened internal linking:
  - Shop -> Blog
  - Blog index -> Product pages
  - Blog detail -> Product match + related products
- Improved storefront image alt text quality.

### Phase D: Performance + Lighthouse Readiness
- Lazy-loaded header search autocomplete to reduce initial JS work.
- Improved image sizing and LCP handling on key pages.
- Added blur placeholders on major large images.
- Reduced CLS risk with minimum-height loading containers on storefront loading routes.

---

## Environment Variables You Need

| Variable | Why it is needed | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Connects website to Supabase project | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key used by browser-safe requests | Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Secure server key for admin tasks, cron jobs, and edge functions | Supabase API settings |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap links, email/storefront links | Your real website domain |
| `ADMIN_SESSION_SECRET` | Secures admin login sessions | Generate with `openssl rand -base64 32` |
| `RESEND_API_KEY` | Sends transactional and lifecycle emails | Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender email address | Resend verified domain/sender |
| `RESEND_REPLY_TO_EMAIL` | Where customer replies should go (optional) | Your support inbox |
| `EMAIL_DELIVERY_ENABLED` | Global email delivery switch | Set by your team (`true/false`) |
| `LIFECYCLE_EMAILS_ENABLED` | Enables abandoned/review/re-engagement automation | Set by your team (`false` first, then `true`) |
| `NEWSLETTER_WELCOME_EMAIL_ENABLED` | Enables welcome email for newsletter signup | Set by your team (`true/false`) |
| `NEXT_PUBLIC_GSC_VERIFICATION_TOKEN` | Verifies site ownership in Google Search Console | Google Search Console HTML tag content |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Enables GA4 tracking (format starts with `G-`) | Google Analytics Data Stream |
| `NEXT_PUBLIC_SUPPORT_PHONE` | Customer-facing support phone in UI | Your business support number |
| `NEXT_PUBLIC_SUPPORT_PHONES` | Multiple support numbers shown in UI | Your business support numbers |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP_PHONE` | WhatsApp contact used for quick help links | Your official WhatsApp business number |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional alias for WhatsApp number | Same as above (optional) |

---

## Manual Steps for Owner (Plain English)

1. Put all required environment values into your hosting environment.
2. Run the latest Supabase database migrations.
3. Deploy the 3 Supabase edge functions:
   - `send-abandoned-cart`
   - `send-review-request`
   - `send-reengagement`
4. Confirm `pg_cron` and `pg_net` are enabled in Supabase.
5. Keep `LIFECYCLE_EMAILS_ENABLED=false` first.
6. Place a test order and confirm:
   - order confirmation email arrives
   - abandoned cart clears after order
7. Turn `LIFECYCLE_EMAILS_ENABLED=true` only after test success.
8. Open Google Search Console:
   - add your domain
   - copy verification token into env
   - redeploy
   - click Verify
   - submit `https://YOUR_DOMAIN/sitemap.xml`
9. Add GA4 measurement ID in env and redeploy.
10. Open GA4 Realtime and confirm events are coming in.
11. Review the Admin Guide page with the handover person.

---

## Pre-Launch Checklist

- [ ] All env vars set in production
- [ ] Sitemap submitted to Google Search Console
- [ ] GA4 measurement ID configured
- [ ] Email delivery enabled and tested
- [ ] All Supabase RLS policies reviewed
- [ ] Custom domain configured with HTTPS
- [ ] Error monitoring set up (e.g. Sentry — add DSN to env if present)
- [ ] Test a full purchase end-to-end in production environment
- [ ] Test order confirmation email received
- [ ] Admin guide reviewed by the person taking over

---

## If Something Breaks: Who to Contact

- Storefront not loading / deploy issue:
  - Contact your hosting provider support first.
- Orders not saving / checkout errors:
  - Contact technical support immediately at `support@bfsuma.com`.
- Emails not sending:
  - Check Resend status, then contact technical support at `support@bfsuma.com`.
- Admin login/session issues:
  - Contact technical support and provide screenshot + page URL.
- Search/analytics not showing data:
  - Recheck env values and redeploy, then contact technical support if still failing.

---

## Estimated Time to Complete Manual Setup

- Fast path (all accounts ready): **35-50 minutes**
- If domain/Search Console/GA4 accounts still need setup: **60-90 minutes**
