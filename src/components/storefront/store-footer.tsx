import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import {
  APP_DESCRIPTION,
  STORE_NAV_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONES,
  SUPPORT_WHATSAPP_PHONE
} from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-logo-spectrum-footer py-12 text-slate-100">
      <PageContainer className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">BF Suma</h3>
          <p className="text-sm leading-relaxed text-slate-100/85">{APP_DESCRIPTION}</p>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
            href={buildWhatsAppUrl("Hello BF Suma, I need product guidance.", SUPPORT_WHATSAPP_PHONE)}
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
            <a className="transition hover:text-accent-sun" href={buildWhatsAppUrl("Hello BF Suma, I need assistance.", SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
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
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Why BF Suma</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-100/85">
            <li>Premium, mobile-first product browsing</li>
            <li>Transparent pricing and checkout totals</li>
            <li>Direct ecommerce checkout with optional WhatsApp assistance</li>
          </ul>
        </div>
      </PageContainer>

      <PageContainer className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-100/80 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} BF Suma. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="inline-flex items-center rounded-md border border-white/25 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/90 transition hover:border-accent-sun/60 hover:text-accent-sun"
            href="/shop"
          >
            Shop Catalog
          </Link>
          <Link
            className="inline-flex items-center rounded-md border border-white/25 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/90 transition hover:border-accent-sun/60 hover:text-accent-sun"
            href="/contact"
          >
            Contact Support
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}
