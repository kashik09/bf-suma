import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/ui/loading-state";

export default function ShopLoading() {
  return (
    <PageContainer className="py-10 sm:py-12">
      <LoadingState label="Loading products..." />
    </PageContainer>
  );
}
