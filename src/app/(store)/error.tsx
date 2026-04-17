"use client";

import Link from "next/link";

export default function StorefrontError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <section className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <h1 className="text-xl font-semibold text-rose-900">We couldn't load this page.</h1>
        <p className="text-sm text-rose-800">
          Something went wrong. Please try again or contact support.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-rose-700 px-4 text-sm font-semibold text-white transition hover:bg-rose-800"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
            href="/"
          >
            Go to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
