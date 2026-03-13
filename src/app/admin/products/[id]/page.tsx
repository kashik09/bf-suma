import { Card, SectionHeader } from "@/components/ui";

export default function AdminProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <SectionHeader title={`Edit Product ${params.id}`} description="Product detail and edit scaffold." />
      <Card>Product edit form placeholder</Card>
    </div>
  );
}
