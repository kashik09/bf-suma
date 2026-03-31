import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBasket, Sparkles, Wallet } from "lucide-react";

const steps = [
  {
    title: "Pick your goal",
    description: "Start from a category or featured product that matches what you want to solve.",
    icon: Sparkles
  },
  {
    title: "Compare with confidence",
    description: "Review practical benefits, active ingredients, and transparent pricing before buying.",
    icon: ShoppingBasket
  },
  {
    title: "Checkout your way",
    description: "Place order directly or ask WhatsApp support for guidance, then pay on delivery or pickup.",
    icon: Wallet
  }
];

const proofBullets = [
  "Designed for scanning on mobile first, not dense reading.",
  "Every major page has one primary action and one clear fallback.",
  "Trust signals are placed near decisions, not buried in footers."
];

export function HomeStory() {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">How It Works</p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
          Simple journey: problem to product to delivery.
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">
          Most BF Suma stores force manual chats too early. This storefront keeps buying simple first, with support
          available when you want it.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4" key={step.title}>
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1.1fr_0.9fr] sm:p-5">
        <ul className="space-y-2">
          {proofBullets.map((point) => (
            <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-700" key={point}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <Link
          className="inline-flex h-10 items-center justify-center self-start rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          href="/shop"
        >
          Browse Featured Products
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
