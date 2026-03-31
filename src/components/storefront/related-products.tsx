import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeader } from "@/components/ui/section-header";
import type { StorefrontProduct } from "@/types";

export function RelatedProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
      <SectionHeader
        title="Complete Your Routine"
        description="A short list of relevant options to reduce decision overload."
      />
      <ProductGrid
        emptyDescription="No related products available yet."
        emptyTitle="No related products"
        products={products}
      />
    </section>
  );
}
