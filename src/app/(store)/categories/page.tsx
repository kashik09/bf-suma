import { PageContainer } from "@/components/layout/page-container";
import { CategoriesGrid } from "@/components/storefront/categories-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { buildStorefrontMetadata } from "@/lib/seo";
import { listStorefrontCategories } from "@/services/products";

export const dynamic = "force-dynamic";

export const metadata = buildStorefrontMetadata({
  title: "BF Suma Product Categories Uganda | Browse by Health Goal",
  description:
    "Explore BF Suma Uganda product categories: Immune Boosters, Digestive Health, Cardiovascular, Skincare, Men's & Women's Health. Find the right supplement for your goal.",
  path: "/categories"
});

export default async function CategoriesPage() {
  const categories = await listStorefrontCategories();

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <section className="rounded-2xl border border-brand-200/60 bg-brand-50/50 p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Browse by Category"
          description="Find products for your health goals"
        />
      </section>

      <CategoriesGrid categories={categories} />
    </PageContainer>
  );
}
