import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";

export default function AboutPage() {
  return (
    <PageContainer className="space-y-6 py-10">
      <SectionHeader title="About BF Suma" description="Business story, sourcing confidence, and trust-first positioning." />
      <p className="text-sm text-slate-600">About page scaffold ready for final content blocks.</p>
    </PageContainer>
  );
}
