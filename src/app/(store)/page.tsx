import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { FeaturedInsight, MiniArticle, StoryBlock, WeeklyFeed } from "@/components/content";
import { PageContainer } from "@/components/layout/page-container";
import { Hero, HomeFeaturedProducts, HomeHealthInterests, NewsletterSignup } from "@/components/storefront/client";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildOrganizationJsonLd, buildStorefrontMetadata } from "@/lib/seo";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { getStorefrontCustomerCount } from "@/services/customers";
import { listFeaturedCategories, listFeaturedProducts } from "@/services/products";

// Revalidate every 60 seconds for fast subsequent loads
export const revalidate = 60;

export const metadata = buildStorefrontMetadata({
  title: "Premium Wellness Store",
  description:
    "Shop trusted wellness essentials with clear pricing, fast support, and mobile-first checkout. Discover products designed for daily vitality and confidence.",
  path: "/"
});

export default async function HomePage() {
  const [categories, products, customerCount] = await Promise.all([
    listFeaturedCategories(8),
    listFeaturedProducts(6),
    getStorefrontCustomerCount()
  ]);
  const organizationJsonLd = buildOrganizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />

      <PageContainer className="space-y-10 py-10 sm:space-y-12 md:space-y-14 md:py-12 lg:py-14">
        <HomeHealthInterests categories={categories} />
        <HomeFeaturedProducts products={products} />

        <FeaturedInsight />

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Shop with Confidence</p>
            <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">Clear product info and a direct path to checkout</h2>
            <p className="text-sm leading-relaxed text-slate-600">Explore products with concise guidance, transparent pricing, and support available when needed.</p>
            {typeof customerCount === "number" && customerCount > 0 ? (
              <p className="text-sm font-semibold text-slate-800">
                Trusted by {customerCount.toLocaleString("en-UG")} customers
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/shop"
            >
              Explore Products
            </Link>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-5 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
              href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("homepage_cta"), SUPPORT_WHATSAPP_PHONE)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              WhatsApp Guidance
            </a>
          </div>
        </section>
        <WeeklyFeed />
        <MiniArticle />
      </PageContainer>
    </>
  );
}
