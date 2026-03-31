import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import {
  APP_DESCRIPTION,
  STORE_NAV_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_WHATSAPP_PHONE
} from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function StoreFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 py-12 text-slate-200">
      <PageContainer className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">BF Suma</h3>
          <p className="text-sm leading-relaxed text-slate-300">{APP_DESCRIPTION}</p>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            href={buildWhatsAppUrl("Hello BF Suma, I need product guidance.", SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp Support
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Explore</h4>
          <div className="mt-3 flex flex-col space-y-2 text-sm text-slate-300">
            {STORE_NAV_LINKS.map((item) => (
              <Link className="transition hover:text-white" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Support</h4>
          <div className="mt-3 flex flex-col space-y-2 text-sm text-slate-300">
            <Link className="transition hover:text-white" href="/contact">Contact Form</Link>
            <a className="transition hover:text-white" href={buildWhatsAppUrl("Hello BF Suma, I need assistance.", SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
              WhatsApp
            </a>
            <a className="transition hover:text-white" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <a className="transition hover:text-white" href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Why BF Suma</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Premium, mobile-first product browsing</li>
            <li>Transparent pricing and checkout totals</li>
            <li>Direct ecommerce checkout with optional WhatsApp assistance</li>
          </ul>
        </div>
      </PageContainer>
    </footer>
  );
}
