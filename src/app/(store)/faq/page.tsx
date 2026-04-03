import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listPdfFaqEntries } from "@/lib/catalog/pdf-catalog-content";

export default function FaqPage() {
  const faqEntries = listPdfFaqEntries();

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <section className="rounded-2xl border border-slate-200 bg-logo-spectrum-warm p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="FAQ"
          description="Answers below provide practical product-use guidance. Always follow package labeling and professional advice where needed."
        />
      </section>

      <div className="grid gap-4">
        {faqEntries.map((entry) => (
          <Card className="space-y-2 rounded-2xl p-5" key={entry.question}>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{entry.question}</h2>
            <p className="text-sm leading-relaxed text-slate-700">{entry.answer}</p>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
