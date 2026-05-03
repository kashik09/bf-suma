import { Card, SectionHeader } from "@/components/ui";

export default function AdminPackagesLoading() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Packages" description="Loading packages..." />
      <Card className="animate-pulse">
        <div className="h-40 bg-slate-100 rounded" />
      </Card>
    </div>
  );
}
