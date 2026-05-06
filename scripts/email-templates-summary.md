# Email Templates Summary — Client Review

Overview of all automated emails sent by the BF Suma site.

---

## 1. Newsletter Welcome

| Field | Value |
|-------|-------|
| **From** | BF Suma \<hello@bfsumauganda.com\> |
| **Subject** | Welcome to BF Suma updates |
| **Trigger** | Customer subscribes to newsletter |
| **Body preview** | "Thanks for subscribing. You'll receive concise wellness tips, product updates, and useful guidance without inbox noise. We focus on practical advice that helps you choose products with confidence." |
| **CTA** | Browse Products → /shop |

---

## 2. Storefront Welcome (First-Time Buyer)

| Field | Value |
|-------|-------|
| **From** | BF Suma \<noreply@bfsumauganda.com\> |
| **Subject** | Welcome to BF Suma |
| **Trigger** | Customer places their first order |
| **Body preview** | "Hi [Name], thanks for your first order. We're glad you chose BF Suma. What makes us different: clear product guidance, transparent pricing, and direct support when you need it." |
| **CTA** | Read wellness guides → /blog |

---

## 3. Order Confirmation

| Field | Value |
|-------|-------|
| **From** | BF Suma Orders \<orders@bfsumauganda.com\> |
| **Subject** | Order confirmed: [Order Number] |
| **Trigger** | Customer completes checkout |
| **Body preview** | "Hi [Name], we've received order [Order Number]." Includes itemized table with quantities and prices, subtotal, delivery fee, total, delivery address, and estimated delivery window. |
| **CTA** | Track via Support → WhatsApp |

---

## 4. Abandoned Cart Reminder

| Field | Value |
|-------|-------|
| **From** | BF Suma \<noreply@bfsumauganda.com\> |
| **Subject** | You left something behind |
| **Trigger** | Customer adds items to cart but doesn't complete checkout (scheduled job) |
| **Body preview** | "Hi [Name], your selected item is still in your cart. [Cart summary]" |
| **CTA** | Return to cart → /cart |

---

## 5. Post-Purchase Review Request

| Field | Value |
|-------|-------|
| **From** | BF Suma \<noreply@bfsumauganda.com\> |
| **Subject** | How are you getting on? |
| **Trigger** | X days after order delivery (scheduled job) |
| **Body preview** | "Hi [Name], we hope your [Product Name] is working well for you. Your feedback helps other customers choose with confidence." |
| **CTA** | Leave a review → review page |

---

## 6. Re-engagement (Win-back)

| Field | Value |
|-------|-------|
| **From** | BF Suma \<noreply@bfsumauganda.com\> |
| **Subject** | We miss you at BF Suma |
| **Trigger** | Customer hasn't visited/purchased in X days (scheduled job) |
| **Body preview** | "Hi [Name], we've refreshed our bestsellers and wellness picks since your last visit. Explore what's trending now and pick up where you left off." |
| **CTA** | See bestsellers → /shop |

---

## Sender Addresses Summary

| Purpose | From Address | Reply-To |
|---------|--------------|----------|
| Orders | orders@bfsumauganda.com | orders@bfsumauganda.com |
| Support | support@bfsumauganda.com | support@bfsumauganda.com |
| Partnership | partnerships@bfsumauganda.com | partnerships@bfsumauganda.com |
| Newsletter | hello@bfsumauganda.com | hello@bfsumauganda.com |
| Transactional | noreply@bfsumauganda.com | support@bfsumauganda.com |

---

## Notes

- All emails include the BF Suma logo and consistent branding
- Transactional emails (abandoned cart, review, re-engagement) reply to support@
- Newsletter emails include an unsubscribe link
- Order confirmation emails include a WhatsApp support link

Let me know if you'd like any subject lines or body text adjusted!
