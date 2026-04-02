import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";

function getAvailabilityBadge(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return { label: "In Stock", variant: "success" as const };
  if (availability === "low_stock") return { label: "Low Stock", variant: "warning" as const };
  return { label: "Out of Stock", variant: "danger" as const };
}

function getBenefitSnippet(product: StorefrontProduct) {
  if (product.category_slug === "beverages") return "Convenient daily routine support";
  if (product.category_slug === "supplements") return "Targeted wellness support formula";
  if (product.category_slug === "skincare") return "Daily skin support and care";
  if (product.category_slug === "weight-management") return "Supports healthier routine consistency";
  return "Clear product details for faster decisions";
}

function getSavingsLabel(product: StorefrontProduct) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return null;
  const savings = product.compare_at_price - product.price;
  return `Save ${formatCurrency(savings, product.currency)}`;
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const badge = getAvailabilityBadge(product.availability);
  const benefitSnippet = getBenefitSnippet(product);
  const savingsLabel = getSavingsLabel(product);

  return (
    <Card className="group h-full overflow-hidden rounded-2xl p-0 ring-1 ring-slate-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100">
      <div className="relative overflow-hidden">
        <div
          className="h-48 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url(${product.image_url || "/catalog-images/placeholder.webp"})`
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        {savingsLabel ? (
          <div className="absolute right-3 top-3">
            <Badge variant="success">{savingsLabel}</Badge>
          </div>
        ) : null}
      </div>

      <div className="flex h-full flex-col space-y-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
          <p className="mt-1 text-xs font-semibold text-brand-700">{benefitSnippet}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
          {product.compare_at_price ? (
            <p className="text-sm text-slate-500 line-through">{formatCurrency(product.compare_at_price, product.currency)}</p>
          ) : null}
        </div>

        <div className="mt-auto pt-1">
          <p className="mb-2 flex items-center gap-1 text-xs text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
            Transparent pricing and direct checkout flow
          </p>
          <div className="flex gap-2">
            <Link
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              href={`/shop/${product.slug}`}
              aria-label={`View details for ${product.name}`}
            >
              View Details
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              href={`/category/${product.category_slug}`}
              aria-label={`Explore ${product.category_name} category`}
            >
              Category
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
