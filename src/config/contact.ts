/**
 * Centralized contact configuration
 *
 * For email templates and footer payment info.
 * Storefront WhatsApp buttons use env vars via src/lib/constants.ts
 */

export const CONTACT = {
  /** Primary WhatsApp - MTN (digits only for wa.me links) */
  whatsappPrimary: "256778928815",
  /** Secondary WhatsApp - Airtel (digits only) */
  whatsappSecondary: "256747928920",

  /** Display formats for UI */
  whatsappPrimaryDisplay: "+256 778 928 815",
  whatsappSecondaryDisplay: "+256 747 928 920",

  /** Network labels */
  whatsappPrimaryLabel: "MTN",
  whatsappSecondaryLabel: "Airtel",

  /** Mobile Money till numbers */
  airtelTill: "7063501",
  mtnTill: "82661246",
} as const;

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/bfsumauganda" },
  { label: "Instagram", href: "https://instagram.com/bfsumauganda" },
  { label: "TikTok", href: "https://tiktok.com/@bfsumauganda" },
  { label: "X", href: "https://x.com/bfsumauganda" },
  { label: "YouTube", href: "https://youtube.com/@bfsumauganda" },
] as const;

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

export const ADDRESS = {
  line1: "Plot 1 Entebbe Road",
  line2: "Lloyds Mall, Shop No. 1",
  city: "Kampala",
  country: "Uganda",
  full: "Plot 1 Entebbe Road, Lloyds Mall, Shop No. 1, Kampala, Uganda"
} as const;

export const MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(ADDRESS.full)}`;
