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
    <Card className="h-full overflow-hidden p-0">
      <div className="relative">
        <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url(${product.image_url})` }} />
        <div className="absolute left-3 top-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </div>

      <div className="space-y-3 p-4">
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

        <Link
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
          href={`/shop/${product.slug}`}
        >
          View Product
        </Link>
      </div>
    </Card>
  );
}
