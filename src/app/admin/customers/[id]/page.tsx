import { Card, SectionHeader } from "@/components/ui";

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <SectionHeader title={`Customer ${params.id}`} description="Customer profile and order history scaffold." />
      <Card>Customer detail placeholder</Card>
    </div>
  );
}
