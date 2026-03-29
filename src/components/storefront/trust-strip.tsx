import { PageContainer } from "@/components/layout/page-container";
import { TRUST_STRIP_ITEMS } from "@/lib/constants";

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-slate-50/90">
      <PageContainer className="grid gap-2 py-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        {TRUST_STRIP_ITEMS.map((item) => (
          <p
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold tracking-wide text-slate-700 sm:text-sm"
            key={item}
          >
            {item}
          </p>
        ))}
      </PageContainer>
    </section>
  );
}
