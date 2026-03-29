import { PageContainer } from "@/components/layout/page-container";
import { CartPanel } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getStorefrontCatalogHealth } from "@/services/products";

export default async function CartPage() {
  const health = await getStorefrontCatalogHealth();

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-sky-50/70 to-brand-50/40 p-5 shadow-soft sm:p-6">
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
