import { Card, SectionHeader } from "@/components/ui";

export default async function AdminDriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeader title={`Driver ${id}`} description="Driver detail and assigned deliveries scaffold." />
      <Card>Driver detail placeholder</Card>
    </div>
  );
}
