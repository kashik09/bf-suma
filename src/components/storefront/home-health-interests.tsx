import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { StorefrontCategory } from "@/types";

const categoryBenefitBySlug: Record<string, string> = {
  supplements: "Everyday support formulas for balanced wellness.",
  beverages: "Functional coffees and teas for energy and focus.",
  "womens-health": "Targeted support for daily women’s health needs.",
  "mens-health": "Performance and vitality support for men.",
  "brain-health": "Cognitive support options for clarity and memory.",
  skincare: "Daily skin care solutions for healthy-looking skin.",
  "anti-aging": "Wellness products focused on healthy aging.",
  "joint-health": "Mobility and comfort support for active routines.",
  "bone-health": "Mineral-rich support for stronger bones.",
  "digestive-health": "Digestive comfort and gut support essentials.",
  detox: "Daily detox-support options for cleaner routines."
};

function resolveCategoryBenefit(category: StorefrontCategory) {
  const mapped = categoryBenefitBySlug[category.slug];
  if (mapped) return mapped;
  return category.description;
}

export function HomeHealthInterests({ categories }: { categories: StorefrontCategory[] }) {
  const items = categories.slice(0, 6);

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Your Health Interests"
        description="Start with the area you care about most, then discover products matched to that goal."
        action={(
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/shop">
            Browse all products
          </Link>
        )}
      />

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {items.map((category) => (
          <Link
            className="group min-w-[260px] snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            href={`/category/${category.slug}`}
            key={category.id}
          >
            <div
              className="h-32 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${category.image_url})` }}
            />
            <div className="flex min-h-44 flex-col space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Category</p>
              <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
              <p className="text-sm text-slate-600">{resolveCategoryBenefit(category)}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Explore Category
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
