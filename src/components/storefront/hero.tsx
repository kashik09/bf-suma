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
      <PageContainer className="grid gap-8 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" />
            Local Health Essentials
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Daily wellness products you can trust, delivered with local care.
          </h1>
          <p className="max-w-2xl text-sm text-slate-700 md:text-base">
            BF Suma helps you find supplements and personal-care essentials faster, with transparent pricing,
            clear availability, and responsive support when you need guidance.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-md bg-brand-600 px-5 text-base font-medium text-white transition hover:bg-brand-700"
              href="/shop"
            >
              Shop Now
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-md bg-slate-100 px-5 text-base font-medium text-slate-900 transition hover:bg-slate-200"
              href={buildWhatsAppUrl("Hello BF Suma, I'd like help choosing the right products.", SUPPORT_WHATSAPP_PHONE)}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp Support
            </Link>
          </div>

          <ul className="space-y-2">
            {heroHighlights.map((item) => (
              <li className="flex items-start gap-2 text-sm text-slate-700" key={item}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div
              className="h-72 w-full bg-cover bg-center"
              style={{ backgroundImage: "url('/catalog-images/joshoppers.com/youth-essence-facial-cream.webp')" }}
            />
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Curated for local needs</p>
              <p className="text-sm text-slate-700">
                From daily support formulas to targeted wellness options, each listing is easy to compare and order.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
