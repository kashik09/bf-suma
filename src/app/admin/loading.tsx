import { Card, LoadingState, SectionHeader } from "@/components/ui";

export default function AdminLoadingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin"
        description="Loading the admin workspace."
      />
      <Card>
        <LoadingState label="Loading admin data..." />
      </Card>
    </div>
  );
}
