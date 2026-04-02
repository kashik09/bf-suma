import { PageContainer } from "@/components/layout/page-container";
import { CheckoutForm } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getStorefrontCatalogHealth } from "@/services/products";

export default async function CheckoutPage() {
  const health = await getStorefrontCatalogHealth();

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <section className="rounded-2xl border border-slate-200 bg-logo-spectrum-soft p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Checkout"
          description="Finalize your order with transparent totals, simple delivery details, and no forced account sign-up."
        />
      </section>
      <CheckoutForm
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
      />
    </PageContainer>
  );
}
