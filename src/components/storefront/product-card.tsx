import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <Card className="group relative h-full overflow-hidden rounded-2xl p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100">
      <Link
        aria-label={`Open product details for ${product.name}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        href={`/shop/${product.slug}`}
      >
        <span className="sr-only">View product details for {product.name}</span>
      </Link>
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/3] w-full bg-slate-50 p-3">
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
      </div>

      <div className="relative z-20 flex h-full flex-col space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
        </div>

        <div className="mt-auto pt-1">
          <Link
            aria-label={`View details for ${product.name}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            href={`/shop/${product.slug}`}
          >
            View Product
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}