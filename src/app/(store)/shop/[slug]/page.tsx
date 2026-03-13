import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductDetail, RelatedProducts } from "@/components/storefront";
import { getStorefrontProductBySlug, listRelatedProducts } from "@/services/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await listRelatedProducts(product, 4);

  return (
    <PageContainer className="space-y-8 py-10">
      <ProductDetail product={product} />
      <RelatedProducts products={relatedProducts} />
    </PageContainer>
  );
}
