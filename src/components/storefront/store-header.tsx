import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { STORE_NAV_LINKS, SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { StoreCartButton } from "@/components/storefront/store-cart-button";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="border-b border-slate-100 bg-slate-50 py-2 text-xs text-slate-600">
        <PageContainer className="flex items-center justify-between gap-4">
          <p className="line-clamp-1">Trusted essentials. Clear pricing. Fast local delivery.</p>
          <a
            className="shrink-0 font-medium text-brand-700"
            href={buildWhatsAppUrl("Hello BF Suma, I need help with my order.", SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp Support
          </a>
        </PageContainer>
      </div>

      <PageContainer className="flex h-16 items-center justify-between gap-5">
        <Link className="text-lg font-bold text-slate-900" href="/">
          BF Suma
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {STORE_NAV_LINKS.map((item) => (
            <Link className="hover:text-brand-700" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <StoreCartButton />
      </PageContainer>
    </header>
  );
}
