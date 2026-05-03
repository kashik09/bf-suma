"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { PackageCard } from "@/components/storefront/package-card";
import type { PackageDisplayData } from "@/types";

interface HomeFeaturedPackagesProps {
  packages: PackageDisplayData[];
}

export function HomeFeaturedPackages({ packages }: HomeFeaturedPackagesProps) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" />
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Curated Bundles
            </p>
          </div>
          <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
            Health Packages
          </h2>
          <p className="text-sm text-slate-600">
            Save with bundled products designed for specific health goals.
          </p>
        </div>
        <Link
          className="hidden items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
          href="/packages"
        >
          View all packages
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} featured />
        ))}
      </div>

      <div className="flex justify-center sm:hidden">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          href="/packages"
        >
          View all packages
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
