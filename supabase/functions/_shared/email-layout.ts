/**
 * Branded HTML email layout for BF Suma (Deno edge functions).
 * Keep in sync with src/lib/email/templates/base.ts
 *
 * Uses TABLE-based HTML for Outlook compatibility.
 * All CSS is inline except for media queries in <head>.
 */

// Brand colors from tailwind.config.ts
const COLORS = {
  brand50: "#eef9ef",
  brand100: "#dcf2db",
  brand500: "#50b748",
  brand600: "#3d9f38",
  brand700: "#2f7f2d",
  brand800: "#236224",
  surface50: "#f7f6f2",
  accentSun: "#f9a533",
  textPrimary: "#0f172a",
  textSecondary: "#334155",
  textMuted: "#64748b",
  border: "#e2e8f0"
} as const;

// Contact info
const WHATSAPP_PRIMARY = "+256 747 928 920";
const WHATSAPP_SECONDARY = "+256 778 928 815";
const LOGO_URL = "https://bfsumauganda.com/bf-suma-logo.png";
const SITE_URL = "https://bfsumauganda.com";

export interface RenderEmailLayoutOptions {
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

export function renderEmailLayout(opts: RenderEmailLayoutOptions): string {
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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(heading)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .header-padding { padding: 20px 16px !important; }
      .body-padding { padding: 20px 16px !important; }
      .footer-padding { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.surface50}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader (hidden inbox preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(preheader)}
    ${"&nbsp;&zwnj;".repeat(30)}
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.surface50};">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid ${COLORS.border};">

          <!-- Header -->
          <tr>
            <td class="header-padding" style="background: linear-gradient(135deg, ${COLORS.brand800} 0%, ${COLORS.brand600} 100%); padding: 28px 32px; text-align: center;">
              <img src="${LOGO_URL}" alt="BF Suma" width="120" height="40" style="display: block; margin: 0 auto 12px; max-width: 120px; height: auto;" />
              <p style="margin: 0; font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.9); letter-spacing: 0.02em;">
                Wellness, Backed by Nature &amp; Science
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="body-padding" style="padding: 32px;">
              <h1 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: ${COLORS.textPrimary}; line-height: 1.3;">
                ${escapeHtml(heading)}
              </h1>
              <div style="font-size: 15px; line-height: 1.6; color: ${COLORS.textSecondary};">
                ${bodyHtml}
              </div>
              ${ctaBlock}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-padding" style="border-top: 1px solid ${COLORS.border}; padding: 24px 32px; background-color: ${COLORS.brand50};">
              ${footerNoteBlock}

              <!-- WhatsApp contact -->
              <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: ${COLORS.textSecondary};">
                <strong>Need help?</strong> WhatsApp us:<br />
                <a href="https://wa.me/256747928920" style="color: ${COLORS.brand700}; text-decoration: none;">${WHATSAPP_PRIMARY}</a> &nbsp;|&nbsp;
                <a href="https://wa.me/256778928815" style="color: ${COLORS.brand700}; text-decoration: none;">${WHATSAPP_SECONDARY}</a>
              </p>

              <!-- Social links -->
              <p style="margin: 0 0 12px; font-size: 13px; color: ${COLORS.textMuted};">
                Follow us:
                <a href="https://facebook.com/bfsumauganda" style="color: ${COLORS.brand700}; text-decoration: none; margin-left: 4px;">Facebook</a> &nbsp;|&nbsp;
                <a href="https://instagram.com/bfsumauganda" style="color: ${COLORS.brand700}; text-decoration: none;">Instagram</a> &nbsp;|&nbsp;
                <a href="https://twitter.com/bfsumauganda" style="color: ${COLORS.brand700}; text-decoration: none;">Twitter</a>
              </p>

              <!-- Address placeholder -->
              <!-- TODO: Add physical address when confirmed -->

              ${unsubscribeBlock}

              <!-- Sent-to disclaimer -->
              <p style="margin: 16px 0 0; font-size: 11px; color: ${COLORS.textMuted};">
                This email was sent to <span style="color: ${COLORS.textSecondary};">${escapeHtml(recipientEmail)}</span>
              </p>

              <!-- Copyright -->
              <p style="margin: 8px 0 0; font-size: 11px; color: ${COLORS.textMuted};">
                &copy; ${new Date().getFullYear()} BF Suma Uganda. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email container -->

      </td>
    </tr>
  </table>
  <!-- /Email wrapper -->
</body>
</html>`;
}
