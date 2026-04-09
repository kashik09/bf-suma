import { Card, LoadingState, SectionHeader } from "@/components/ui";

export default function AdminBlogLoadingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Blog Posts" description="Loading blog posts." />
      <Card>
        <LoadingState label="Loading blog posts..." />
      </Card>
    </div>
  );
}
