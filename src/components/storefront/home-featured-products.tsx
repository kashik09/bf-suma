"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { convertPrice, formatPrice } from "@/lib/currency";
import type { StorefrontProduct } from "@/types";

const productBenefitBySlug: Record<string, string> = {
  "ginseng-coffee": "Gentle daily energy support with added functional ingredients.",
  "cordyceps-coffee": "Supports stamina and focus for active routines.",
  "quad-reishi-capsules": "Immune-focused mushroom blend for consistent support.",
  "zaminocal-plus-capsules": "Mineral support for bones and joint comfort.",
  "youth-essence-facial-cream": "Hydration-first daily skin support formula.",
  "xpower-coffee": "Convenient vitality support in an easy coffee format."
};

function toBenefitText(product: StorefrontProduct) {
  const mapped = productBenefitBySlug[product.slug];
  if (mapped) return mapped;
  const trimmed = product.description.trim();
  if (trimmed.length <= 86) return trimmed;
  return `${trimmed.slice(0, 83)}...`;
}

function savingsLabel(product: StorefrontProduct, selectedCurrency: string) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return null;
  const delta = convertPrice(product.compare_at_price - product.price, product.currency, selectedCurrency);
  return `Save ${formatPrice(delta, selectedCurrency)}`;
}

export function HomeFeaturedProducts({ products }: { products: StorefrontProduct[] }) {
  const { currency } = useSelectedCurrency();
  const featured = products.slice(0, 6);

  return (
    <section className="space-y-4 sm:space-y-5">
      <SectionHeader
        title="Featured Essentials"
        description="Shortlisted products with clear value, practical descriptions, and direct checkout flow."
        action={(
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/shop">
            View full catalog
          </Link>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {featured.map((product) => {
          const savings = savingsLabel(product, currency);
          const displayPrice = convertPrice(product.price, product.currency, currency);

          return (
            <Link
              aria-label={`Open product details for ${product.name}`}
              className="group block h-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              href={`/shop/${product.slug}`}
              key={product.id}
            >
              <article
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-green-500 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-44 w-full bg-white p-2">
                  <Image
                    alt={`BF Suma ${product.name} featured ${product.category_name.toLowerCase()} product`}
                    className="object-contain"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={product.image_url || "/catalog-images/placeholder.svg"}
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {product.category_name}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold leading-snug text-slate-900">{product.name}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{toBenefitText(product)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-base font-bold text-slate-900 sm:text-lg">{formatPrice(displayPrice, currency)}</p>
                    {savings ? <span className="text-xs font-semibold text-brand-700">{savings}</span> : null}
                  </div>

                  <div className="mt-auto pt-1">
                    <span className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                      View Details →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
