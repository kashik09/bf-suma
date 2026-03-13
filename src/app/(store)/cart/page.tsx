import { PageContainer } from "@/components/layout/page-container";
import { CartPanel } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";

export default function CartPage() {
  return (
    <PageContainer className="space-y-6 py-10">
      <SectionHeader
        title="Your Cart"
        description="Review quantities, check subtotal, and continue to checkout when ready."
      />
      <CartPanel />
    </PageContainer>
  );
}
