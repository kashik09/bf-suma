import { PageContainer } from "@/components/layout/page-container";
import { TRUST_STRIP_ITEMS } from "@/lib/constants";

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-r from-white via-sky-50/60 to-brand-50/40">
      <PageContainer className="grid gap-2 py-3.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        {TRUST_STRIP_ITEMS.map((item) => (
          <p
            className="rounded-md border border-slate-200/80 bg-white/95 px-3 py-2 text-center text-xs font-semibold tracking-wide text-slate-700 shadow-soft sm:text-sm"
            key={item}
          >
            {item}
          </p>
        ))}
      </PageContainer>
    </section>
  );
}
