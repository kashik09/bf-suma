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
    <footer className="mt-16 border-t border-slate-200 bg-white py-10">
      <PageContainer className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">BF Suma</h3>
          <p className="mt-2 text-sm text-slate-600">{APP_DESCRIPTION}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Explore</h4>
          <div className="mt-3 flex flex-col space-y-2 text-sm text-slate-600">
            {STORE_NAV_LINKS.map((item) => (
              <Link className="hover:text-brand-600" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="hover:text-brand-600" href="/faq">FAQ</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Support</h4>
          <div className="mt-3 flex flex-col space-y-2 text-sm text-slate-600">
            <Link className="hover:text-brand-600" href="/contact">Contact Form</Link>
            <a className="hover:text-brand-600" href={buildWhatsAppUrl("Hello BF Suma, I need assistance.", SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
              WhatsApp
            </a>
            <a className="hover:text-brand-600" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <a className="hover:text-brand-600" href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
