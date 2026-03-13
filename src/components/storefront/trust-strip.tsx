import { PageContainer } from "@/components/layout/page-container";
import { TRUST_STRIP_ITEMS } from "@/lib/constants";

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <PageContainer className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_STRIP_ITEMS.map((item) => (
          <p className="rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-slate-700" key={item}>
            {item}
          </p>
        ))}
      </PageContainer>
    </section>
  );
}
