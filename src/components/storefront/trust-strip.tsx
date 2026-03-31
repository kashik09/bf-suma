import { Lock, MessageCircle, Receipt, Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { TRUST_STRIP_ITEMS } from "@/lib/constants";

const trustStripIcons = [Receipt, Lock, Truck, MessageCircle] as const;

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-r from-white via-sky-50/60 to-brand-50/40">
      <PageContainer className="grid gap-2.5 py-3.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        {TRUST_STRIP_ITEMS.map((item, index) => {
          const Icon = trustStripIcons[index];

          return (
            <p
              className="flex items-center gap-2 rounded-md border border-slate-200/80 bg-white/95 px-3 py-2 text-xs font-semibold tracking-wide text-slate-700 shadow-soft sm:text-sm"
              key={item}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>{item}</span>
            </p>
          );
        })}
      </PageContainer>
    </section>
  );
}
