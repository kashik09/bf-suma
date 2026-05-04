/**
 * Centralized contact configuration
 *
 * For email templates and footer payment info.
 * Storefront WhatsApp buttons use env vars via src/lib/constants.ts
 */

export const CONTACT = {
  /** Primary WhatsApp (digits only for wa.me links) */
  whatsappPrimary: "256747928920",
  /** Secondary WhatsApp (digits only) */
  whatsappSecondary: "256778928815",

  /** Display formats for email copy */
  whatsappPrimaryDisplay: "+256 747 928 920",
  whatsappSecondaryDisplay: "+256 778 928 815",

  /** Mobile Money till numbers */
  airtelTill: "7063501",
  mtnTill: "82661246",
} as const;

/** Build wa.me URL for primary WhatsApp */
export function getWhatsAppPrimaryUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappPrimary}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build wa.me URL for secondary WhatsApp */
export function getWhatsAppSecondaryUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappSecondary}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
