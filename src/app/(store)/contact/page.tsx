import { ContactForm } from "@/components/storefront/contact-form";
import { QuickContactCard } from "@/components/storefront/quick-contact-card";
import { buildStorefrontMetadata } from "@/lib/seo";

export const metadata = buildStorefrontMetadata({
  title: "Contact BF Suma Uganda | Kampala Wellness Store",
  description:
    "Reach BF Suma Uganda at Lloyds Mall, Kampala. MTN: +256 778 928 815, Airtel: +256 747 928 920. WhatsApp us for fast support and product guidance.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Get in touch</h1>
        <p className="mt-3 text-lg text-slate-600">
          Whether you have a quick question or a longer message, we&apos;re here to help.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left - Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Send us a message</h2>
          <ContactForm />
        </div>

        {/* Right - Quick contact */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick contact</h2>
          <QuickContactCard />
        </div>
      </div>
    </div>
  );
}
