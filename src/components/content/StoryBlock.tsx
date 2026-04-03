import { dynamicContent } from "@/lib/content/dynamic-content";

export function StoryBlock() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-card sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">Customer Story</p>
      <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">{dynamicContent.story.text}</p>
    </section>
  );
}
