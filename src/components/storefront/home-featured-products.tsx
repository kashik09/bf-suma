"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/storefront/product-card";
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

export function HomeFeaturedProducts({ products }: { products: StorefrontProduct[] }) {
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
          return (
            <ProductCard
              description={toBenefitText(product)}
              key={product.id}
              product={product}
              variant="featured"
            />
          );
        })}
      </div>
    </section>
  );
}
