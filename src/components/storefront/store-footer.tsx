import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { MapPin } from "lucide-react";
import { ADDRESS, CONTACT, MAPS_URL, SOCIAL_LINKS } from "@/config/contact";
import {
  APP_DESCRIPTION,
  STORE_NAV_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_PHONE
} from "@/lib/constants";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
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
            href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("footer_primary"), SUPPORT_WHATSAPP_PHONE)}
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
            <a className="transition hover:text-accent-sun" href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("footer_support"), SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
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
          <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-white">Mobile Money</h4>
          <div className="mt-2 flex flex-col space-y-1 text-sm text-slate-100/85">
            <p>MTN Till: <span className="font-medium text-white">{CONTACT.mtnTill}</span></p>
            <p>Airtel Till: <span className="font-medium text-white">{CONTACT.airtelTill}</span></p>
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
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {SOCIAL_LINKS.map((link) => (
              <a
                className="text-slate-100/85 transition hover:text-accent-sun"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
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
          <Link className="transition hover:text-white" href="/refund-policy">Refunds</Link>
          <Link className="transition hover:text-white" href="/shipping">Shipping</Link>
          <Link className="transition hover:text-white" href="/cookies">Cookies</Link>
          <Link className="transition hover:text-white" href="/cookies#cookie-settings">Cookie Settings</Link>
        </div>
      </PageContainer>
    </footer>
  );
}
