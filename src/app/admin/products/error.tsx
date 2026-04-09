"use client";

import { Card, SectionHeader } from "@/components/ui";

export default function AdminProductsErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Products" description="We couldn't load products right now." />
      <Card className="border-rose-200 bg-rose-50">
        <p className="text-sm text-rose-800">Try again in a moment.</p>
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
