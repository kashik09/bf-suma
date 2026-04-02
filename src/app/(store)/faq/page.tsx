import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listPdfComplianceFlags, listPdfFaqEntries } from "@/lib/catalog/pdf-catalog-content";

export default function FaqPage() {
  const faqEntries = listPdfFaqEntries();
  const complianceFlags = listPdfComplianceFlags();

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-sky-50/70 to-brand-50/40 p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="FAQ"
          description="Answers below are sourced from the PDF catalog and should be treated as product-label guidance, not medical advice."
        />
      </section>

      <div className="grid gap-4">
        {faqEntries.map((entry) => (
          <Card className="space-y-2 rounded-2xl p-5" key={entry.question}>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{entry.question}</h2>
            <p className="text-sm leading-relaxed text-slate-700">{entry.answer}</p>
            <p className="text-xs text-slate-500">Source: {entry.sourcePageRefs.join(", ")}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-amber-200 bg-amber-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-900">Manual Compliance Review Required</h3>
        <ul className="mt-2 space-y-1 text-sm text-amber-800">
          {complianceFlags.map((flag) => (
            <li key={flag}>• {flag}</li>
          ))}
        </ul>
      </Card>
    </PageContainer>
  );
}
