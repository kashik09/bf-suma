import { PageContainer } from "@/components/layout/page-container";
import { CategoryGrid, Hero, ProductGrid, TrustStrip } from "@/components/storefront";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listFeaturedCategories, listFeaturedProducts } from "@/services/products";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    listFeaturedCategories(4),
    listFeaturedProducts(8)
  ]);

  return (
    <>
      <Hero />
      <TrustStrip />

      <PageContainer className="space-y-10 py-10">
        <section className="space-y-4">
          <SectionHeader
            title="Shop by Category"
            description="Straightforward category browsing so customers can find essentials quickly."
          />
          <CategoryGrid categories={categories} />
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Featured Products"
            description="Top moving essentials with clear stock visibility and simple checkout flow."
          />
          <ProductGrid products={products} />
        </section>

        <Card className="space-y-2 bg-brand-50">
          <h2 className="text-lg font-semibold text-slate-900">Need help choosing products?</h2>
          <p className="text-sm text-slate-700">
            Reach out directly on WhatsApp for quick recommendations, stock confirmation, or bulk order support.
          </p>
        </Card>
      </PageContainer>
    </>
  );
}
