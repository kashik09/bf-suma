import { Card, LoadingState, SectionHeader } from "@/components/ui";

export default function AdminReviewsLoadingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Product Reviews" description="Loading product reviews." />
      <Card>
        <LoadingState label="Loading product reviews..." />
      </Card>
    </div>
  );
}
