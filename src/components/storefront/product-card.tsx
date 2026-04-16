"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { convertPrice, formatPrice } from "@/lib/currency";
import type { StorefrontProduct } from "@/types";

type ProductCardVariant = "shop" | "featured";

interface ProductCardProps {
  product: StorefrontProduct;
  variant?: ProductCardVariant;
  description?: string;
  className?: string;
}

export function ProductCard({ product, variant = "shop", description, className }: ProductCardProps) {
  const { currency } = useSelectedCurrency();
  void variant;
  const displayPrice = convertPrice(product.price, product.currency, currency);
  const displayDescription = (description || product.description || "").trim();

  return (
    <Link
      aria-label={`Open product details for ${product.name}`}
      className={`block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        className || ""
      }`}
      href={`/shop/${product.slug}`}
    >
      <div className="group relative flex h-full min-h-[320px] cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100">
        <div className="relative h-44 w-full bg-white p-2">
          <div className="relative h-full w-full">
            <Image
              alt={`BF Suma ${product.name} ${product.category_name.toLowerCase()} product in Kenya`}
              className="object-contain transition duration-500 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              src={product.image_url || "/catalog-images/placeholder.svg"}
              unoptimized
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent" />
        </div>

        <div className="relative z-20 flex flex-1 flex-col space-y-3 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">{product.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
            {displayDescription || "Product details available on the product page."}
          </p>
          <div className="mt-auto pt-1">
            <p className="text-base font-semibold text-slate-900">{formatPrice(displayPrice, currency)}</p>
            <button
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              tabIndex={-1}
              type="button"
            >
              View Details →
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
