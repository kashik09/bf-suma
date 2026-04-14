"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { convertPrice, formatPrice } from "@/lib/currency";
import type { StorefrontProduct } from "@/types";

function getSavingsLabel(product: StorefrontProduct, selectedCurrency: string) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return null;
  const savingsMinor = convertPrice(product.compare_at_price - product.price, product.currency, selectedCurrency);
  return `Save ${formatPrice(savingsMinor, selectedCurrency)}`;
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const { currency } = useSelectedCurrency();
  const savingsLabel = getSavingsLabel(product, currency);
  const displayPrice = convertPrice(product.price, product.currency, currency);

  return (
    <Link
      aria-label={`Open product details for ${product.name}`}
      className="group block h-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      href={`/shop/${product.slug}`}
    >
      <Card className="relative h-full overflow-hidden rounded-2xl border border-slate-100 p-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="relative overflow-hidden">
          <div className="relative h-44 w-full bg-white p-2">
            <Image
              alt={`BF Suma ${product.name} ${product.category_name.toLowerCase()} product in Kenya`}
              className="object-contain transition duration-500 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              src={product.image_url || "/catalog-images/placeholder.svg"}
              unoptimized
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
          {savingsLabel ? (
            <div className="absolute right-3 top-3">
              <Badge variant="success">{savingsLabel}</Badge>
            </div>
          ) : null}
        </div>

        <div className="relative z-20 flex h-full flex-col p-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">{product.name}</h3>
            <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-base font-bold text-slate-900">{formatPrice(displayPrice, currency)}</p>
          </div>

          <div className="mt-auto pt-4">
            <span className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              View Details →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
