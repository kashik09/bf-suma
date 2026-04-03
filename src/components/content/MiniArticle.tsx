import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dynamicContent } from "@/lib/content/dynamic-content";

function clampWords(input: string, maxWords: number) {
  const words = input.trim().split(/\s+/);
  if (words.length <= maxWords) return input;
  return words.slice(0, maxWords).join(" ") + "...";
}

export function MiniArticle() {
  const { title, body, cta } = dynamicContent.miniArticle;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Mini Guide</p>
      <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">{clampWords(body, 200)}</p>
      <Link
        className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        href={cta.href}
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
