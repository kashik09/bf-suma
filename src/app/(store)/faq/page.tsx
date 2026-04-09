import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { SectionHeader } from "@/components/ui/section-header";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { listPdfFaqEntries } from "@/lib/catalog/pdf-catalog-content";
import { buildStorefrontMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = buildStorefrontMetadata({
  title: "Frequently Asked Questions",
  description:
    "Get quick answers about BF Suma products, delivery, payment, and support. Resolve common questions fast before placing your next order.",
  path: "/faq"
});

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const additionalFaqs: FaqItem[] = [
  // Products
  {
    question: "What types of products does BF Suma offer?",
    answer: "BF Suma offers a wide range of wellness products including supplements, skincare, beverages, and personal care items. Our product categories include immune boosters, anti-aging formulas, digestive health, joint care, and more.",
    category: "Products"
  },
  {
    question: "Are BF Suma products natural?",
    answer: "Many of our products feature natural ingredients sourced for quality and efficacy. Each product page lists the key ingredients so you can make informed decisions about what you're putting in your body.",
    category: "Products"
  },
  {
    question: "How do I know which product is right for me?",
    answer: "We recommend starting with your primary wellness goal - whether it's energy, immunity, skincare, or general health. Browse products by category or use our search to find products targeting your specific needs. For personalized guidance, contact us via WhatsApp.",
    category: "Products"
  },
  // Orders & Shipping
  {
    question: "How do I place an order?",
    answer: "Browse our shop, add products to your cart, and proceed to checkout. You can also order directly via WhatsApp for a more personalized experience. We'll confirm your order and provide payment details.",
    category: "Orders"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept mobile money (MTN, Airtel), bank transfers, and cash on delivery for select areas. Payment details are provided at checkout or via WhatsApp when you place an order.",
    category: "Orders"
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery within Kampala typically takes 1-2 business days. Upcountry deliveries may take 3-5 business days depending on location. You'll receive tracking information once your order ships.",
    category: "Orders"
  },
  {
    question: "Do you deliver outside Uganda?",
    answer: "Currently, we primarily serve customers within Uganda. For international inquiries, please contact us via WhatsApp and we'll do our best to assist you.",
    category: "Orders"
  },
  // Usage & Safety
  {
    question: "How should I store BF Suma products?",
    answer: "Most products should be stored in a cool, dry place away from direct sunlight. Check individual product labels for specific storage instructions. Keep all products out of reach of children.",
    category: "Usage"
  },
  {
    question: "Can I take multiple supplements together?",
    answer: "While many of our products can be used together, we recommend introducing one new product at a time to observe how your body responds. For specific combinations, consult with a healthcare professional.",
    category: "Usage"
  },
  {
    question: "What if I experience side effects?",
    answer: "Discontinue use immediately and consult a healthcare professional. While our products are generally well-tolerated, individual reactions can vary. Always follow recommended dosages.",
    category: "Usage"
  },
  // Returns & Support
  {
    question: "What is your return policy?",
    answer: "We accept returns of unopened products within 7 days of delivery. Products must be in original packaging. Contact us via WhatsApp or email to initiate a return. See our full refund policy for details.",
    category: "Support"
  },
  {
    question: "How can I contact customer support?",
    answer: "The fastest way to reach us is via WhatsApp. You can also email us or use the contact form on our website. We typically respond within 24 hours during business days.",
    category: "Support"
  }
];

const categoryColors: Record<string, string> = {
  Products: "bg-brand-100 text-brand-800",
  Orders: "bg-sky-100 text-sky-800",
  Usage: "bg-amber-100 text-amber-800",
  Support: "bg-pink-100 text-pink-800",
  General: "bg-slate-100 text-slate-800"
};

export default function FaqPage() {
  const pdfFaqEntries = listPdfFaqEntries();

  // Combine PDF FAQs (as General) with additional FAQs
  const allFaqs: FaqItem[] = [
    ...pdfFaqEntries.map((entry) => ({
      question: entry.question,
      answer: entry.answer,
      category: "General"
    })),
    ...additionalFaqs
  ];

  // Group by category
  const categories = ["General", "Products", "Orders", "Usage", "Support"];
  const faqsByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = allFaqs.filter((faq) => faq.category === category);
      return acc;
    },
    {} as Record<string, FaqItem[]>
  );

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">Frequently asked questions</h1>
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "FAQ" }
        ]}
      />

      <section className="rounded-2xl border border-orange-200/60 bg-logo-spectrum-orange p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Frequently Asked Questions"
          description="Find answers to common questions about our products, ordering, and wellness guidance."
        />
      </section>

      <div className="space-y-8">
        {categories.map((category) => {
          const faqs = faqsByCategory[category];
          if (faqs.length === 0) return null;

          return (
            <section className="space-y-3" key={category}>
              <h2 className="text-lg font-semibold text-slate-900">{category}</h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <details
                    className="group rounded-xl border border-slate-200 bg-white shadow-soft"
                    key={faq.question}
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 text-left font-medium text-slate-900 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <span>{faq.question}</span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-slate-100 px-4 py-3">
                      <p className="text-sm leading-relaxed text-slate-700">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Still have questions?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Can't find what you're looking for? Reach out to our support team.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/contact"
          >
            Contact Us
          </Link>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
            href={buildWhatsAppUrl("Hello, I have a question about BF Suma products.", SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp Support
          </a>
        </div>
      </section>
    </PageContainer>
  );
}
