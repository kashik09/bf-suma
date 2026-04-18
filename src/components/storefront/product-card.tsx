"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

const PLACEHOLDER_IMAGE = "/catalog-images/placeholder.svg";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const [imgSrc, setImgSrc] = useState(product.image_url || PLACEHOLDER_IMAGE);

  return (
    <Card className="group relative h-full overflow-hidden rounded-2xl p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100">
      <div className="relative overflow-hidden">
        <WishlistButton
          className="absolute right-2 top-2 z-20 bg-white/90 p-1.5 shadow-sm backdrop-blur"
          slug={product.slug}
        />
        <Link aria-label={`Open product details for ${product.name}`} className="block" href={`/shop/${product.slug}`}>
          <div className="relative h-44 w-full bg-white">
            <Image
              alt={`BF Suma ${product.name} ${product.category_name.toLowerCase()} product in Kenya`}
              className="object-contain transition duration-500 group-hover:scale-105"
              fill
              onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              src={imgSrc}
              unoptimized
            />
          </div>
        </Link>
      </div>

      <div className="relative z-10 flex min-h-[220px] flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
        <h3 className="mt-1.5 line-clamp-2 text-base font-semibold leading-tight text-slate-900">
          <Link className="transition hover:text-brand-700" href={`/shop/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="mt-auto pt-3">
          <p className="text-xl font-bold text-brand-600">{formatCurrency(product.price, product.currency)}</p>
          <Link
            aria-label={`View details for ${product.name}`}
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            href={`/shop/${product.slug}`}
          >
            View Details
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
