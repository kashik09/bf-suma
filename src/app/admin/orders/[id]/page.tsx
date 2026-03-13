import { Card, SectionHeader } from "@/components/ui";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeader title={`Order ${id}`} description="Order detail and status workflow scaffold." />
      <Card>Order detail placeholder</Card>
    </div>
  );
}
