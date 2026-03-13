import { Card, SectionHeader } from "@/components/ui";

export default function AdminDriverDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <SectionHeader title={`Driver ${params.id}`} description="Driver detail and assigned deliveries scaffold." />
      <Card>Driver detail placeholder</Card>
    </div>
  );
}
