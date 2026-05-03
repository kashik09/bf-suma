"use client";

import { Card, SectionHeader } from "@/components/ui";

export default function AdminPackagesError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Packages" description="Something went wrong loading packages." />
      <Card className="border-rose-200 bg-rose-50">
        <p className="text-sm font-semibold text-rose-900">Error loading packages</p>
        <p className="mt-1 text-sm text-rose-800">{error.message}</p>
        <button
          onClick={reset}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Try again
        </button>
      </Card>
    </div>
  );
}
