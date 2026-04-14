import { ContactForm } from "@/components/storefront/client";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SUPPORT_EMAIL, SUPPORT_PHONES, SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildStorefrontMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-static";

export const metadata = buildStorefrontMetadata({
  title: "Contact Support",
  description:
    "Contact BF Suma for product guidance, order help, and delivery questions. Reach us by form, phone, email, or quick WhatsApp support.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">Contact BF Suma support</h1>
      <section className="rounded-2xl border border-pink-200/60 bg-logo-spectrum-pink p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Contact"
          description="Reach support through the form, phone, email, or direct WhatsApp."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ContactForm />

        <Card className="space-y-3 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-slate-900">Direct Support</h2>
          <p className="text-sm text-slate-600">For urgent restock checks, WhatsApp gives the fastest response.</p>
          <a className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800" href={buildWhatsAppUrl("Hello BF Suma, I need support.", SUPPORT_WHATSAPP_PHONE)} rel="noreferrer" target="_blank">
            WhatsApp Us
          </a>
          <a className="block text-sm font-medium text-slate-700 hover:text-slate-900" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          {SUPPORT_PHONES.map((phone) => (
            <a className="block text-sm font-medium text-slate-700 hover:text-slate-900" href={`tel:${phone}`} key={phone}>
              {phone}
            </a>
          ))}
        </Card>
      </div>
    </PageContainer>
  );
}
