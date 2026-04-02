import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StorefrontCategory } from "@/types";

export function CategoryGrid({ categories }: { categories: StorefrontCategory[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-sky-700 p-5 text-left shadow-soft sm:col-span-2 lg:col-span-1 lg:row-span-2"
        href="/shop"
      >
        <div className="relative z-10 flex h-full min-h-40 flex-col justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
              All categories
            </span>
            <h3 className="mt-3 text-xl font-bold leading-tight text-white">Find your wellness fit faster</h3>
            <p className="mt-2 text-sm text-white/85">Browse all categories and filter by availability, price, or goal.</p>
          </div>
          <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
            Browse all
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />
      </Link>

      {categories.map((category) => (
        <Link
          className="group relative overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          href={`/category/${category.slug}`}
          key={category.id}
        >
          <Card className="h-full overflow-hidden rounded-2xl p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100">
            <div
              className="h-36 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url(${category.image_url || "/catalog-images/placeholder.webp"})`
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent" />
            <div className="space-y-1.5 p-4">
              <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
              <p className="line-clamp-2 text-sm text-slate-600">{category.description}</p>
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Explore
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
