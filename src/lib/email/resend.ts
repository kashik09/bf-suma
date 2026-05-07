import { formatCurrency } from "@/lib/utils";
import { getWhatsAppPrimaryUrl } from "@/config/contact";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppOrderSupportMessage, buildWhatsAppGenericInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
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
  purpose,
  replyTo
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  purpose: EmailPurpose;
  replyTo?: string;
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
        reply_to: replyTo ?? sender.replyTo
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
      You're in. Expect occasional wellness tips, new product alerts, and practical health guidance — no spam, just useful stuff.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
      Questions anytime? Just reply to this email or reach us on WhatsApp.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "You're now subscribed to BF Suma wellness updates.",
    heading: "You're on the list",
    bodyHtml,
    ctaText: "Browse Products",
    ctaUrl: "https://bfsumauganda.com/shop",
    recipientEmail: email,
    showUnsubscribe: true
  });

  const text = [
    "You're on the list.",
    "",
    "Expect occasional wellness tips, new product alerts, and practical health guidance — no spam, just useful stuff.",
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
      Hi ${escapeHtml(firstName)}, thanks for ordering with us. Your first order means a lot — we'll make sure it goes smoothly.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      If you ever have questions about a product or need help, just WhatsApp us. We're quick to respond.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "Your first BF Suma order — here's what to expect.",
    heading: "Welcome aboard",
    bodyHtml,
    ctaText: "Browse wellness guides",
    ctaUrl: "https://bfsumauganda.com/blog",
    recipientEmail: email
  });

  const text = [
    "Welcome aboard.",
    "",
    `Hi ${firstName}, thanks for ordering with us. Your first order means a lot — we'll make sure it goes smoothly.`,
    "Questions about a product? Just WhatsApp us. We're quick to respond.",
    "",
    "Browse wellness guides: https://bfsumauganda.com/blog"
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
  const genericInquiryWhatsAppUrl = buildWhatsAppUrl(buildWhatsAppGenericInquiryMessage(), SUPPORT_WHATSAPP_PHONE);
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
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      Tip: Check the usage guidance on each label for best results. Questions? WhatsApp us anytime.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:12px 0 0;">
      <tr>
        <td style="border-radius:6px;background-color:#25D366;">
          <a href="${genericInquiryWhatsAppUrl}" target="_blank" style="display:inline-block;padding:10px 16px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">WhatsApp us</a>
        </td>
      </tr>
    </table>
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
    "Tip: Check the usage guidance on each label for best results. Questions? WhatsApp us anytime.",
    `WhatsApp us: ${genericInquiryWhatsAppUrl}`,
    "",
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
      Hi ${escapeHtml(firstName)}, you've still got items in your cart. No rush — just a heads-up in case you meant to finish.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      ${escapeHtml(cartSummary)}
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "Your BF Suma cart is still waiting.",
    heading: "Still interested?",
    bodyHtml,
    ctaText: "Complete your order",
    ctaUrl: cartUrl,
    recipientEmail: email
  });

  const text = [
    "Still interested?",
    "",
    `${firstName}, you've still got items in your cart. No rush — just a heads-up in case you meant to finish.`,
    cartSummary,
    "",
    `Complete your order: ${cartUrl}`
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
      Hi ${escapeHtml(firstName)}, how's the ${escapeHtml(productName)} treating you?
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      A quick review helps other customers decide — and we'd genuinely appreciate it.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "Quick favor: share your experience with your recent purchase.",
    heading: "Quick check-in",
    bodyHtml,
    ctaText: "Leave a review",
    ctaUrl: reviewUrl,
    recipientEmail: email
  });

  const text = [
    "Quick check-in",
    "",
    `${firstName}, how's the ${productName} treating you?`,
    "A quick review helps other customers decide — and we'd genuinely appreciate it.",
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
      Hi ${escapeHtml(firstName)}, it's been a while. We've added new products and restocked popular items since your last visit.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      Here's what customers are buying now.
    </p>
  `.trim();

  const html = renderEmailLayout({
    preheader: "New arrivals and restocks at BF Suma.",
    heading: "See what's new",
    bodyHtml,
    ctaText: "View bestsellers",
    ctaUrl: bestSellersUrl,
    recipientEmail: email,
    showUnsubscribe: true
  });

  const text = [
    "See what's new at BF Suma.",
    "",
    `${firstName}, it's been a while. We've added new products and restocked popular items since your last visit.`,
    "",
    `View bestsellers: ${bestSellersUrl}`
  ].join("\n");

  return sendEmail({
    to: email,
    subject: "We miss you at BF Suma",
    html,
    text,
    purpose: "transactional"
  });
}

interface SendInternalOrderNotificationInput {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  notes?: string;
  createdAt: string;
}

export async function sendInternalOrderNotification({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  fulfillmentType,
  deliveryAddress,
  subtotal,
  deliveryFee,
  total,
  currency,
  items,
  notes,
  createdAt
}: SendInternalOrderNotificationInput): Promise<EmailDeliveryResult> {
  const internalEmail = process.env.INTERNAL_ORDERS_EMAIL || "orders@bfsumauganda.com";
  const fulfillmentLabel = fulfillmentType === "pickup" ? "PICKUP" : "DELIVERY";

  const itemsHtml = items
    .map((item) => {
      const safeName = escapeHtml(item.name);
      return `<tr>
      <td style="padding:8px 12px;font-size:14px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${safeName}</td>
      <td style="padding:8px 12px;font-size:14px;color:#334155;text-align:center;border-bottom:1px solid #e2e8f0;">${item.quantity}</td>
      <td style="padding:8px 12px;font-size:14px;color:#334155;text-align:right;border-bottom:1px solid #e2e8f0;">${escapeHtml(formatCurrency(item.unitPrice, currency))}</td>
      <td style="padding:8px 12px;font-size:14px;color:#334155;text-align:right;border-bottom:1px solid #e2e8f0;">${escapeHtml(formatCurrency(item.lineTotal, currency))}</td>
    </tr>`;
    })
    .join("");

  const itemsText = items
    .map((item) => `- ${item.name} x${item.quantity} @ ${formatCurrency(item.unitPrice, currency)} = ${formatCurrency(item.lineTotal, currency)}`)
    .join("\n");

  const orderTime = new Date(createdAt).toLocaleString("en-UG", {
    timeZone: "Africa/Kampala",
    dateStyle: "medium",
    timeStyle: "short"
  });

  const bodyHtml = `
    <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin-bottom:16px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${escapeHtml(orderNumber)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#64748b;">${orderTime}</p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;width:100px;">Customer</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${escapeHtml(customerName)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;">Email</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;">${escapeHtml(customerEmail)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;">Phone</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;">${escapeHtml(customerPhone)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;">Fulfillment</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${fulfillmentLabel}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;vertical-align:top;">Address</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;">${escapeHtml(deliveryAddress)}</td>
      </tr>
      ${notes ? `<tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;vertical-align:top;">Notes</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;">${escapeHtml(notes)}</td>
      </tr>` : ""}
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th align="left" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;">Item</th>
          <th align="center" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;">Qty</th>
          <th align="right" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;">Unit</th>
          <th align="right" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border-radius:8px;padding:12px;">
      <tr>
        <td style="padding:6px 12px;font-size:14px;color:#64748b;">Subtotal</td>
        <td style="padding:6px 12px;font-size:14px;color:#0f172a;text-align:right;">${escapeHtml(formatCurrency(subtotal, currency))}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;font-size:14px;color:#64748b;">Delivery</td>
        <td style="padding:6px 12px;font-size:14px;color:#0f172a;text-align:right;">${deliveryFee === 0 ? "Free" : escapeHtml(formatCurrency(deliveryFee, currency))}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;font-size:16px;font-weight:700;color:#0f172a;">Total</td>
        <td style="padding:6px 12px;font-size:16px;font-weight:700;color:#0f172a;text-align:right;">${escapeHtml(formatCurrency(total, currency))}</td>
      </tr>
    </table>
  `.trim();

  const html = renderEmailLayout({
    preheader: `New order ${orderNumber} - ${formatCurrency(total, currency)} - ${fulfillmentLabel}`,
    heading: `New Order: ${orderNumber}`,
    bodyHtml,
    ctaText: "View in Admin",
    ctaUrl: `https://bfsumauganda.com/admin/orders`,
    recipientEmail: internalEmail
  });

  const text = [
    `NEW ORDER: ${orderNumber}`,
    `Received: ${orderTime}`,
    "",
    "CUSTOMER",
    `Name: ${customerName}`,
    `Email: ${customerEmail}`,
    `Phone: ${customerPhone}`,
    "",
    `FULFILLMENT: ${fulfillmentLabel}`,
    `Address: ${deliveryAddress}`,
    notes ? `Notes: ${notes}` : "",
    "",
    "ITEMS",
    itemsText,
    "",
    `Subtotal: ${formatCurrency(subtotal, currency)}`,
    `Delivery: ${deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee, currency)}`,
    `TOTAL: ${formatCurrency(total, currency)}`,
    "",
    "View in admin: https://bfsumauganda.com/admin/orders"
  ].filter(Boolean).join("\n");

  return sendEmail({
    to: internalEmail,
    subject: `New Order ${orderNumber} - ${formatCurrency(total, currency)}`,
    html,
    text,
    purpose: "order"
  });
}

interface SendContactFormSubmissionEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormSubmissionEmail({
  name,
  email,
  subject,
  message
}: SendContactFormSubmissionEmailInput): Promise<EmailDeliveryResult> {
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      New contact form submission:
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#64748b;width:100px;">Name</td>
        <td style="padding:12px 16px;color:#0f172a;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#64748b;border-top:1px solid #e2e8f0;">Email</td>
        <td style="padding:12px 16px;color:#0f172a;border-top:1px solid #e2e8f0;">
          <a href="mailto:${escapeHtml(email)}" style="color:#2f7f2d;">${escapeHtml(email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#64748b;border-top:1px solid #e2e8f0;">Subject</td>
        <td style="padding:12px 16px;color:#0f172a;border-top:1px solid #e2e8f0;">${escapeHtml(subject)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:600;color:#64748b;border-top:1px solid #e2e8f0;vertical-align:top;">Message</td>
        <td style="padding:12px 16px;color:#0f172a;border-top:1px solid #e2e8f0;white-space:pre-wrap;">${escapeHtml(message)}</td>
      </tr>
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
      Reply directly to this email to respond to the customer.
    </p>
  `.trim();

  const text = [
    "New contact form submission:",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
    "",
    "Reply directly to this email to respond to the customer."
  ].join("\n");

  const html = renderEmailLayout({
    preheader: `Contact form: ${subject}`,
    heading: "New message from website",
    bodyHtml,
    recipientEmail: "support@bfsumauganda.com"
  });

  return sendEmail({
    to: "support@bfsumauganda.com",
    subject: `Contact form: ${subject}`,
    html,
    text,
    purpose: "transactional",
    replyTo: email
  });
}
