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
  const items = categories.slice(0, 4);

  return (
    <section className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Need Something Specific?"
        description="Choose one focus area and narrow options quickly to avoid decision overload."
        action={(
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/shop">
            View all categories
          </Link>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          className="group relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-sky-700 p-5 shadow-soft sm:col-span-2 lg:col-span-1 lg:row-span-2"
          href="/shop"
        >
          <div className="relative z-10 flex h-full min-h-44 flex-col justify-between">
            <div>
              <p className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                Start here
              </p>
              <h3 className="mt-3 text-xl font-bold leading-tight text-white">Not sure what to choose?</h3>
              <p className="mt-2 text-sm text-white/85">
                Browse all categories first, then narrow by availability and price in the shop view.
              </p>
            </div>
            <span className="mt-4 inline-flex h-10 w-fit items-center justify-center gap-1 rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-soft">
              Browse all
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />
        </Link>

        {items.map((category) => (
          <Link
            className="group relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-soft ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-card hover:ring-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            href={`/category/${category.slug}`}
            key={category.id}
          >
            <div className="h-56 w-full bg-[linear-gradient(145deg,_#0f172a_0%,_#1e293b_50%,_#334155_100%)] transition duration-300 sm:h-64" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/45 to-slate-900/10" />

            <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end p-4 sm:p-5">
              <h3 className="text-lg font-semibold leading-tight text-white">{category.name}</h3>
              <p className="mt-1 line-clamp-1 text-sm text-slate-100/90">{resolveCategoryBenefit(category)}</p>

              <span className="mt-3 inline-flex h-10 w-fit items-center justify-center gap-1 rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-soft transition group-hover:bg-brand-50">
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
