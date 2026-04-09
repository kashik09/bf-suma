import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/ui/loading-state";

export default function ProductLoading() {
  return (
    <PageContainer className="min-h-[60vh] py-10 sm:py-12">
      <div className="flex min-h-[40vh] items-center">
        <LoadingState label="Loading product details..." />
      </div>
    </PageContainer>
  );
}
