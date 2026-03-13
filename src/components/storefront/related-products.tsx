import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeader } from "@/components/ui/section-header";
import type { StorefrontProduct } from "@/types";

export function RelatedProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Related Products" description="Other products customers often buy in this category." />
      <ProductGrid
        emptyDescription="No related products available yet."
        emptyTitle="No related products"
        products={products}
      />
    </section>
  );
}
