import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Facebook, Instagram, MapPin, Twitter, Youtube } from "lucide-react";
import { ADDRESS, CONTACT, MAPS_URL, SOCIAL_LINKS } from "@/config/contact";
import type { ReactNode } from "react";

const SOCIAL_ICONS: Record<string, ReactNode> = {
  Facebook: <Facebook className="h-5 w-5" />,
  Instagram: <Instagram className="h-5 w-5" />,
  YouTube: <Youtube className="h-5 w-5" />,
  X: <Twitter className="h-5 w-5" />,
  TikTok: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
};
import {
  APP_DESCRIPTION,
  STORE_NAV_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_PHONE
} from "@/lib/constants";
import { buildWhatsAppFooterSupportMessage, buildWhatsAppGenericInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { NewsletterSignup } from "@/components/storefront/newsletter-signup";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-logo-spectrum-footer py-8 text-slate-100">
      <PageContainer className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))]">
        <div className="space-y-2.5">
          <h3 className="text-lg font-bold text-white">BF Suma</h3>
          <p className="text-sm leading-relaxed text-slate-100/85">{APP_DESCRIPTION}</p>
          <a
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand-500 px-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
            href={buildWhatsAppUrl(buildWhatsAppGenericInquiryMessage(), SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp Support
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Explore</h4>
          <div className="mt-3 flex flex-col space-y-2 text-sm text-slate-100/85">
            {STORE_NAV_LINKS.map((item) => (
              <Link className="transition hover:text-accent-sun" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Support</h4>
          <div className="mt-3 flex flex-col space-y-2 text-sm text-slate-100/85">
            <a className="transition hover:text-accent-sun" href={buildWhatsAppUrl(buildWhatsAppFooterSupportMessage(), SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
              WhatsApp
            </a>
            <a className="transition hover:text-accent-sun" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <a
              className="flex items-center gap-1.5 text-slate-200 transition hover:text-accent-sun"
              href={MAPS_URL}
              rel="noreferrer"
              target="_blank"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{ADDRESS.full}</span>
            </a>
            <a className="transition hover:text-accent-sun" href={`tel:${CONTACT.whatsappPrimaryDisplay.replace(/\s/g, "")}`}>
              {CONTACT.whatsappPrimaryLabel}: {CONTACT.whatsappPrimaryDisplay}
            </a>
            <a className="transition hover:text-accent-sun" href={`tel:${CONTACT.whatsappSecondaryDisplay.replace(/\s/g, "")}`}>
              {CONTACT.whatsappSecondaryLabel}: {CONTACT.whatsappSecondaryDisplay}
            </a>
          </div>
        </div>

        <div>
          <NewsletterSignup
            source="footer"
            context="footer_newsletter"
            compact
            onDark
            title="Newsletter"
            description="Get new product updates and wellness tips. No spam."
            ctaLabel="Subscribe"
            className="max-w-xs"
          />
          <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-white">Follow Us</h4>
          <div className="mt-2 flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                className="text-slate-100/85 transition hover:text-accent-sun"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
                aria-label={link.label}
              >
                {SOCIAL_ICONS[link.label] ?? link.label}
              </a>
            ))}
          </div>
        </div>
      </PageContainer>

      <PageContainer className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-100/80 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} BF Suma. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link className="transition hover:text-white" href="/privacy">Privacy</Link>
          <Link className="transition hover:text-white" href="/terms">Terms</Link>
          <Link className="transition hover:text-white" href="/shipping">Shipping</Link>
          <Link className="transition hover:text-white" href="/cookies">Cookies</Link>
          <Link className="transition hover:text-white" href="/cookies#cookie-settings">Cookie Settings</Link>
        </div>
      </PageContainer>
    </footer>
  );
}
