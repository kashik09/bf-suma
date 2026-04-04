import Link from "next/link";
import { ArrowRight, MessageCircle, Quote, ShieldCheck, Star } from "lucide-react";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const confidenceBlocks = [
  {
    title: "Trust-first product pages",
    description: "Each product highlights use-case fit, key actives, and practical buying details.",
    icon: ShieldCheck
  },
  {
    title: "Proof near decision points",
    description: "Social proof and reassurance blocks appear near CTAs, not hidden after long scroll.",
    icon: Star
  },
  {
    title: "Hybrid support funnel",
    description: "Buy directly through checkout, or switch to WhatsApp only when you need guidance.",
    icon: MessageCircle
  }
];

const testimonials = [
  {
    initials: "AK",
    location: "Kampala",
    quote: "I placed my order without back-and-forth chats. The product page answered most questions fast."
  },
  {
    initials: "TN",
    location: "Entebbe",
    quote: "The checkout was straightforward on mobile, and seeing delivery cost early built trust."
  },
  {
    initials: "MS",
    location: "Wakiso",
    quote: "I liked that WhatsApp support was available, but I could still complete everything directly on site."
  }
];

export function HomeConfidenceSection() {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Proof and Confidence</p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
          Built to feel credible before users commit.
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
          BF Suma shoppers decide quickly. This layout is designed to reduce uncertainty with proof systems, cleaner
          hierarchy, and a direct path to purchase.
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">Customer Feedback Snapshots</p>
          <p className="text-xs text-slate-500">Structured like verified local order feedback</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5" key={`${testimonial.initials}-${testimonial.location}`}>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <Quote className="h-3.5 w-3.5 text-brand-700" />
                {testimonial.initials} • {testimonial.location}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{testimonial.quote}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
          Need extra confidence before payment? Start checkout first, then tap WhatsApp for quick clarification without
          losing your cart flow.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("confidence_section"), SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            Ask on WhatsApp
          </a>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            href="/shop"
          >
            Continue to Shop
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
