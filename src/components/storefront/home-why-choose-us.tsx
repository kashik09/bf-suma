import { Clock3, FlaskConical, Headset, ShieldCheck, Truck, Wallet } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const trustPoints = [
  {
    title: "Premium without noise",
    description: "A focused, mobile-first storefront that removes clutter and repetitive sales blocks.",
    icon: ShieldCheck
  },
  {
    title: "Clear product decisioning",
    description: "Each listing is written for scanning: what it helps with, key details, and exact pricing.",
    icon: FlaskConical
  },
  {
    title: "Consistent structure",
    description: "Homepage, product pages, and checkout follow one clear conversion flow from trust to action.",
    icon: Truck
  },
  {
    title: "Checkout-first funnel",
    description: "Direct ecommerce checkout is primary, with optional support so sales can scale beyond chat.",
    icon: Wallet
  },
  {
    title: "Human support on demand",
    description: "WhatsApp stays available for uncertainty, but users can complete purchases independently.",
    icon: Headset
  },
  {
    title: "Faster time to checkout",
    description: "Reduced cognitive load and cleaner hierarchy help users move from browse to buy faster.",
    icon: Clock3
  }
];

export function HomeWhyChooseUs() {
  return (
    <section className="space-y-4 sm:space-y-5">
      <SectionHeader
        title="Why This Store Converts Better"
        description="Designed to outperform common BF Suma weaknesses: clutter, weak trust, and WhatsApp-only funnels."
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {trustPoints.map((point) => {
          const Icon = point.icon;

          return (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-card" key={point.title}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{point.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
