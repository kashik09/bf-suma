import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-slate-200 bg-white">
      <PageContainer className="grid gap-8 py-12 md:grid-cols-2 md:items-center md:py-16">
        <div className="space-y-4">
          <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Trusted Everyday Essentials
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Clear pricing, reliable products, and support that responds fast.
          </h1>
          <p className="max-w-xl text-sm text-slate-600 md:text-base">
            BF Suma helps households and small businesses restock quality essentials without guesswork.
            Browse by category, confirm availability quickly, and place your order in minutes.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-md bg-brand-600 px-5 text-base font-medium text-white transition hover:bg-brand-700"
              href="/shop"
            >
              Shop Essentials
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-md bg-slate-100 px-5 text-base font-medium text-slate-900 transition hover:bg-slate-200"
              href="/contact"
            >
              Talk to Support
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-slate-100 p-6 shadow-soft">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Why customers choose BF Suma</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>Availability is explicit before checkout</li>
              <li>Fast local delivery with WhatsApp updates</li>
              <li>Simple support for product questions and bulk requests</li>
            </ul>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
