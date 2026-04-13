"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { NewsletterSignup } from "@/components/storefront/newsletter-signup";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { useCart } from "@/hooks/use-cart";
import { trackEvent } from "@/lib/analytics";
import { convertPrice, formatPrice } from "@/lib/currency";
import { buildProductLeadDescription } from "@/lib/seo";
import { buildWhatsAppProductInterestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { StorefrontProduct } from "@/types";
import type { PdfCatalogProductContent } from "@/lib/catalog/pdf-catalog-content";
import { AlertTriangle, CheckCircle2, MessageCircle, Quote, ShieldCheck, Sparkles, Truck } from "lucide-react";

function availabilityLabel(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return "In stock";
  if (availability === "low_stock") return "Low stock";
  return "Out of stock";
}

function availabilityVariant(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return "success" as const;
  if (availability === "low_stock") return "warning" as const;
  return "danger" as const;
}

function availabilitySignal(availability: StorefrontProduct["availability"]) {
  if (availability === "low_stock") return "Limited availability";
  if (availability === "out_of_stock") return "Currently unavailable";
  return "Ready for checkout";
}

function toMajorCurrency(minor: number): number {
  return Number((minor / 100).toFixed(2));
}

const categoryProblemFrames: Record<string, string[]> = {
  "weight-management": [
    "Managing appetite and cravings consistently can feel difficult.",
    "Inconsistent routines make progress hard to sustain.",
    "Many buyers want practical support they can stick to daily."
  ],
  "joint-health": [
    "Stiffness and discomfort can affect movement and daily activities.",
    "Users often look for daily support rather than one-off fixes.",
    "Product clarity matters when comparing formulas."
  ],
  "bone-health": [
    "Bone and mineral support is easier with consistent daily habits.",
    "Many users compare formulations before committing to a product.",
    "Reliable dosing and straightforward usage guidance build confidence."
  ],
  "brain-health": [
    "People often seek support for focus and mental consistency.",
    "Shoppers prefer products with clear active components.",
    "Simple explanations reduce decision stress."
  ],
  skincare: [
    "Skin routines fail when products are hard to understand.",
    "Users want visible support without guesswork.",
    "Consistency and clear ingredient context improve confidence."
  ],
  "anti-aging": [
    "Shoppers want support for healthy aging without hype-heavy claims.",
    "They compare ingredient quality and formula focus closely.",
    "Trust and clarity are essential before checkout."
  ]
};

const categoryBenefits: Record<string, string[]> = {
  beverages: [
    "Convenient daily format that fits existing routines.",
    "Focused formulation aligned to energy and vitality support.",
    "Easy to combine with other wellness habits."
  ],
  supplements: [
    "Targeted support category for specific wellness goals.",
    "Straightforward daily usage format.",
    "Designed for consistent use and easy reordering."
  ],
  "weight-management": [
    "Supports healthier routine-building around appetite and cravings.",
    "Can complement activity and nutrition habits.",
    "Simple daily format helps maintain consistency."
  ],
  "joint-health": [
    "Formulated to support mobility-focused routines.",
    "Useful for users prioritizing comfort and active movement.",
    "Built for ongoing use rather than one-time intervention."
  ],
  "bone-health": [
    "Supports foundational mineral and bone-focused routines.",
    "Useful where consistent daily intake is important.",
    "Clear formula positioning helps faster product decisions."
  ],
  skincare: [
    "Supports hydration and daily skin maintenance routines.",
    "Made for repeat use with visible regimen structure.",
    "Pairs well with cleanser-toner-cream workflows."
  ]
};

const productIngredientSignals: Record<string, string[]> = {
  "ginseng-coffee": ["Ginseng extract", "Coffee blend", "Functional ingredients"],
  "cordyceps-coffee": ["Cordyceps extract", "Coffee blend", "Mushroom-derived compounds"],
  "quad-reishi-capsules": ["Yunzhi extract", "Ganoderma extract", "Chaga extract"],
  "zaminocal-plus-capsules": ["Calcium", "Zinc", "Magnesium", "Selenium"],
  "youth-essence-facial-cream": ["Skin-support compounds", "Skin-conditioning base", "Hydration support compounds"],
  "xpower-coffee": ["Organic ginseng", "Tongkat Ali", "Coffee blend"]
};

const ingredientKeywordPairs: Array<{ label: string; match: RegExp }> = [
  { label: "Niacinamide", match: /niacinamide/i },
  { label: "Astaxanthin", match: /astaxanthin/i },
  { label: "Ginseng", match: /ginseng/i },
  { label: "Reishi", match: /reishi/i },
  { label: "Cordyceps", match: /cordyceps/i },
  { label: "Ganoderma", match: /ganoderma/i },
  { label: "Gymnema", match: /gymnema/i },
  { label: "Ginkgo Biloba", match: /ginkgo/i },
  { label: "Glucosamine", match: /glucosamine/i },
  { label: "Chondroitin", match: /chondroitin/i },
  { label: "Vitamin C", match: /vitamin c/i },
  { label: "Vitamin D3", match: /vitamin d3/i },
  { label: "Probiotic strains", match: /probiotic|bacterial strains/i },
  { label: "Resveratrol", match: /resveratrol/i },
  { label: "NMN", match: /\bnmn\b/i }
];

const PRODUCT_IMAGE_BLUR_DATA_URL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function resolveProblemFrame(product: StorefrontProduct) {
  return categoryProblemFrames[product.category_slug] || [
    "Shoppers often need clearer product context before buying.",
    "Unclear descriptions and pricing can delay decisions.",
    "A structured page reduces friction and builds confidence."
  ];
}

function resolveBenefits(product: StorefrontProduct) {
  const categorySpecific = categoryBenefits[product.category_slug];
  if (categorySpecific) return categorySpecific;

  return [
    "Clear product purpose and category fit.",
    "Straightforward ordering and transparent pricing.",
    "Designed to support consistent routines."
  ];
}

function resolveIngredients(product: StorefrontProduct) {
  const mapped = productIngredientSignals[product.slug];
  if (mapped) return mapped;

  const derived = ingredientKeywordPairs
    .filter(({ match }) => match.test(product.description))
    .map(({ label }) => label);

  if (derived.length > 0) return derived;

  return [
    "See package label for full ingredients",
    "Active compounds vary by product formula",
    "Contact support for ingredient-specific guidance"
  ];
}

interface ProductDetailProps {
  product: StorefrontProduct;
  commerceReady?: boolean;
  degradedReason?: string | null;
  pdfContent?: PdfCatalogProductContent | null;
  averageRating?: number;
  reviewCount?: number;
  soldThisWeek?: number | null;
  featuredReview?: {
    reviewer_name: string;
    comment: string;
    rating: number;
    is_verified_purchase: boolean;
  } | null;
}

export function ProductDetail({
  product,
  commerceReady = true,
  degradedReason = null,
  pdfContent = null,
  averageRating = 0,
  reviewCount = 0,
  soldThisWeek = null,
  featuredReview = null
}: ProductDetailProps) {
  const { currency } = useSelectedCurrency();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const isUnavailable = product.availability === "out_of_stock" || !commerceReady;
  const maxQuantity = useMemo(() => Math.max(1, Math.min(product.stock_qty, 99)), [product.stock_qty]);
  const problemFrame = resolveProblemFrame(product);
  const descriptionText = pdfContent?.description || product.description;
  const seoLeadDescription = buildProductLeadDescription({
    name: product.name,
    categoryName: product.category_name,
    description: descriptionText
  });
  const benefits = pdfContent?.benefits.length ? pdfContent.benefits : resolveBenefits(product);
  const ingredients = pdfContent?.ingredients.length ? pdfContent.ingredients : resolveIngredients(product);
  const usageInstructions = pdfContent?.usageInstructions || null;
  const warnings = pdfContent?.warnings || [];
  const availabilityStatus = availabilitySignal(product.availability);
  const productWhatsAppInterestMessage = buildWhatsAppProductInterestMessage(product.name);
  const lowStockCount = product.stock_qty > 0 && product.stock_qty < 10 ? product.stock_qty : null;
  const hasReviewData = reviewCount > 0;
  const displayPrice = convertPrice(product.price, product.currency, currency);

  function increment() {
    setQuantity((current) => Math.min(current + 1, maxQuantity));
  }

  function decrement() {
    setQuantity((current) => Math.max(current - 1, 1));
  }

  function handleAddToCart() {
    if (isUnavailable) {
      toast({
        title: "Item unavailable",
        description: "This product is currently out of stock.",
        variant: "error"
      });
      return;
    }

    addItem(product, quantity);
    trackEvent("add_to_cart", {
      currency: product.currency,
      value: toMajorCurrency(product.price * quantity),
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category_name,
          price: toMajorCurrency(product.price),
          quantity
        }
      ]
    });
    toast({
      title: "Added to cart",
      description: `${product.name} x${quantity}`,
      variant: "success"
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="space-y-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <Image
              alt={`BF Suma ${product.name} ${product.category_name.toLowerCase()} product in Kenya`}
              blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
              className="object-contain"
              fill
              placeholder="blur"
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              src={product.image_url || "/catalog-images/placeholder.svg"}
              unoptimized
            />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={availabilityVariant(product.availability)}>{availabilityLabel(product.availability)}</Badge>
            <span className="text-xs font-medium text-slate-500">{product.category_name}</span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {availabilityStatus}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {hasReviewData ? (
              <p className="font-semibold text-slate-900">
                {averageRating.toFixed(1)} / 5 ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </p>
            ) : (
              <Link className="font-semibold text-brand-700 hover:text-brand-800" href="#reviews">
                Be the first to review
              </Link>
            )}
            {typeof soldThisWeek === "number" && soldThisWeek > 1 ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {soldThisWeek} sold this week
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{seoLeadDescription}</p>

          {featuredReview ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                <Quote className="h-3.5 w-3.5" />
                Customer highlight
              </p>
              <p className="mt-1 text-sm text-slate-700">&ldquo;{featuredReview.comment}&rdquo;</p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                {featuredReview.reviewer_name} • {featuredReview.rating}/5
                {featuredReview.is_verified_purchase ? " • Verified purchase" : ""}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Problem Fit</p>
            <p className="mt-1 text-sm text-slate-700">{problemFrame[0]}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-900">{formatPrice(displayPrice, currency)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Quantity</p>
            {lowStockCount ? (
              <p className="text-sm font-semibold text-amber-700">Only {lowStockCount} left in stock</p>
            ) : null}
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white p-1">
              <button
                aria-label={`Decrease quantity for ${product.name}`}
                className="h-9 w-9 rounded-md bg-slate-100 font-semibold transition hover:bg-slate-200"
                onClick={decrement}
                type="button"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                aria-label={`Increase quantity for ${product.name}`}
                className="h-9 w-9 rounded-md bg-slate-100 font-semibold transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200"
                disabled={quantity >= maxQuantity}
                onClick={increment}
                title={quantity >= maxQuantity ? "You've reached available quantity." : "Increase quantity"}
                type="button"
              >
                +
              </button>
            </div>
            {isUnavailable && (
              <p className="text-xs text-red-600">Unavailable right now. Contact support for restock timing.</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="sm:flex-1"
              disabled={isUnavailable}
              onClick={handleAddToCart}
              title={isUnavailable ? "Product is out of stock" : "Add item to cart"}
            >
              {!commerceReady ? "Checkout unavailable" : isUnavailable ? "Out of stock" : "Add to Cart - Fast Checkout"}
            </Button>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-100 sm:flex-1"
              href={buildWhatsAppUrl(productWhatsAppInterestMessage)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>

          <p className="text-xs text-slate-600">Need quick guidance before checkout? Tap WhatsApp for fast help.</p>

          <NewsletterSignup
            source="product_page"
            context={product.slug}
            compact
            title="Get updates for products like this"
            description="Receive concise restock and product update emails."
            ctaLabel="Notify Me"
          />

          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            href="/checkout"
          >
            Continue to Checkout
          </Link>

          <ul className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>Transparent pricing and totals before order submission.</span>
            </li>
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>Delivery and pickup options with clear next-step updates.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>No forced account creation to complete checkout.</span>
            </li>
          </ul>

          {!commerceReady ? (
            <p className="text-xs text-amber-700">
              {degradedReason || "Live inventory validation is unavailable. Checkout is temporarily disabled."}
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Solution</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">How this product helps</h2>
          <ul className="mt-3 space-y-2.5">
            {benefits.map((benefit) => (
              <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-700" key={benefit}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {problemFrame.length > 1 ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Problem context</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-700">
                {problemFrame.slice(1, 3).map((frame) => (
                  <li key={frame}>{frame}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        <div className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Ingredients</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Key actives and formula cues</h2>
            <ul className="mt-3 space-y-2.5">
              {ingredients.map((ingredient) => (
                <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-700" key={ingredient}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Always verify complete ingredient and usage details on the package label.
            </p>
          </article>

          {usageInstructions || warnings.length > 0 ? (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Usage and cautions</p>

              {usageInstructions ? (
                <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Suggested usage</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{usageInstructions}</p>
                </div>
              ) : null}

              {warnings.length > 0 ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Important use notes
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-700">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ) : null}
        </div>
      </section>

    </div>
  );
}
