import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

function getAvailabilityBadge(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return { label: "In Stock", variant: "success" as const };
  if (availability === "low_stock") return { label: "Low Stock", variant: "warning" as const };
  return { label: "Out of Stock", variant: "danger" as const };
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const badge = getAvailabilityBadge(product.availability);

  return (
    <Card className="group h-full overflow-hidden rounded-2xl p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100">
      <div className="relative">
        <div
          className="h-48 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${product.image_url || "/catalog-images/placeholder.webp"})` }}
        />
        <div className="absolute left-3 top-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </div>

      <div className="flex h-full flex-col space-y-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
          {product.compare_at_price ? (
            <p className="text-sm text-slate-500 line-through">{formatCurrency(product.compare_at_price, product.currency)}</p>
          ) : null}
        </div>

        <div className="mt-auto pt-1">
          <Link
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            href={`/shop/${product.slug}`}
          >
            View Product
          </Link>
        </div>
      </div>
    </Card>
  );
}
