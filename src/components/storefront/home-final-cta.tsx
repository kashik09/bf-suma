import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function HomeFinalCta() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-card sm:p-8">
      <div className="max-w-3xl space-y-2.5 sm:space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">Ready to buy with confidence?</p>
        <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
          Start with direct checkout. Use WhatsApp only if you need extra guidance.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-200">
          This store is optimized for a cleaner buying path: clear products, clear totals, and local support when you
          want it.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5 sm:gap-3">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-white px-5 text-sm font-semibold text-slate-900 shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-card"
          href="/shop"
        >
          Shop and Checkout
        </Link>
        <a
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-500 bg-transparent px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          href={buildWhatsAppUrl("Hello BF Suma, I want to place an order.", SUPPORT_WHATSAPP_PHONE)}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle className="mr-1 h-4 w-4" />
          Ask on WhatsApp
        </a>
      </div>
    </section>
  );
}
