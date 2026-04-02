import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontProduct } from "@/types";

export function ProductGrid({ products, emptyTitle, emptyDescription }: {
  products: StorefrontProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || "No products found"}
        description={emptyDescription || "Try changing your filters or check another category."}
      />
    );
  }

  return (
    <section className="space-y-3">
      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{products.length}</span> products
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
