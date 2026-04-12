import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppProductInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { StorefrontProduct } from "@/types";

function getAvailabilityBadge(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return { label: "In Stock", variant: "success" as const };
  if (availability === "low_stock") return { label: "Low Stock", variant: "warning" as const };
  return { label: "Out of Stock", variant: "danger" as const };
}

function getUrgencySignal(availability: StorefrontProduct["availability"]) {
  if (availability === "low_stock") return "Limited availability";
  if (availability === "out_of_stock") return "Currently unavailable";
  return "Ready to order";
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
  const urgencySignal = getUrgencySignal(product.availability);
  const whatsappMessage = buildWhatsAppProductInterestMessage(product.name);

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
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="inline-flex w-fit rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
            {urgencySignal}
          </span>
        </div>
        {savingsLabel ? (
          <div className="absolute right-3 top-3">
            <Badge variant="success">{savingsLabel}</Badge>
          </div>
        ) : null}
      </div>

      <div className="relative z-20 flex h-full flex-col space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">{product.name}</h3>
          <p className="line-clamp-2 text-sm font-medium text-brand-700">{benefitSnippet}</p>
          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              aria-label={`View details for ${product.name}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              href={`/shop/${product.slug}`}
            >
              View Product
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto"
              href={buildWhatsAppUrl(whatsappMessage, SUPPORT_WHATSAPP_PHONE)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
