import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/ui/loading-state";

export default function CategoryLoading() {
  return (
    <PageContainer className="py-10">
      <LoadingState label="Loading category products..." />
    </PageContainer>
  );
}
