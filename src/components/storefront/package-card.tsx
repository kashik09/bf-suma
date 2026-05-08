"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { convertPrice, formatPrice } from "@/lib/currency";
import type { PackageDisplayData } from "@/types";

const PLACEHOLDER_IMAGE = "/catalog-images/placeholder.svg";

interface PackageCardProps {
  pkg: PackageDisplayData;
  featured?: boolean;
}

export function PackageCard({ pkg, featured = false }: PackageCardProps) {
  const [imgSrc, setImgSrc] = useState(pkg.hero_image_url || PLACEHOLDER_IMAGE);
  const { currency: selectedCurrency } = useSelectedCurrency();
  const convertedPrice = convertPrice(pkg.final_price, pkg.currency, selectedCurrency);
  const convertedSavings = pkg.savings ? convertPrice(pkg.savings, pkg.currency, selectedCurrency) : null;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleViewPackage() {
    startTransition(() => {
      router.push(`/packages/${pkg.slug}`);
    });
  }

  return (
    <Card
      className={`group relative h-full overflow-hidden rounded-2xl p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100 ${
        !pkg.is_in_stock ? "opacity-75" : ""
      }`}
    >
      {!pkg.is_in_stock && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/60">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            Currently Unavailable
          </span>
        </div>
      )}

      <div className="relative overflow-hidden">
        {convertedSavings && (
          <div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <Tag className="h-3 w-3" />
            Save {formatPrice(convertedSavings, selectedCurrency)}
          </div>
        )}
        <Link
          aria-label={`View package details for ${pkg.name}`}
          className="block"
          href={`/packages/${pkg.slug}`}
        >
          <div className={`relative w-full bg-gradient-to-br from-slate-50 to-slate-100 ${featured ? "h-56" : "h-44"}`}>
            <Image
              alt={`${pkg.name} health package`}
              className="object-contain transition duration-500 group-hover:scale-105"
              fill
              onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              src={imgSrc}
              unoptimized
            />
          </div>
        </Link>
      </div>

      <div className={`relative z-10 flex flex-col p-4 ${featured ? "min-h-[200px]" : "min-h-[180px]"}`}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
          <Package className="h-3.5 w-3.5" />
          <span>{pkg.item_count} products included</span>
        </div>

        <h3 className={`mt-1.5 line-clamp-2 font-semibold leading-tight text-slate-900 ${featured ? "text-lg" : "text-base"}`}>
          <Link className="transition hover:text-brand-700" href={`/packages/${pkg.slug}`}>
            {pkg.name}
          </Link>
        </h3>

        {pkg.tagline && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{pkg.tagline}</p>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <p className={`font-bold text-slate-900 ${featured ? "text-3xl" : "text-2xl"}`}>
              {formatPrice(convertedPrice, selectedCurrency)}
            </p>
            {convertedSavings && (
              <p className="text-sm text-slate-400 line-through">
                {formatPrice(convertPrice(pkg.calculated_price, pkg.currency, selectedCurrency), selectedCurrency)}
              </p>
            )}
          </div>
          <button
            aria-label={`View details for ${pkg.name}`}
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-60"
            disabled={isPending}
            onClick={handleViewPackage}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Loading...
              </>
            ) : (
              <>
                View Package
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
