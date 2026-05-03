/**
 * Centralized email sender configuration for BF Suma.
 *
 * Each email purpose maps to a specific sender address and reply-to,
 * ensuring customers see the right "from" based on email type.
 */

export type EmailPurpose =
  | "order" // order confirmations, shipping updates
  | "support" // support replies, contact form auto-responses
  | "partnership" // distributor signups, partnership inquiries
  | "newsletter" // newsletter welcome, marketing
  | "transactional"; // password reset, account verification, abandoned cart, review requests

export interface SenderConfig {
  from: string;
  replyTo: string;
}

function getEmailDomain(): string {
  const envDomain = process.env.EMAIL_DOMAIN?.trim();
  if (envDomain && envDomain.length > 0) {
    return envDomain;
  }
  return "bfsumauganda.com";
}

function buildSenders(): Record<EmailPurpose, SenderConfig> {
  const domain = getEmailDomain();

  return {
    order: {
      from: `BF Suma Orders <orders@${domain}>`,
      replyTo: `orders@${domain}`
    },
    support: {
      from: `BF Suma Support <support@${domain}>`,
      replyTo: `support@${domain}`
    },
    partnership: {
      from: `BF Suma Partnerships <partnerships@${domain}>`,
      replyTo: `partnerships@${domain}`
    },
    newsletter: {
      from: `BF Suma <hello@${domain}>`,
      replyTo: `hello@${domain}`
    },
    transactional: {
      from: `BF Suma <noreply@${domain}>`,
      replyTo: `support@${domain}`
    }
  };
}

// Lazy-loaded singleton to allow env vars to be read at runtime
let _senders: Record<EmailPurpose, SenderConfig> | null = null;

export function getSenders(): Record<EmailPurpose, SenderConfig> {
  if (!_senders) {
    _senders = buildSenders();
  }
  return _senders;
}

export function getSender(purpose: EmailPurpose): SenderConfig {
  return getSenders()[purpose];
}

/**
 * For edge functions that need raw values without the lazy singleton.
 * Pass the domain explicitly since Deno env access differs.
 */
export function buildSendersForDomain(domain: string): Record<EmailPurpose, SenderConfig> {
  return {
    order: {
      from: `BF Suma Orders <orders@${domain}>`,
      replyTo: `orders@${domain}`
    },
    support: {
      from: `BF Suma Support <support@${domain}>`,
      replyTo: `support@${domain}`
    },
    partnership: {
      from: `BF Suma Partnerships <partnerships@${domain}>`,
      replyTo: `partnerships@${domain}`
    },
    newsletter: {
      from: `BF Suma <hello@${domain}>`,
      replyTo: `hello@${domain}`
    },
    transactional: {
      from: `BF Suma <noreply@${domain}>`,
      replyTo: `support@${domain}`
    }
  };
}
