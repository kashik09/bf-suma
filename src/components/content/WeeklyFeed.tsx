import Link from "next/link";
import { dynamicContent } from "@/lib/content/dynamic-content";

const typeLabel: Record<(typeof dynamicContent.weekly)[number]["type"], string> = {
  myth: "Myth Check",
  insight: "Insight",
  quick: "Quick Tip"
};

export function WeeklyFeed() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">This Week</p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">Fresh, practical wellness reads</h2>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible lg:grid-cols-4">
        {dynamicContent.weekly.map((item) => (
          <Link
            className="min-w-[250px] snap-start rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-brand-200 hover:shadow-card md:min-w-0"
            href={item.href}
            key={item.href + "-" + item.type + "-" + item.title}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">{typeLabel[item.type]}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
