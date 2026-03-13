import { ContactForm } from "@/components/storefront";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function ContactPage() {
  return (
    <PageContainer className="space-y-6 py-10">
      <SectionHeader
        title="Contact"
        description="Reach support through the form, phone, email, or direct WhatsApp."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ContactForm />

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Direct Support</h2>
          <p className="text-sm text-slate-600">For urgent restock checks, WhatsApp gives the fastest response.</p>
          <a className="text-sm font-medium text-brand-700" href={buildWhatsAppUrl("Hello BF Suma, I need support.", SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
            WhatsApp Us
          </a>
          <a className="block text-sm text-slate-700" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          <a className="block text-sm text-slate-700" href={`tel:${SUPPORT_PHONE}`}>
            {SUPPORT_PHONE}
          </a>
        </Card>
      </div>
    </PageContainer>
  );
}
