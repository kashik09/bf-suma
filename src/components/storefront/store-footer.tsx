import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import {
  APP_DESCRIPTION,
  STORE_NAV_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONES,
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
            <Link className="transition hover:text-accent-sun" href="/contact">Contact Form</Link>
            <a className="transition hover:text-accent-sun" href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("footer_support"), SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
              WhatsApp
            </a>
            <a className="transition hover:text-accent-sun" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            {SUPPORT_PHONES.map((phone) => (
              <a className="transition hover:text-accent-sun" href={`tel:${phone}`} key={phone}>
                {phone}
              </a>
            ))}
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
        </div>
      </PageContainer>

      <PageContainer className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-100/80 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} BF Suma. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link className="transition hover:text-white" href="/privacy">Privacy</Link>
          <Link className="transition hover:text-white" href="/terms">Terms</Link>
          <Link className="transition hover:text-white" href="/refund-policy">Refunds</Link>
          <Link className="transition hover:text-white" href="/shipping">Shipping</Link>
        </div>
      </PageContainer>
    </footer>
  );
}
