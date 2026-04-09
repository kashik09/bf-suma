import { Card, LoadingState, SectionHeader } from "@/components/ui";

export default function AdminProductsLoadingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Products" description="Loading products." />
      <Card>
        <LoadingState label="Loading products..." />
      </Card>
    </div>
  );
}
