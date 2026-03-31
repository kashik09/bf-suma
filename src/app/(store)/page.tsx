import { PageContainer } from "@/components/layout/page-container";
import {
  Hero,
  HomeConfidenceSection,
  HomeFeaturedProducts,
  HomeFinalCta,
  HomeHealthInterests,
  HomeStory,
  HomeWhyChooseUs,
  TrustStrip
} from "@/components/storefront";
import { listFeaturedCategories, listFeaturedProducts } from "@/services/products";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    listFeaturedCategories(4),
    listFeaturedProducts(6)
  ]);

  return (
    <>
      <Hero />
      <TrustStrip />

      <PageContainer className="space-y-10 py-10 sm:space-y-12 md:space-y-14 md:py-12 lg:py-14">
        <HomeConfidenceSection />
        <HomeStory />
        <HomeFeaturedProducts products={products} />
        <HomeHealthInterests categories={categories} />
        <HomeWhyChooseUs />
        <HomeFinalCta />
      </PageContainer>
    </>
  );
}
