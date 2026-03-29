import Link from "next/link";
import { CheckCircle2, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const heroHighlights = [
  "Clearly labeled products and prices",
  "Local support before and after order",
  "Simple checkout with pay-on-delivery option"
];

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-slate-200 bg-gradient-to-br from-brand-50 via-white to-slate-100">
      <PageContainer className="grid gap-7 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-8 md:py-14">
        <div className="space-y-4 md:space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" />
            Local Health Essentials
          </p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Daily wellness products you trust, with support that stays close to home.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-700 md:text-base">
            BF Suma helps you find supplements and personal-care essentials faster, with transparent pricing,
            clear availability, and responsive support when you need guidance.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-card sm:h-12 sm:text-base"
              href="/shop"
            >
              Shop Now
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:h-12 sm:px-5 sm:text-base"
              href={buildWhatsAppUrl("Hello BF Suma, I'd like help choosing the right products.", SUPPORT_WHATSAPP_PHONE)}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp Support
            </Link>
          </div>

          <ul className="space-y-1.5">
            {heroHighlights.map((item) => (
              <li className="flex items-start gap-2 text-xs text-slate-700 sm:text-sm" key={item}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div
              className="h-56 w-full bg-cover bg-center sm:h-64 md:h-72"
              style={{ backgroundImage: "url('/catalog-images/joshoppers.com/youth-essence-facial-cream.webp')" }}
            />
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Curated for local needs</p>
              <p className="text-sm text-slate-700">
                From daily support formulas to targeted wellness options, each listing is easy to compare and order.
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Truck className="h-4 w-4 text-brand-600" />
                Delivery and Pickup
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Choose delivery or pickup and pay when your order reaches you.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MessageCircle className="h-4 w-4 text-brand-600" />
                Fast Human Support
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Ask questions on WhatsApp before you order and get practical guidance.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
