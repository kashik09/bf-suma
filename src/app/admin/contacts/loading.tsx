import { Card, LoadingState, SectionHeader } from "@/components/ui";

export default function AdminContactsLoadingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Contacts" description="Loading contacts." />
      <Card>
        <LoadingState label="Loading contacts..." />
      </Card>
    </div>
  );
}
