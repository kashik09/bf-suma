"use client";

import { Card, SectionHeader } from "@/components/ui";

export default function AdminErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin"
        description="We couldn't load this admin section."
      />
      <Card className="border-rose-200 bg-rose-50">
        <p className="text-sm font-semibold text-rose-900">Something went wrong while loading this page.</p>
        <p className="mt-1 text-sm text-rose-800">Please try again.</p>
        <button
          className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </Card>
    </div>
  );
}
