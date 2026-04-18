import { formatCurrency } from "@/lib/utils";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppOrderSupportMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

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
  const from = (process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL)?.trim();
  const replyTo = (process.env.RESEND_REPLY_TO_EMAIL || process.env.REPLY_TO_EMAIL)?.trim();

  if (!isEnabled()) {
    return { enabled: false as const, reason: "welcome_email_disabled" };
  }

  if (!apiKey) {
    return { enabled: false as const, reason: "missing_resend_api_key" };
  }

  if (!from) {
    return { enabled: false as const, reason: "missing_resend_from_email" };
  }

  return {
    enabled: true as const,
    apiKey,
    from,
    replyTo: replyTo && replyTo.length > 0 ? replyTo : undefined
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

function buildEmailShell({
  preheader,
  title,
  bodyHtml,
  ctaLabel,
  ctaHref
}: {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a2f 0%,#234d3f 50%,#2d5f4f 100%);padding:24px 24px 20px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">BF Suma</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.88);">Trusted wellness essentials</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              ${bodyHtml}
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:18px;">
                <tr>
                  <td style="background-color:#22c55e;border-radius:8px;">
                    <a href="${escapeHtml(ctaHref)}" target="_blank" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      ${escapeHtml(ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:18px 24px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;">
                Need help? Reply to this email or reach us on WhatsApp.
              </p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} BF Suma. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailDeliveryResult> {
  const config = resolveResendConfig();
  if (!config.enabled) {
    return {
      status: "skipped",
      reason: config.reason
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: config.from,
        to: [to],
        subject,
        html,
        text,
        ...(config.replyTo ? { reply_to: config.replyTo } : {})
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
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">Welcome to BF Suma updates</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Thanks for subscribing. You’ll receive concise wellness tips, product updates, and useful guidance without inbox noise.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
      We focus on practical advice that helps you choose products with confidence.
    </p>
  `.trim();

  const html = buildEmailShell({
    preheader: "You are now subscribed to BF Suma wellness updates.",
    title: "Welcome to BF Suma updates",
    bodyHtml,
    ctaLabel: "Browse Products",
    ctaHref: "https://bfsuma.com/shop"
  });

  const text = [
    "Welcome to BF Suma updates.",
    "",
    "Thanks for subscribing. You’ll receive concise wellness tips, product updates, and useful guidance.",
    "",
    "Browse products: https://bfsuma.com/shop",
    "Need help? WhatsApp: https://wa.me/256761309924"
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "Welcome to BF Suma updates",
    html,
    text
  });
}

export async function sendStorefrontWelcomeEmail({
  email,
  firstName
}: SendStorefrontWelcomeEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">Welcome to BF Suma</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, thanks for your first order. We’re glad you chose BF Suma.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      What makes us different: clear product guidance, transparent pricing, and direct support when you need it.
    </p>
  `.trim();

  const html = buildEmailShell({
    preheader: "Thanks for your first BF Suma order. Here’s what to expect next.",
    title: "Welcome to BF Suma",
    bodyHtml,
    ctaLabel: "Read wellness guides",
    ctaHref: "https://bfsuma.com/blog"
  });

  const text = [
    "Welcome to BF Suma.",
    "",
    `Hi ${firstName}, thanks for your first order. We’re glad you chose BF Suma.`,
    "What makes us different: clear product guidance, transparent pricing, and direct support.",
    "",
    "Read wellness guides: https://bfsuma.com/blog"
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "Welcome to BF Suma",
    html,
    text
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
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">Thanks, your order is confirmed</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, we’ve received order <strong>${escapeHtml(orderNumber)}</strong>.
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

  const html = buildEmailShell({
    preheader: `Order ${orderNumber} confirmed. Delivery estimate included.`,
    title: `Order confirmed: ${orderNumber}`,
    bodyHtml,
    ctaLabel: "Track via Support",
    ctaHref: supportWhatsAppUrl
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
    text
  });
}

export async function sendAbandonedCartReminderEmail({
  email,
  firstName,
  cartUrl,
  cartSummary
}: SendAbandonedCartReminderEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">You left something behind</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, your selected item is still in your cart.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      ${escapeHtml(cartSummary)}
    </p>
  `.trim();

  const html = buildEmailShell({
    preheader: "Your BF Suma cart is waiting for you.",
    title: "You left something behind",
    bodyHtml,
    ctaLabel: "Return to cart",
    ctaHref: cartUrl
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
    text
  });
}

export async function sendPostPurchaseReviewRequestEmail({
  email,
  firstName,
  productName,
  reviewUrl
}: SendPostPurchaseReviewRequestEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">How are you getting on?</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, we hope your ${escapeHtml(productName)} is working well for you.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      Your feedback helps other customers choose with confidence.
    </p>
  `.trim();

  const html = buildEmailShell({
    preheader: "Share your product experience in one quick review.",
    title: "How are you getting on?",
    bodyHtml,
    ctaLabel: "Leave a review",
    ctaHref: reviewUrl
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
    text
  });
}

export async function sendReengagementEmail({
  email,
  firstName,
  bestSellersUrl
}: SendReengagementEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">We miss you at BF Suma</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
      Hi ${escapeHtml(firstName)}, we’ve refreshed our bestsellers and wellness picks since your last visit.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      Explore what’s trending now and pick up where you left off.
    </p>
  `.trim();

  const html = buildEmailShell({
    preheader: "See what BF Suma customers are choosing now.",
    title: "We miss you at BF Suma",
    bodyHtml,
    ctaLabel: "See bestsellers",
    ctaHref: bestSellersUrl
  });

  const text = [
    "We miss you at BF Suma.",
    "",
    `${firstName}, we’ve refreshed our bestsellers and wellness picks since your last visit.`,
    "",
    `See bestsellers: ${bestSellersUrl}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "We miss you at BF Suma",
    html,
    text
  });
}
