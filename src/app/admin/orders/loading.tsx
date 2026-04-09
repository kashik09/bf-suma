import { Card, LoadingState, SectionHeader } from "@/components/ui";

export default function AdminOrdersLoadingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Orders" description="Loading orders." />
      <Card>
        <LoadingState label="Loading orders..." />
      </Card>
    </div>
  );
}
