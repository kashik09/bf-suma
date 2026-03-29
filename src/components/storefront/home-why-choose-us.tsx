import { Clock3, FlaskConical, Headset, ShieldCheck, Truck, Wallet } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

const trustPoints = [
  {
    title: "Quality-focused selection",
    description: "Products are curated for practical daily use, not random catalog noise.",
    icon: ShieldCheck
  },
  {
    title: "Clear product information",
    description: "Pricing, product names, and availability are presented in a straightforward way.",
    icon: FlaskConical
  },
  {
    title: "Fast local fulfillment",
    description: "Delivery and pickup options are designed for local reliability.",
    icon: Truck
  },
  {
    title: "Easy payment flow",
    description: "Pay-on-delivery keeps checkout simple and low-friction for first-time buyers.",
    icon: Wallet
  },
  {
    title: "Responsive support",
    description: "WhatsApp and contact channels make help easy to reach when you need it.",
    icon: Headset
  },
  {
    title: "Time-saving ordering",
    description: "Category-first browsing helps customers find relevant products quickly.",
    icon: Clock3
  }
];

export function HomeWhyChooseUs() {
  return (
    <section className="space-y-4 sm:space-y-5">
      <SectionHeader
        title="Why Customers Choose BF Suma"
        description="A practical local experience built around trust, clarity, and support."
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {trustPoints.map((point) => {
          const Icon = point.icon;

          return (
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft ring-1 ring-slate-100" key={point.title}>
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
