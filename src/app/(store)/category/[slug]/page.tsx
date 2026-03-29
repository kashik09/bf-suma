import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductGrid } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import {
  getStorefrontCatalogHealth,
  getStorefrontCategoryBySlug,
  listStorefrontProducts
} from "@/services/products";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, health] = await Promise.all([
    getStorefrontCategoryBySlug(slug),
    getStorefrontCatalogHealth()
  ]);

  if (!category) {
    notFound();
  }

  const products = await listStorefrontProducts({
    categorySlug: slug,
    sort: "featured"
  });

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-sky-50/70 to-brand-50/40 p-5 shadow-soft sm:p-6">
        <SectionHeader title={category.name} description={category.description} />
        {!health.commerceReady ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {getCommerceDegradedMessage(health)}
          </div>
        ) : null}
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          href="/shop"
        >
          Back to Shop
        </Link>
      </div>

      <ProductGrid
        emptyDescription="No products are currently published in this category."
        emptyTitle="Category currently empty"
        products={products}
      />
    </PageContainer>
  );
}
