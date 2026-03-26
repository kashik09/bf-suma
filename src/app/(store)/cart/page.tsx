import { PageContainer } from "@/components/layout/page-container";
import { CartPanel } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getStorefrontCatalogHealth } from "@/services/products";

export default async function CartPage() {
  const health = await getStorefrontCatalogHealth();

  return (
    <PageContainer className="space-y-6 py-10">
      <SectionHeader
        title="Your Cart"
        description="Review quantities, check subtotal, and continue to checkout when ready."
      />
      <CartPanel
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
      />
    </PageContainer>
  );
}
