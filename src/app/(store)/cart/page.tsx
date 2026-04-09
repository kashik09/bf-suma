import { PageContainer } from "@/components/layout/page-container";
import { CartPanel } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontCatalogHealth } from "@/services/products";

export const metadata = buildStorefrontMetadata({
  title: "Your Cart",
  description:
    "Review your BF Suma cart, adjust quantities, and see transparent totals before checkout. Keep your purchase fast, clear, and stress-free.",
  path: "/cart"
});

export default async function CartPage() {
  const health = await getStorefrontCatalogHealth().catch((error) => ({
    source: "fallback" as const,
    commerceReady: false,
    degradedReason: error instanceof Error ? error.message : "Cart services are temporarily unavailable."
  }));

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">Your cart</h1>
      <section className="rounded-2xl border border-slate-200 bg-logo-spectrum-warm p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Your Cart"
          description="Review quantities, confirm totals, and continue to checkout when ready."
        />
      </section>
      <CartPanel
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
      />
    </PageContainer>
  );
}
