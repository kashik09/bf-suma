interface SendNewsletterWelcomeEmailInput {
  email: string;
}

export interface EmailDeliveryResult {
  status: "sent" | "skipped" | "failed";
  messageId?: string;
  reason?: string;
}

function isEnabled() {
  return process.env.NEWSLETTER_WELCOME_EMAIL_ENABLED !== "false";
}

function resolveResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();

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

function buildWelcomeEmailHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BF Suma</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a2f 0%,#234d3f 50%,#2d5f4f 100%);padding:32px 32px 28px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">BF Suma</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Trusted wellness essentials</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#0f172a;">You're subscribed!</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                Thank you for joining our community. You'll now receive updates on new wellness products, practical health tips, and exclusive offers.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
                We keep our emails concise and valuable — no spam, just content that helps you make informed wellness choices.
              </p>
              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color:#22c55e;border-radius:8px;">
                    <a href="https://bfsuma.com/shop" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Browse Products
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="margin:0;border:none;border-top:1px solid #e2e8f0;">
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
                Need help choosing products?
              </p>
              <p style="margin:0;font-size:13px;color:#64748b;">
                Reply to this email or reach us on <a href="https://wa.me/256761309924" style="color:#22c55e;text-decoration:none;font-weight:500;">WhatsApp</a>
              </p>
            </td>
          </tr>
        </table>
        <!-- Legal -->
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
          &copy; ${new Date().getFullYear()} BF Suma. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

export async function sendNewsletterWelcomeEmail({
  email
}: SendNewsletterWelcomeEmailInput): Promise<EmailDeliveryResult> {
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
        to: [email],
        subject: "You are subscribed to BF Suma updates",
        html: buildWelcomeEmailHtml(),
        text: "You're subscribed!\n\nThank you for joining our community. You'll now receive updates on new wellness products, practical health tips, and exclusive offers.\n\nWe keep our emails concise and valuable — no spam, just content that helps you make informed wellness choices.\n\nBrowse Products: https://bfsuma.com/shop\n\nNeed help choosing products? Reply to this email or reach us on WhatsApp: https://wa.me/256761309924\n\n© 2026 BF Suma. All rights reserved.",
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
