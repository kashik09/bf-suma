"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Belt + suspenders: capture even if Next.js auto-captures via instrumentation
    Sentry.captureException(error, {
      tags: {
        scope: "storefront",
        boundary: "error.tsx"
      }
    });
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      <Image
        alt="BF Suma"
        className="mb-8"
        height={60}
        src="/bf-suma-logo.png"
        width={180}
        priority
      />

      <h1 className="text-2xl font-semibold text-slate-900">
        We&apos;re updating our catalog
      </h1>

      <p className="mt-3 max-w-md text-slate-600">
        Please try again in a moment. If the issue persists, our team is here to help.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          href="/contact"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
