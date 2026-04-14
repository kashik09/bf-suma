"use client";

export default function StorefrontError({
  error,
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
          {error.message || "Please refresh and try again."}
        </p>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-rose-700 px-4 text-sm font-semibold text-white transition hover:bg-rose-800"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
