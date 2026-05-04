import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import { buildStorefrontMetadata } from "@/lib/seo";
import { listSetProducts } from "@/services/products";

export const dynamic = "force-dynamic";

export const metadata = buildStorefrontMetadata({
  title: "Curated Sets",
  description:
    "Shop BF Suma curated sets — multi-product bundles for complete care. One SKU, one stock count, multiple benefits. Perfect for skincare routines and wellness regimens.",
  path: "/sets"
});

export default async function SetsPage() {
  const sets = await listSetProducts();

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <h1 className="sr-only">Curated Sets</h1>

      <section className="rounded-2xl border border-brand-200/60 bg-gradient-to-br from-brand-50 to-emerald-50 p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Curated Sets"
          description="Multi-product bundles for complete care. One SKU, one stock count, multiple benefits."
        />
      </section>

      {sets.length > 0 ? (
        <section className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sets.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">No sets currently available</h2>
          <p className="mt-2 text-sm text-slate-600">
            Check back soon for curated product sets, or browse our full catalog.
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            href="/shop"
          >
            Browse Shop
          </Link>
        </section>
      )}
    </PageContainer>
  );
}
