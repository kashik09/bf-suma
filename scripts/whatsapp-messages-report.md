# WhatsApp Prefilled Messages Report

Generated: 2026-05-05 (updated)

## Summary

All WhatsApp links produce natural, context-specific prefilled messages. Each entry point has a distinct message so support can identify how the customer arrived.

## Message Locations

| Location | Trigger | Message |
|----------|---------|---------|
| **Hero (supplements slide)** | "Ask on WhatsApp" button | Hi! I'm interested in BF Suma's wellness supplements. Can you help me choose the right one for my needs? |
| **Hero (nutrition slide)** | "Ask on WhatsApp" button | Hi! I'd love to learn about BF Suma's plant-based nutrition products. |
| **Hero (lifestyle slide)** | "Ask on WhatsApp" button | Hi! I'm looking for products to support an active lifestyle. What would you recommend? |
| **Hero (daily-vitality slide)** | "Ask on WhatsApp" button | Hi! I'm interested in products for daily energy and vitality. |
| **Footer (primary CTA)** | "WhatsApp Support" button | Hi! I'd like to ask about BF Suma products. |
| **Footer (support link)** | "WhatsApp" link in Support column | Hi! I have a question about BF Suma — could you help me? |
| **Floating CTA** | "Need help? WhatsApp" button | Hi! I'm browsing the BF Suma site and could use some help. |
| **Homepage CTA** | "WhatsApp Guidance" button | Hi! I'm new to BF Suma and would like to learn more about your products. |
| **Blog (unavailable)** | "Ask on WhatsApp" fallback | Hi! I was reading on the BF Suma site and would like to ask a question. |
| **Blog (post-specific)** | "WhatsApp Guidance" button | Hi! I just read your article "{post.title}" — could you recommend products related to this? |
| **Product detail** | "Ask about this product" button | Hi! I came across "{product.name}" and I'm interested. Could you explain how it works and if it's right for me? |
| **Email (order support)** | WhatsApp link in order emails | Hi! I need help with my order. |

## Message Builders (src/lib/whatsapp.ts)

| Function | Purpose |
|----------|---------|
| `buildWhatsAppGenericInquiryMessage()` | Footer primary "WhatsApp Support" CTA |
| `buildWhatsAppFooterSupportMessage()` | Footer Support column WhatsApp link |
| `buildWhatsAppFloatingCtaMessage()` | Floating bottom-right WhatsApp button |
| `buildWhatsAppHomepageCtaMessage()` | Homepage "WhatsApp Guidance" CTA |
| `buildWhatsAppBlogFallbackMessage()` | Blog page when no article loaded |
| `buildWhatsAppBlogMessage(postTitle)` | Blog post-specific inquiry with article title |
| `buildWhatsAppProductInterestMessage(productName)` | Product detail page soft inquiry |
| `buildWhatsAppProductOrderMessage(productName, quantity)` | Strong order intent (not currently used in UI) |
| `buildWhatsAppOrderSupportMessage()` | Order support in confirmation emails |
| `buildWhatsAppGeneralHelpMessage(context?)` | **DEPRECATED** — kept for backwards compatibility |

## Verification

All messages read naturally and vary by context. Support can identify customer entry point from the message content.
