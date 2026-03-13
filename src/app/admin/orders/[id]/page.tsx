import { Card, SectionHeader } from "@/components/ui";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <SectionHeader title={`Order ${params.id}`} description="Order detail and status workflow scaffold." />
      <Card>Order detail placeholder</Card>
    </div>
  );
}
