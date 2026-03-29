import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const confidenceBlocks = [
  {
    title: "Browse by need",
    description: "Start from health-interest categories and compare options quickly.",
    icon: ShoppingCart
  },
  {
    title: "Confirm with support",
    description: "Use WhatsApp if you need help before finalizing your order.",
    icon: MessageCircle
  },
  {
    title: "Receive with confidence",
    description: "Delivery/pickup flow stays clear, with payment handled at fulfillment.",
    icon: Truck
  }
];

export function HomeConfidenceSection() {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Confidence at every step</p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900">A cleaner buying flow from discovery to delivery.</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          We keep the experience simple so customers can act quickly: find relevant products, ask questions when needed,
          then place orders with clear follow-through.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {confidenceBlocks.map((block) => {
          const Icon = block.icon;

          return (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft ring-1 ring-slate-100" key={block.title}>
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{block.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{block.description}</p>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-brand-100/40 p-4 sm:p-5">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
          Need product guidance before checkout? Talk to support directly and get practical help choosing what fits your routine.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            href={buildWhatsAppUrl("Hello BF Suma, I need help choosing products.", SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            Talk on WhatsApp
          </a>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            href="/shop"
          >
            Continue Shopping
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
