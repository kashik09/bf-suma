import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function HomeFinalCta() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-card sm:p-8">
      <div className="max-w-3xl space-y-2.5 sm:space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">Ready to order?</p>
        <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
          Start your wellness restock with clear choices and dependable local support.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-200">
          Browse the catalog now, or talk to us directly on WhatsApp for quick product guidance before checkout.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5 sm:gap-3">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-card"
          href="/shop"
        >
          Shop Products
        </Link>
        <a
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          href={buildWhatsAppUrl("Hello BF Suma, I want to place an order.", SUPPORT_WHATSAPP_PHONE)}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle className="mr-1 h-4 w-4" />
          WhatsApp Us
        </a>
      </div>
    </section>
  );
}
