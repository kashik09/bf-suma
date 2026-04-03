import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppProductInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
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

function availabilityBadgeVariant(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return "success" as const;
  if (availability === "low_stock") return "warning" as const;
  return "danger" as const;
}

function availabilityLabel(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return "In stock";
  if (availability === "low_stock") return "Low stock";
  return "Out of stock";
}

function savingsLabel(product: StorefrontProduct) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return null;
  const delta = product.compare_at_price - product.price;
  return `Save ${formatCurrency(delta, product.currency)}`;
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
          const whatsappMessage = buildWhatsAppProductInterestMessage(product.name);
          const savings = savingsLabel(product);

          return (
            <article
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-card hover:ring-brand-100"
              key={product.id}
            >
              <div className="h-40 w-full bg-[linear-gradient(145deg,_#f8fafc_0%,_#e2e8f0_100%)] sm:h-44" />
              <div className="flex flex-1 flex-col space-y-2.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
                  <Badge variant={availabilityBadgeVariant(product.availability)}>
                    {availabilityLabel(product.availability)}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-semibold leading-snug text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{toBenefitText(product)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
                  {product.compare_at_price ? (
                    <p className="text-sm text-slate-500 line-through">{formatCurrency(product.compare_at_price, product.currency)}</p>
                  ) : null}
                  {savings ? <span className="text-xs font-semibold text-emerald-700">{savings}</span> : null}
                </div>

                <p className="flex items-center gap-1.5 text-xs text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
                  Transparent checkout totals. Optional WhatsApp support.
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    href={`/shop/${product.slug}`}
                  >
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  <a
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    href={buildWhatsAppUrl(whatsappMessage, SUPPORT_WHATSAPP_PHONE)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
