import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductGrid } from "@/components/storefront";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { SectionHeader } from "@/components/ui/section-header";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import { buildStorefrontMetadata } from "@/lib/seo";
import {
  getStorefrontCatalogHealth,
  getStorefrontCategoryBySlug,
  listStorefrontProducts
} from "@/services/products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getStorefrontCategoryBySlug(slug);

  if (!category) {
    return buildStorefrontMetadata({
      title: "Category not found",
      description: "The requested category is unavailable. Browse all BF Suma wellness products in the full shop catalog.",
      path: "/shop"
    });
  }

  return buildStorefrontMetadata({
    title: `${category.name} Products`,
    description: category.description,
    path: `/category/${category.slug}`
  });
}

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
      <h1 className="sr-only">{category.name} products</h1>
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name }
        ]}
      />

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-logo-spectrum-cool p-5 shadow-soft sm:p-6">
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
