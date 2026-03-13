import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProductDetail, RelatedProducts } from "@/components/storefront";
import { getStorefrontProductBySlug, listRelatedProducts } from "@/services/products";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getStorefrontProductBySlug(params.slug);

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
