import Link from "next/link";
import { MessageCircle } from "lucide-react";

// Revalidate every 60 seconds for fast subsequent loads
export const revalidate = 60;
import { FeaturedInsight, MiniArticle, StoryBlock, WeeklyFeed } from "@/components/content";
import { PageContainer } from "@/components/layout/page-container";
import {
  Hero,
  HomeFeaturedProducts,
  HomeFinalCta,
  HomeHealthInterests,
  NewsletterSignup
} from "@/components/storefront";
import { getPdfHomepageContent } from "@/lib/catalog/pdf-catalog-content";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { listFeaturedCategories, listFeaturedProducts } from "@/services/products";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    listFeaturedCategories(4),
    listFeaturedProducts(6)
  ]);
  const pdfHomepage = getPdfHomepageContent();

  return (
    <>
      <Hero
        heroHeadline={pdfHomepage.heroHeadline}
        heroSupportingText={pdfHomepage.heroSupportingText}
      />

      <PageContainer className="space-y-10 py-10 sm:space-y-12 md:space-y-14 md:py-12 lg:py-14">
        <FeaturedInsight />

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Shop with Confidence</p>
            <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">Clear product info and a direct path to checkout</h2>
            <p className="text-sm leading-relaxed text-slate-600">Explore products with concise guidance, transparent pricing, and support available when needed.</p>
          </div>

          <ul className="grid gap-2 text-sm text-slate-700 md:grid-cols-3">
            {pdfHomepage.trustItems.slice(0, 3).map((item) => (
              <li className="rounded-lg border border-slate-200 bg-slate-50/70 p-3" key={item}>{item}</li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/shop"
            >
              Explore Products
            </Link>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
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

        <HomeHealthInterests categories={categories} />
        <HomeFeaturedProducts products={products} />

        <MiniArticle />

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 sm:p-5">
          <NewsletterSignup
            className="border-0 bg-transparent p-0 shadow-none"
            compact
            context="homepage_bridge"
            ctaLabel="Get Weekly Insights"
            description="Simple product insights and practical offers you can use each week."
            source="homepage"
            title="Get insights like this weekly"
          />
          <a
            className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
            href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("homepage_newsletter_bridge"), SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="mr-1.5 h-4 w-4" />
            Prefer WhatsApp Updates
          </a>
        </section>

        <StoryBlock />
        <HomeFinalCta />
      </PageContainer>
    </>
  );
}
