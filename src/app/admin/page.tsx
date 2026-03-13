import { Card, SectionHeader } from "@/components/ui";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard"
        description="KPI summary, recent orders, and low-stock indicators will be implemented in Phase 4."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>Revenue KPI placeholder</Card>
        <Card>Orders KPI placeholder</Card>
        <Card>Low stock KPI placeholder</Card>
      </div>
    </div>
  );
}
