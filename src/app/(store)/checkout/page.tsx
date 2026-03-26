import { PageContainer } from "@/components/layout/page-container";
import { CheckoutForm } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getStorefrontCatalogHealth } from "@/services/products";

export default async function CheckoutPage() {
  const health = await getStorefrontCatalogHealth();

  return (
    <PageContainer className="space-y-6 py-10">
      <SectionHeader
        title="Checkout"
        description="Order-intake flow for customer details and delivery instructions."
      />
      <CheckoutForm
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
      />
    </PageContainer>
  );
}
