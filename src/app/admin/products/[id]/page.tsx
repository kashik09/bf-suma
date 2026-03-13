import { Card, SectionHeader } from "@/components/ui";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeader title={`Edit Product ${id}`} description="Product detail and edit scaffold." />
      <Card>Product edit form placeholder</Card>
    </div>
  );
}
