import { PageContainer } from "@/components/layout/page-container";
import { CheckoutForm } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontCatalogHealth } from "@/services/products";

export const metadata = buildStorefrontMetadata({
  title: "Secure Checkout",
  description:
    "Complete your BF Suma order with transparent totals, delivery options, and no forced account signup. Checkout stays simple on mobile and desktop.",
  path: "/checkout"
});

export default async function CheckoutPage() {
  const health = await getStorefrontCatalogHealth();

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">Checkout</h1>
      <section className="rounded-2xl border border-slate-200 bg-logo-spectrum-cool p-5 shadow-soft sm:p-6">
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
