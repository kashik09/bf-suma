import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductDetail, RelatedProducts } from "@/components/storefront";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { getPdfProductContentForCatalogSlug } from "@/lib/catalog/pdf-catalog-content";
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

  const relatedProducts = await listRelatedProducts(product, 3);
  const pdfContent = getPdfProductContentForCatalogSlug(product.slug);

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category_name, href: `/category/${product.category_slug}` },
          { label: product.name }
        ]}
      />

      {!health.commerceReady ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {getCommerceDegradedMessage(health)}
        </div>
      ) : null}

      <ProductDetail
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
        pdfContent={pdfContent}
        product={product}
      />
      <RelatedProducts products={relatedProducts} />
    </PageContainer>
  );
}
