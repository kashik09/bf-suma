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
  return [
    "<div style=\"font-family:Arial,sans-serif;line-height:1.5;color:#0f172a\">",
    "<h2 style=\"margin:0 0 12px\">Welcome to BF Suma updates</h2>",
    "<p style=\"margin:0 0 10px\">You are now subscribed to wellness product updates and practical buying guides.</p>",
    "<p style=\"margin:0\">If you need help selecting products, reply to this email or reach us on WhatsApp.</p>",
    "</div>"
  ].join("");
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
        text: "You are now subscribed to BF Suma updates. Reply to this email or use WhatsApp if you need help choosing products.",
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
