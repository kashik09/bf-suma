import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductDetail, RelatedProducts } from "@/components/storefront";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import { getStorefrontCatalogHealth, getStorefrontProductBySlug, listRelatedProducts } from "@/services/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, health] = await Promise.all([
    getStorefrontProductBySlug(slug),
    getStorefrontCatalogHealth()
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await listRelatedProducts(product, 4);

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      {!health.commerceReady ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {getCommerceDegradedMessage(health)}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-sky-50/70 to-brand-50/40 p-4 shadow-soft sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{product.category_name}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Product Details</h2>
      </section>

      <ProductDetail
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
        product={product}
      />
      <RelatedProducts products={relatedProducts} />
    </PageContainer>
  );
}
