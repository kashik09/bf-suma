import Link from "next/link";
import { CheckCircle2, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const heroHighlights = [
  "Know what each product does in under 10 seconds",
  "See transparent pricing before checkout",
  "Choose direct checkout or WhatsApp guidance"
];

const trustSignals = [
  "No forced account sign-up at checkout",
  "Clear delivery or pickup flow",
  "Pay on delivery or pickup"
];

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_#e2f4f3,_transparent_58%),linear-gradient(160deg,_#ffffff_0%,_#f5fafb_42%,_#f3f7f9_100%)]">
      <PageContainer className="grid gap-8 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10 md:py-14 lg:py-16">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" />
            Premium Local Wellness Store
          </p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-[2.7rem]">
            Shop trusted wellness essentials without the WhatsApp chase.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
            BF Suma gives you a cleaner way to buy: clear product outcomes, credible details, and a direct checkout
            flow with optional human support when you need it.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-card sm:h-12 sm:px-6 sm:text-base"
              href="/shop"
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              Shop Now
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:h-12 sm:px-5 sm:text-base"
              href={buildWhatsAppUrl("Hello BF Suma, I'd like help choosing the right products.", SUPPORT_WHATSAPP_PHONE)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              WhatsApp Support
            </Link>
          </div>

          <ul className="space-y-1.5 sm:space-y-2">
            {heroHighlights.map((item) => (
              <li className="flex items-start gap-2 text-xs text-slate-700 sm:text-sm" key={item}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3.5 md:space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="h-56 w-full bg-[linear-gradient(145deg,_#f1f5f9_0%,_#e2e8f0_45%,_#cbd5e1_100%)] sm:h-64 md:h-72" />
            <div className="space-y-2 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Built for decision confidence</p>
              <p className="text-sm text-slate-700">
                Product pages are structured for fast scanning: problem fit, active ingredients, practical benefits, and
                next-step checkout.
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3.5">
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-soft">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Truck className="h-4 w-4 text-brand-600" />
                Delivery and Pickup
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Choose your preferred fulfillment and see costs clearly before placing your order.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-soft">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-brand-600" />
                Low-Friction Checkout
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Minimal form steps, no account wall, and support available if you want extra guidance.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Trust Signals</p>
            <ul className="mt-2 space-y-1.5">
              {trustSignals.map((signal) => (
                <li className="flex items-start gap-2 text-xs text-slate-700 sm:text-sm" key={signal}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
