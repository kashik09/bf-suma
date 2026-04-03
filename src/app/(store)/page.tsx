import { PageContainer } from "@/components/layout/page-container";
import {
  Hero,
  HomeFeaturedProducts,
  HomeFinalCta,
  HomeHealthInterests
} from "@/components/storefront";
import { getPdfHomepageContent } from "@/lib/catalog/pdf-catalog-content";
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
        </section>

        <HomeHealthInterests categories={categories} />
        <HomeFeaturedProducts products={products} />
        <HomeFinalCta />
      </PageContainer>
    </>
  );
}
