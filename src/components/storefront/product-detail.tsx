"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/hooks/use-cart";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/types";
import { CheckCircle2, MessageCircle, Quote, ShieldCheck, Sparkles, Truck } from "lucide-react";

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
  "youth-essence-facial-cream": ["Mitochondrial repair enzymes", "Skin-conditioning base", "Hydration support compounds"],
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

const categoryFaqs: Record<string, Array<{ question: string; answer: string }>> = {
  default: [
    {
      question: "How do I know this product is right for me?",
      answer: "Start with the product purpose and ingredient section, then use WhatsApp support if you need personalized guidance."
    },
    {
      question: "Can I order without creating an account?",
      answer: "Yes. Checkout is designed to work without a forced account sign-up."
    },
    {
      question: "When do I pay?",
      answer: "Payment is handled on delivery or pickup, with total costs shown before order confirmation."
    }
  ],
  skincare: [
    {
      question: "How should I introduce this into my routine?",
      answer: "Start with consistent daily use and pair with complementary skincare steps where applicable."
    },
    {
      question: "Where can I verify ingredients?",
      answer: "Use the ingredients section on this page and confirm full label details on product packaging."
    },
    {
      question: "Can I ask for support before checkout?",
      answer: "Yes. WhatsApp support is available for product-fit questions before you place your order."
    }
  ],
  beverages: [
    {
      question: "Is this a daily-use product?",
      answer: "Most beverage products are intended for routine use. Follow serving guidance on the package."
    },
    {
      question: "Can I combine this with other products?",
      answer: "Many customers stack categories, but support can help you choose a practical sequence."
    },
    {
      question: "How fast is fulfillment?",
      answer: "Delivery and pickup options are shown at checkout, with clear next steps before submission."
    }
  ]
};

const testimonialFrames = [
  {
    initials: "AK",
    location: "Kampala",
    quote: "The product page made the decision easy. I could compare quickly and checkout without confusion."
  },
  {
    initials: "FN",
    location: "Entebbe",
    quote: "I liked seeing details and total cost clearly before paying. It felt more trustworthy than typical stores."
  },
  {
    initials: "JM",
    location: "Wakiso",
    quote: "I used WhatsApp for one question, then finished checkout directly. The flow stayed simple."
  }
];

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

function resolveFaqs(product: StorefrontProduct) {
  return categoryFaqs[product.category_slug] || categoryFaqs.default;
}

interface ProductDetailProps {
  product: StorefrontProduct;
  commerceReady?: boolean;
  degradedReason?: string | null;
}

export function ProductDetail({ product, commerceReady = true, degradedReason = null }: ProductDetailProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.gallery_urls[0] || product.image_url);

  const isUnavailable = product.availability === "out_of_stock" || !commerceReady;
  const maxQuantity = useMemo(() => Math.max(1, Math.min(product.stock_qty, 99)), [product.stock_qty]);
  const problemFrame = resolveProblemFrame(product);
  const benefits = resolveBenefits(product);
  const ingredients = resolveIngredients(product);
  const faqs = resolveFaqs(product);

  const whatsappMessage = `Hello BF Suma, I would like to order ${product.name} (${quantity} item${quantity > 1 ? "s" : ""}).`;

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
          <div
            className="h-72 w-full rounded-2xl border border-slate-200 bg-cover bg-center shadow-soft sm:h-96"
            style={{ backgroundImage: `url(${activeImage})` }}
          />
          <div className="grid grid-cols-4 gap-2">
            {product.gallery_urls.slice(0, 4).map((image) => (
              <button
                className={`h-20 rounded-md border bg-cover bg-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  activeImage === image ? "border-brand-600 ring-1 ring-brand-100" : "border-slate-200 hover:border-slate-300"
                }`}
                key={image}
                onClick={() => setActiveImage(image)}
                style={{ backgroundImage: `url(${image})` }}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={availabilityVariant(product.availability)}>{availabilityLabel(product.availability)}</Badge>
            <span className="text-xs font-medium text-slate-500">{product.category_name}</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{product.name}</h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{product.description}</p>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Problem Fit</p>
            <p className="mt-1 text-sm text-slate-700">{problemFrame[0]}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
            {product.compare_at_price ? (
              <p className="text-sm text-slate-500 line-through">{formatCurrency(product.compare_at_price, product.currency)}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Quantity</p>
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white p-1">
              <button className="h-9 w-9 rounded-md bg-slate-100 font-semibold transition hover:bg-slate-200" onClick={decrement} type="button">
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
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
              {!commerceReady ? "Checkout unavailable" : isUnavailable ? "Out of stock" : "Add to cart"}
            </Button>
            <a
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:flex-1"
              href={buildWhatsAppUrl(whatsappMessage)}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            href="/checkout"
          >
            Continue to checkout
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

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Solution</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">How this product helps</h2>
          <ul className="mt-3 space-y-2.5">
            {benefits.map((benefit) => (
              <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-700" key={benefit}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </article>

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
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Proof</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Customer feedback structure</h2>
        <p className="mt-1 text-sm text-slate-600">Clear, practical feedback format buyers expect before making a decision.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {testimonialFrames.map((feedback) => (
            <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5" key={`${feedback.initials}-${feedback.location}`}>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <Quote className="h-3.5 w-3.5 text-brand-700" />
                {feedback.initials} • {feedback.location}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{feedback.quote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">FAQs</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">Questions buyers ask before checkout</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {faqs.map((item) => (
            <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5" key={item.question}>
              <h3 className="text-sm font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
