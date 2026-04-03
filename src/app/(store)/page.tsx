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
        heroSourcePageRefs={pdfHomepage.heroSourcePageRefs}
        heroSupportingText={pdfHomepage.heroSupportingText}
      />

      <PageContainer className="space-y-10 py-10 sm:space-y-12 md:space-y-14 md:py-12 lg:py-14">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">From BF Suma Catalogue</p>
            <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">Company and trust facts shown in source material</h2>
            <p className="text-sm leading-relaxed text-slate-600">Operational checkout rules remain unchanged. This section surfaces descriptive catalogue facts only.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Trust points</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {pdfHomepage.trustItems.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Company profile facts</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {pdfHomepage.companyFacts.slice(0, 4).map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </article>
          </div>

          {pdfHomepage.trustSourcePageRefs.length > 0 ? (
            <p className="text-xs text-slate-500">Source refs: {pdfHomepage.trustSourcePageRefs.join(", ")}</p>
          ) : null}
        </section>

        <HomeHealthInterests categories={categories} />
        <HomeFeaturedProducts products={products} />
        <HomeFinalCta />
      </PageContainer>
    </>
  );
}
