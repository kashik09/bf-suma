import { formatCurrency } from "@/lib/utils";
import { getWhatsAppPrimaryUrl } from "@/config/contact";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppOrderSupportMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { getSender, type EmailPurpose } from "./senders";
import { renderEmailLayout } from "./templates/base";

interface SendNewsletterWelcomeEmailInput {
  email: string;
}

interface SendOrderConfirmationEmailInput {
  email: string;
  firstName: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  estimatedDeliveryWindow: string;
}

interface SendStorefrontWelcomeEmailInput {
  email: string;
  firstName: string;
}

interface SendAbandonedCartReminderEmailInput {
  email: string;
  firstName: string;
  cartUrl: string;
  cartSummary: string;
}

interface SendPostPurchaseReviewRequestEmailInput {
  email: string;
  firstName: string;
  productName: string;
  reviewUrl: string;
}

interface SendReengagementEmailInput {
  email: string;
  firstName: string;
  bestSellersUrl: string;
}

export interface EmailDeliveryResult {
  status: "sent" | "skipped" | "failed";
  messageId?: string;
  reason?: string;
}

function isEnabled() {
  const globalFlag = process.env.EMAIL_DELIVERY_ENABLED;
  if (typeof globalFlag === "string") {
    return globalFlag !== "false";
  }

  return process.env.NEWSLETTER_WELCOME_EMAIL_ENABLED !== "false";
}

function resolveResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!isEnabled()) {
    return { enabled: false as const, reason: "email_delivery_disabled" };
  }

  if (!apiKey) {
    return { enabled: false as const, reason: "missing_resend_api_key" };
  }

  return {
    enabled: true as const,
    apiKey
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail({
  to,
  subject,
  html,
  text,
  purpose
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  purpose: EmailPurpose;
}): Promise<EmailDeliveryResult> {
  const config = resolveResendConfig();
  if (!config.enabled) {
    return {
      status: "skipped",
      reason: config.reason
    };
  }

  const sender = getSender(purpose);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: sender.from,
        to: [to],
        subject,
        html,
        text,
        reply_to: sender.replyTo
      })
    });

    const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;

    if (!response.ok) {
      return {
        status: "failed",
        reason: payload?.message || `resend_http_${response.status}`
      };
    }

    return {
      status: "sent",
      messageId: payload?.id
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "unexpected_error"
    };
  }
}

export async function sendNewsletterWelcomeEmail({
  email
}: SendNewsletterWelcomeEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Thanks for subscribing. You'll receive concise wellness tips, product updates, and useful guidance without inbox noise.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
      We focus on practical advice that helps you choose products with confidence.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "You are now subscribed to BF Suma wellness updates.",
    heading: "Welcome to BF Suma updates",
    bodyHtml,
    ctaText: "Browse Products",
    ctaUrl: "https://bfsumauganda.com/shop",
    recipientEmail: email,
    showUnsubscribe: true
  });

  const text = [
    "Welcome to BF Suma updates.",
    "",
    "Thanks for subscribing. You'll receive concise wellness tips, product updates, and useful guidance.",
    "",
    "Browse products: https://bfsumauganda.com/shop",
    `Need help? WhatsApp: ${getWhatsAppPrimaryUrl()}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "Welcome to BF Suma updates",
    html,
    text,
    purpose: "newsletter"
  });
}

export async function sendStorefrontWelcomeEmail({
  email,
  firstName
}: SendStorefrontWelcomeEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, thanks for your first order. We're glad you chose BF Suma.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      What makes us different: clear product guidance, transparent pricing, and direct support when you need it.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "Thanks for your first BF Suma order. Here's what to expect next.",
    heading: "Welcome to BF Suma",
    bodyHtml,
    ctaText: "Read wellness guides",
    ctaUrl: "https://bfsumauganda.com/blog",
    recipientEmail: email
  });

  const text = [
    "Welcome to BF Suma.",
    "",
    `Hi ${firstName}, thanks for your first order. We're glad you chose BF Suma.`,
    "What makes us different: clear product guidance, transparent pricing, and direct support.",
    "",
    "Read wellness guides: https://bfsumauganda.com/blog"
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "Welcome to BF Suma",
    html,
    text,
    purpose: "transactional"
  });
}

export async function sendOrderConfirmationEmail({
  email,
  firstName,
  orderNumber,
  subtotal,
  deliveryFee,
  total,
  currency,
  deliveryAddress,
  items,
  estimatedDeliveryWindow
}: SendOrderConfirmationEmailInput): Promise<EmailDeliveryResult> {
  const supportWhatsAppUrl = buildWhatsAppUrl(buildWhatsAppOrderSupportMessage(), SUPPORT_WHATSAPP_PHONE);
  const normalizedItems = items.length > 0
    ? items
    : [
      {
        name: "Order item",
        quantity: 1,
        unitPrice: total,
        lineTotal: total
      }
    ];

  const itemsHtml = normalizedItems
    .map((item) => {
      const safeName = escapeHtml(item.name);
      return `<tr>
      <td style="padding:10px 12px;font-size:14px;color:#0f172a;vertical-align:top;">${safeName}</td>
      <td style="padding:10px 12px;font-size:14px;color:#334155;text-align:center;vertical-align:top;">${item.quantity}</td>
      <td style="padding:10px 12px;font-size:14px;color:#334155;text-align:right;vertical-align:top;">${escapeHtml(formatCurrency(item.lineTotal, currency))}</td>
    </tr>`;
    })
    .join("");

  const itemsText = normalizedItems
    .map((item) => `- ${item.name} x${item.quantity}: ${formatCurrency(item.lineTotal, currency)}`)
    .join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, we've received order <strong>${escapeHtml(orderNumber)}</strong>.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 12px;">
      <thead>
        <tr>
          <th align="left" style="padding:10px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#64748b;background:#f8fafc;">Item</th>
          <th align="center" style="padding:10px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#64748b;background:#f8fafc;">Qty</th>
          <th align="right" style="padding:10px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#64748b;background:#f8fafc;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:10px 12px;font-size:14px;color:#334155;">Subtotal: <strong>${escapeHtml(formatCurrency(subtotal, currency))}</strong></td></tr>
      <tr><td style="padding:10px 12px;font-size:14px;color:#334155;border-top:1px solid #e2e8f0;">Delivery: <strong>${escapeHtml(formatCurrency(deliveryFee, currency))}</strong></td></tr>
      <tr><td style="padding:10px 12px;font-size:14px;color:#0f172a;border-top:1px solid #e2e8f0;">Total: <strong>${escapeHtml(formatCurrency(total, currency))}</strong></td></tr>
    </table>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      Delivery address: <strong>${escapeHtml(deliveryAddress)}</strong>
    </p>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      Delivery estimate: <strong>${escapeHtml(estimatedDeliveryWindow)}</strong>
    </p>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      While you wait: start with consistent daily use, hydrate well, and check product guidance on the label for best results.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: `Order ${orderNumber} confirmed. Delivery estimate included.`,
    heading: `Order confirmed: ${orderNumber}`,
    bodyHtml,
    ctaText: "Track via Support",
    ctaUrl: supportWhatsAppUrl,
    recipientEmail: email,
    footerNote: "Thank you for shopping with BF Suma."
  });

  const text = [
    "Thanks, your order is confirmed.",
    `Order: ${orderNumber}`,
    "",
    "Items:",
    itemsText,
    "",
    `Subtotal: ${formatCurrency(subtotal, currency)}`,
    `Delivery: ${formatCurrency(deliveryFee, currency)}`,
    `Total: ${formatCurrency(total, currency)}`,
    "",
    `Delivery address: ${deliveryAddress}`,
    "",
    `Delivery estimate: ${estimatedDeliveryWindow}`,
    "",
    "While you wait: start with consistent daily use, hydrate well, and check product guidance on the label.",
    `Need help? WhatsApp: ${supportWhatsAppUrl}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: `Order confirmed: ${orderNumber}`,
    html,
    text,
    purpose: "order"
  });
}

export async function sendAbandonedCartReminderEmail({
  email,
  firstName,
  cartUrl,
  cartSummary
}: SendAbandonedCartReminderEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, your selected item is still in your cart.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      ${escapeHtml(cartSummary)}
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "Your BF Suma cart is waiting for you.",
    heading: "You left something behind",
    bodyHtml,
    ctaText: "Return to cart",
    ctaUrl: cartUrl,
    recipientEmail: email
  });

  const text = [
    "You left something behind.",
    "",
    `${firstName}, your selected item is still in your cart.`,
    cartSummary,
    "",
    `Return to cart: ${cartUrl}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "You left something behind",
    html,
    text,
    purpose: "transactional"
  });
}

export async function sendPostPurchaseReviewRequestEmail({
  email,
  firstName,
  productName,
  reviewUrl
}: SendPostPurchaseReviewRequestEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, we hope your ${escapeHtml(productName)} is working well for you.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      Your feedback helps other customers choose with confidence.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "Share your product experience in one quick review.",
    heading: "How are you getting on?",
    bodyHtml,
    ctaText: "Leave a review",
    ctaUrl: reviewUrl,
    recipientEmail: email
  });

  const text = [
    "How are you getting on?",
    "",
    `${firstName}, we hope your ${productName} is working well for you.`,
    "Your feedback helps other customers choose with confidence.",
    "",
    `Leave a review: ${reviewUrl}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "How are you getting on?",
    html,
    text,
    purpose: "transactional"
  });
}

export async function sendReengagementEmail({
  email,
  firstName,
  bestSellersUrl
}: SendReengagementEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, we've refreshed our bestsellers and wellness picks since your last visit.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      Explore what's trending now and pick up where you left off.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "See what BF Suma customers are choosing now.",
    heading: "We miss you at BF Suma",
    bodyHtml,
    ctaText: "See bestsellers",
    ctaUrl: bestSellersUrl,
    recipientEmail: email,
    showUnsubscribe: true
  });

  const text = [
    "We miss you at BF Suma.",
    "",
    `${firstName}, we've refreshed our bestsellers and wellness picks since your last visit.`,
    "",
    `See bestsellers: ${bestSellersUrl}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "We miss you at BF Suma",
    html,
    text,
    purpose: "transactional"
  });
}
