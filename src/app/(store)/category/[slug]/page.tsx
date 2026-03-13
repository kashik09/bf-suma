import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductGrid } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getStorefrontCategoryBySlug, listStorefrontProducts } from "@/services/products";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getStorefrontCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const products = await listStorefrontProducts({
    categorySlug: params.slug,
    sort: "featured"
  });

  return (
    <PageContainer className="space-y-6 py-10">
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
        <SectionHeader title={category.name} description={category.description} />
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
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
