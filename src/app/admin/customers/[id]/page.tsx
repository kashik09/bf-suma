import { Card, SectionHeader } from "@/components/ui";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeader title={`Customer ${id}`} description="Customer profile and order history scaffold." />
      <Card>Customer detail placeholder</Card>
    </div>
  );
}
