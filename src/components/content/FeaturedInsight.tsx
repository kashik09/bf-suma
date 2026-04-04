import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dynamicContent } from "@/lib/content/dynamic-content";

export function FeaturedInsight() {
  const { text, cta } = dynamicContent.featuredInsight;

  return (
    <section className="rounded-2xl border border-brand-200/60 bg-brand-50/50 p-5 shadow-soft sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Featured Insight</p>
      <p className="mt-2 text-base leading-relaxed text-slate-800 sm:text-lg">{text}</p>
      <Link
        className="mt-4 inline-flex h-10 items-center gap-1 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        href={cta.href}
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
