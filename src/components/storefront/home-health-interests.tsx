import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { StorefrontCategory } from "@/types";

const categoryBenefitBySlug: Record<string, string> = {
  supplements: "Daily wellness essentials",
  beverages: "Natural energy and focus support",
  "womens-health": "Balanced support for women",
  "mens-health": "Strength and vitality support",
  "brain-health": "Support clarity and memory",
  skincare: "Healthy skin support essentials",
  "anti-aging": "Healthy aging support",
  "joint-health": "Comfort and mobility support",
  "bone-health": "Bone and joint support",
  "digestive-health": "Gentle digestive support",
  detox: "Everyday detox support"
};

function resolveCategoryBenefit(category: StorefrontCategory) {
  const mapped = categoryBenefitBySlug[category.slug];
  if (mapped) return mapped;
  return "Targeted wellness support";
}

export function HomeHealthInterests({ categories }: { categories: StorefrontCategory[] }) {
  const items = categories.slice(0, 6);

  return (
    <section className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Shop by Your Health Interest"
        description="Choose your focus area and quickly explore products matched to your daily wellness goals."
        action={(
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/shop">
            View all categories
          </Link>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((category) => (
          <Link
            className="group relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-soft ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-card hover:ring-brand-100"
            href={`/category/${category.slug}`}
            key={category.id}
          >
            <div
              className="h-64 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${category.image_url})` }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/45 to-slate-900/10 transition duration-300 group-hover:from-slate-950/95 group-hover:via-slate-900/60" />

            <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-100/90">
                Health Category
              </p>
              <h3 className="mt-1 text-lg font-semibold leading-tight text-white">{category.name}</h3>
              <p className="mt-1 line-clamp-1 text-sm text-slate-100/90">{resolveCategoryBenefit(category)}</p>

              <span className="mt-3 inline-flex h-10 w-fit items-center justify-center gap-1 rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-soft transition group-hover:bg-brand-50">
                Explore
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
