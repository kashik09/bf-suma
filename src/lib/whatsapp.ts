import { WHATSAPP_PHONE } from "@/lib/constants";

export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_PHONE) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Clean context (especially blog slugs → readable text)
 */
function formatContext(context?: string) {
  if (!context) return "";

  let clean = context.trim();

  // convert blog:slug → readable title
  if (clean.startsWith("blog:")) {
    clean = clean.replace("blog:", "");
  }

  // slug → sentence
  clean = clean
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return clean;
}

/**
 * GENERAL HELP (from anywhere, incl. blog)
 */
export function buildWhatsAppGeneralHelpMessage(context?: string) {
  const formatted = formatContext(context);

  if (formatted) {
    return `Hi! I was reading about "${formatted}" and I’d like help choosing the right product. What would you recommend?`;
  }

  return `Hi! I’m looking for help choosing the right product. What would you recommend?`;
}

/**
 * PRODUCT INTEREST (soft intent)
 */
export function buildWhatsAppProductInterestMessage(productName: string) {
  return `Hi! I came across "${productName}" and I’m interested. Could you explain how it works and if it’s right for me?`;
}

/**
 * ORDER INTENT (strong intent)
 */
export function buildWhatsAppProductOrderMessage(productName: string, quantity: number) {
  return `Hi! I’d like to order ${quantity} × "${productName}". Is it available, and how do I proceed?`;
}

/**
 * ORDER SUPPORT
 */
export function buildWhatsAppOrderSupportMessage() {
  return `Hi! I need help with my order.`;
}

/**
 * GENERIC INQUIRY (footer, floating CTA, homepage)
 */
export function buildWhatsAppGenericInquiryMessage() {
  return "Hi! I'd like to ask about BF Suma products.";
}

/**
 * BLOG POST INQUIRY
 */
export function buildWhatsAppBlogMessage(postTitle: string) {
  return `Hi! I just read your article "${postTitle}" — could you recommend products related to this?`;
}

/**
 * FOOTER SUPPORT LINK
 */
export function buildWhatsAppFooterSupportMessage() {
  return "Hi! I have a question about BF Suma — could you help me?";
}

/**
 * FLOATING CTA (bottom-right button)
 */
export function buildWhatsAppFloatingCtaMessage() {
  return "Hi! I'm browsing the BF Suma site and could use some help.";
}

/**
 * HOMEPAGE CTA
 */
export function buildWhatsAppHomepageCtaMessage() {
  return "Hi! I'm new to BF Suma and would like to learn more about your products.";
}

/**
 * BLOG FALLBACK (when no article loaded)
 */
export function buildWhatsAppBlogFallbackMessage() {
  return "Hi! I was reading on the BF Suma site and would like to ask a question.";
}