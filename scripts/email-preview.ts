/**
 * Email Preview Script
 *
 * Renders email templates with mock data for visual QA.
 *
 * Usage:
 *   npx tsx scripts/email-preview.ts [type]           # Generate HTML preview
 *   npx tsx scripts/email-preview.ts [type] --send <email>  # Send test email
 *
 * Types: newsletter, welcome, order, abandoned, review, reengagement, all
 *
 * Output: scripts/email-previews/{type}.html
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { CONTACT } from "../src/config/contact";

// Load environment for --send option
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  }
}

const COLORS = {
  brand50: "#eef9ef",
  brand100: "#dcf2db",
  brand500: "#50b748",
  brand600: "#3d9f38",
  brand700: "#2f7f2d",
  brand800: "#236224",
  surface50: "#f7f6f2",
  textPrimary: "#0f172a",
  textSecondary: "#334155",
  textMuted: "#64748b",
  border: "#e2e8f0"
} as const;

// Phone numbers from canonical source
const WHATSAPP_PRIMARY = CONTACT.whatsappPrimaryDisplay;
const WHATSAPP_SECONDARY = CONTACT.whatsappSecondaryDisplay;
const WHATSAPP_PRIMARY_DIGITS = CONTACT.whatsappPrimary;
const WHATSAPP_SECONDARY_DIGITS = CONTACT.whatsappSecondary;
const WHATSAPP_PRIMARY_LABEL = CONTACT.whatsappPrimaryLabel;
const WHATSAPP_SECONDARY_LABEL = CONTACT.whatsappSecondaryLabel;
const LOGO_URL = "https://bfsumauganda.com/bf-suma-logo.png";
const SITE_URL = "https://bfsumauganda.com";

interface RenderEmailLayoutOptions {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  recipientEmail: string;
  showUnsubscribe?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderEmailLayout(opts: RenderEmailLayoutOptions): string {
  const {
    preheader,
    heading,
    bodyHtml,
    ctaText,
    ctaUrl,
    footerNote,
    recipientEmail,
    showUnsubscribe = false
  } = opts;

  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;

  const ctaBlock = ctaText && ctaUrl ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px auto 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: ${COLORS.brand500};">
                    <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      ${escapeHtml(ctaText)}
                    </a>
                  </td>
                </tr>
              </table>` : "";

  const footerNoteBlock = footerNote ? `
              <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: ${COLORS.textMuted};">
                ${escapeHtml(footerNote)}
              </p>` : "";

  const unsubscribeBlock = showUnsubscribe ? `
              <p style="margin: 12px 0 0; font-size: 12px; color: ${COLORS.textMuted};">
                <a href="${escapeHtml(unsubscribeUrl)}" style="color: ${COLORS.textMuted}; text-decoration: underline;">Unsubscribe</a> from these emails.
              </p>` : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(heading)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .header-padding { padding: 20px 16px !important; }
      .body-padding { padding: 20px 16px !important; }
      .footer-padding { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface50}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface50};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid ${COLORS.border};">
          <tr>
            <td class="header-padding" style="background: linear-gradient(135deg, ${COLORS.brand800} 0%, ${COLORS.brand600} 100%); padding: 28px 32px; text-align: center;">
              <img src="${LOGO_URL}" alt="BF Suma" width="120" height="40" style="display: block; margin: 0 auto 12px; max-width: 120px; height: auto;" />
              <p style="margin: 0; font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.9);">
                Wellness, Backed by Nature &amp; Science
              </p>
            </td>
          </tr>
          <tr>
            <td class="body-padding" style="padding: 32px;">
              <h1 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: ${COLORS.textPrimary};">
                ${escapeHtml(heading)}
              </h1>
              <div style="font-size: 15px; line-height: 1.6; color: ${COLORS.textSecondary};">
                ${bodyHtml}
              </div>
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td class="footer-padding" style="border-top: 1px solid ${COLORS.border}; padding: 24px 32px; background-color: ${COLORS.brand50};">
              ${footerNoteBlock}
              <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.8; color: ${COLORS.textSecondary};">
                <strong>Need help?</strong> WhatsApp us:<br />
                ${WHATSAPP_PRIMARY_LABEL}: <a href="https://wa.me/${WHATSAPP_PRIMARY_DIGITS}" style="color: ${COLORS.brand700}; text-decoration: none;">${WHATSAPP_PRIMARY}</a><br />
                ${WHATSAPP_SECONDARY_LABEL}: <a href="https://wa.me/${WHATSAPP_SECONDARY_DIGITS}" style="color: ${COLORS.brand700}; text-decoration: none;">${WHATSAPP_SECONDARY}</a>
              </p>
              <p style="margin: 0 0 12px; font-size: 13px; color: ${COLORS.textMuted};">
                Follow us:
                <a href="https://facebook.com/bfsumauganda" style="color: ${COLORS.brand700};">Facebook</a> |
                <a href="https://instagram.com/bfsumauganda" style="color: ${COLORS.brand700};">Instagram</a> |
                <a href="https://twitter.com/bfsumauganda" style="color: ${COLORS.brand700};">Twitter</a>
              </p>
              ${unsubscribeBlock}
              <p style="margin: 16px 0 0; font-size: 11px; color: ${COLORS.textMuted};">
                This email was sent to <span style="color: ${COLORS.textSecondary};">${escapeHtml(recipientEmail)}</span>
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: ${COLORS.textMuted};">
                &copy; ${new Date().getFullYear()} BF Suma Uganda. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Mock data for each email type
const MOCK_DATA = {
  recipientEmail: "test@example.com",
  firstName: "Sarah",
  orderNumber: "ORD-2026-00123",
  productName: "Pure Ganoderma Spores (60's)",
  cartSummary: "Cordyceps Coffee x2, Arthro Xtra Tablets x1"
};

type EmailType = "newsletter" | "welcome" | "order" | "abandoned" | "review" | "reengagement";

const EMAIL_GENERATORS: Record<EmailType, () => { html: string; subject: string }> = {
  newsletter: () => ({
    subject: "Welcome to BF Suma updates",
    html: renderEmailLayout({
      preheader: "You are now subscribed to BF Suma wellness updates.",
      heading: "Welcome to BF Suma updates",
      bodyHtml: `
        <p style="margin:0 0 12px;">Thanks for subscribing. You'll receive concise wellness tips, product updates, and useful guidance without inbox noise.</p>
        <p style="margin:0;">We focus on practical advice that helps you choose products with confidence.</p>
      `,
      ctaText: "Browse Products",
      ctaUrl: "https://bfsumauganda.com/shop",
      recipientEmail: MOCK_DATA.recipientEmail,
      showUnsubscribe: true
    })
  }),

  welcome: () => ({
    subject: "Welcome to BF Suma",
    html: renderEmailLayout({
      preheader: "Thanks for your first BF Suma order.",
      heading: "Welcome to BF Suma",
      bodyHtml: `
        <p style="margin:0 0 12px;">Hi ${MOCK_DATA.firstName}, thanks for your first order. We're glad you chose BF Suma.</p>
        <p style="margin:0;">What makes us different: clear product guidance, transparent pricing, and direct support when you need it.</p>
      `,
      ctaText: "Read wellness guides",
      ctaUrl: "https://bfsumauganda.com/blog",
      recipientEmail: MOCK_DATA.recipientEmail
    })
  }),

  order: () => ({
    subject: `Order confirmed: ${MOCK_DATA.orderNumber}`,
    html: renderEmailLayout({
      preheader: `Order ${MOCK_DATA.orderNumber} confirmed. Delivery estimate included.`,
      heading: `Order confirmed: ${MOCK_DATA.orderNumber}`,
      bodyHtml: `
        <p style="margin:0 0 12px;">Hi ${MOCK_DATA.firstName}, we've received your order <strong>${MOCK_DATA.orderNumber}</strong>.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 12px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;background:#f8fafc;">Item</th>
              <th align="center" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;background:#f8fafc;">Qty</th>
              <th align="right" style="padding:10px 12px;font-size:12px;font-weight:600;text-transform:uppercase;color:#64748b;background:#f8fafc;">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px 12px;font-size:14px;">Cordyceps Coffee</td>
              <td style="padding:10px 12px;font-size:14px;text-align:center;">2</td>
              <td style="padding:10px 12px;font-size:14px;text-align:right;">UGX 116,064</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-size:14px;border-top:1px solid #e2e8f0;">Arthro Xtra Tablets</td>
              <td style="padding:10px 12px;font-size:14px;text-align:center;border-top:1px solid #e2e8f0;">1</td>
              <td style="padding:10px 12px;font-size:14px;text-align:right;border-top:1px solid #e2e8f0;">UGX 178,560</td>
            </tr>
          </tbody>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr><td style="padding:10px 12px;font-size:14px;">Subtotal: <strong>UGX 294,624</strong></td></tr>
          <tr><td style="padding:10px 12px;font-size:14px;border-top:1px solid #e2e8f0;">Delivery: <strong>UGX 15,000</strong></td></tr>
          <tr><td style="padding:10px 12px;font-size:14px;border-top:1px solid #e2e8f0;color:#0f172a;">Total: <strong>UGX 309,624</strong></td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:14px;">Delivery address: <strong>Plot 45, Kampala Road, Kampala</strong></p>
        <p style="margin:12px 0 0;font-size:14px;">Delivery estimate: <strong>2-3 business days</strong></p>
      `,
      ctaText: "Track via Support",
      ctaUrl: `https://wa.me/${WHATSAPP_PRIMARY_DIGITS}`,
      footerNote: "Thank you for shopping with BF Suma.",
      recipientEmail: MOCK_DATA.recipientEmail
    })
  }),

  abandoned: () => ({
    subject: "You left something behind",
    html: renderEmailLayout({
      preheader: "Your BF Suma cart is waiting for you.",
      heading: "You left something behind",
      bodyHtml: `
        <p style="margin:0 0 12px;">Hi ${MOCK_DATA.firstName}, your BF Suma cart is still waiting for you.</p>
        <p style="margin:0;font-weight:600;">${MOCK_DATA.cartSummary}</p>
      `,
      ctaText: "Return to cart",
      ctaUrl: "https://bfsumauganda.com/cart",
      recipientEmail: MOCK_DATA.recipientEmail
    })
  }),

  review: () => ({
    subject: "How are you getting on?",
    html: renderEmailLayout({
      preheader: "Share your product experience in one quick review.",
      heading: "How are you getting on?",
      bodyHtml: `
        <p style="margin:0 0 12px;">Hi ${MOCK_DATA.firstName}, we hope your ${MOCK_DATA.productName} is working well for you.</p>
        <p style="margin:0;">Your feedback helps other customers choose with confidence.</p>
      `,
      ctaText: "Leave a review",
      ctaUrl: "https://bfsumauganda.com/shop/pure-ganoderma-spores-60#reviews",
      recipientEmail: MOCK_DATA.recipientEmail
    })
  }),

  reengagement: () => ({
    subject: "We miss you at BF Suma",
    html: renderEmailLayout({
      preheader: "See what BF Suma customers are choosing now.",
      heading: "We miss you at BF Suma",
      bodyHtml: `
        <p style="margin:0 0 12px;">Hi ${MOCK_DATA.firstName}, we've refreshed our bestsellers and wellness picks since your last visit.</p>
        <p style="margin:0;">Explore what's trending now and pick up where you left off.</p>
      `,
      ctaText: "See bestsellers",
      ctaUrl: "https://bfsumauganda.com/shop",
      recipientEmail: MOCK_DATA.recipientEmail,
      showUnsubscribe: true
    })
  })
};

const OUTPUT_DIR = resolve(process.cwd(), "scripts/email-previews");

async function sendTestEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set in .env.local");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "BF Suma <noreply@bfsumauganda.com>",
      to: [to],
      subject: `[TEST] ${subject}`,
      html
    })
  });

  return response.ok;
}

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args[0] || "all";
  const sendIndex = args.indexOf("--send");
  const sendTo = sendIndex !== -1 ? args[sendIndex + 1] : null;

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const types: EmailType[] = typeArg === "all"
    ? ["newsletter", "welcome", "order", "abandoned", "review", "reengagement"]
    : [typeArg as EmailType];

  console.log("Email Preview Script");
  console.log("====================\n");

  for (const type of types) {
    const generator = EMAIL_GENERATORS[type];
    if (!generator) {
      console.error(`Unknown email type: ${type}`);
      console.log("Available types: newsletter, welcome, order, abandoned, review, reengagement, all");
      process.exit(1);
    }

    const { html, subject } = generator();
    const outputPath = resolve(OUTPUT_DIR, `${type}.html`);
    writeFileSync(outputPath, html);
    console.log(`✓ ${type}.html generated`);

    if (sendTo) {
      console.log(`  Sending to ${sendTo}...`);
      const sent = await sendTestEmail(sendTo, subject, html);
      if (sent) {
        console.log(`  ✓ Sent successfully`);
      } else {
        console.log(`  ✗ Failed to send`);
      }
    }
  }

  console.log(`\nOutput: ${OUTPUT_DIR}/`);

  // Visual QA checklist
  console.log("\n📋 Visual QA Checklist:");
  console.log("  - Logo loads correctly");
  console.log("  - Brand gradient (green) in header");
  console.log("  - CTA button is brand green");
  console.log("  - WhatsApp numbers visible in footer");
  console.log("  - Social links present");
  console.log("  - Mobile responsive (check at 375px width)");
}

main().catch(console.error);
