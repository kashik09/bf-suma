import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
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

export function HomeFeaturedProducts({ products }: { products: StorefrontProduct[] }) {
  const featured = products.slice(0, 6);

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Featured Essentials"
        description="Fast-moving products customers choose most for daily wellness support."
        action={(
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/shop">
            View full catalog
          </Link>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((product) => {
          const whatsappMessage = `Hello BF Suma, I would like to order ${product.name}.`;

          return (
            <article
              className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
              key={product.id}
            >
              <div
                className="h-44 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${product.image_url})` }}
              />
              <div className="flex flex-1 flex-col space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category_name}</p>
                  <Badge variant={availabilityBadgeVariant(product.availability)}>
                    {availabilityLabel(product.availability)}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{toBenefitText(product)}</p>
                </div>

                <p className="text-lg font-semibold text-slate-900">{formatCurrency(product.price, product.currency)}</p>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
                    href={`/shop/${product.slug}`}
                  >
                    View Product
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  <a
                    className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    href={buildWhatsAppUrl(whatsappMessage, SUPPORT_WHATSAPP_PHONE)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    WhatsApp
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
