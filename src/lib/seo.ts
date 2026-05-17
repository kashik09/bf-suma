import type { Metadata } from "next";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";
import { ADDRESS } from "@/config/contact";

const DEFAULT_SITE_URL = "https://bfsumauganda.com";
const DEFAULT_SOCIAL_IMAGE = "/bf-suma-logo.png";
const META_DESCRIPTION_LIMIT = 160;

const BLOG_SEO_TITLE_OVERRIDES: Record<string, string> = {
  "understanding-power-reishi-mushrooms-immune-health": "Reishi Mushroom Benefits for Immune Health",
  "complete-guide-ginseng-energy-focus-vitality": "Ginseng Benefits for Energy and Focus",
  "skin-health-within-science-youth-essence": "Skin Health Tips: Nutrition, Routine, and Youth Essence",
  "building-strong-immune-system-complete-wellness-guide": "How to Build a Strong Immune System Naturally",
  "natural-ways-boost-energy-levels-throughout-day": "Natural Ways to Boost Energy Levels",
  "gut-health-connection-why-digestive-system-matters": "Gut Health Guide: Digestion, Immunity, and Daily Habits",
  "sleep-better-tonight-science-backed-tips-quality-rest": "How to Sleep Better Naturally: Practical Tips",
  "stress-management-practical-tools-modern-life": "Stress Management Tips for Modern Life"
};

function toValidUrl(input?: string | null): URL | null {
  const trimmed = input?.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function normalizeSeoCopy(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function clampMetaDescription(text: string, maxLength: number = META_DESCRIPTION_LIMIT): string {
  const clean = normalizeSeoCopy(text);
  if (clean.length <= maxLength) return clean;

  const clipped = clean.slice(0, Math.max(0, maxLength - 1)).replace(/[,\s:;.-]+$/g, "");
  return `${clipped}…`;
}

export function getSiteMetadataBase(): URL {
  const envUrl = toValidUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  if (envUrl) {
    return new URL(`${envUrl.origin}/`);
  }
  return new URL(`${DEFAULT_SITE_URL}/`);
}

export function getSiteUrl(): string {
  return getSiteMetadataBase().origin;
}

export function toAbsoluteUrl(path: string): string {
  return new URL(path, getSiteMetadataBase()).toString();
}

interface BuildStorefrontMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  keywords?: string[];
}

export function buildStorefrontMetadata({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_SOCIAL_IMAGE,
  keywords
}: BuildStorefrontMetadataInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: fullTitle,
      description,
      type,
      url: canonicalPath,
      siteName: APP_NAME,
      images: [{ url: image, alt: fullTitle }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image]
    }
  };
}

export function buildProductMetaDescription(params: {
  name: string;
  categoryName: string;
  description: string;
}): string {
  const category = params.categoryName.trim().toLowerCase();
  const benefit = normalizeSeoCopy(params.description || `Trusted ${category} support for daily routines.`);
  return clampMetaDescription(
    `${params.name} in Uganda by BF Suma. ${benefit} Order online with transparent pricing and fast support.`
  );
}

export function buildProductLeadDescription(params: {
  name: string;
  categoryName: string;
  description: string;
}): string {
  const source = normalizeSeoCopy(params.description);
  if (!source) {
    return `${params.name} is a BF Suma ${params.categoryName.toLowerCase()} product in Uganda for daily wellness routines.`;
  }

  const prefix = `${params.name} is a BF Suma ${params.categoryName.toLowerCase()} option in Uganda.`;
  if (source.toLowerCase().startsWith(params.name.toLowerCase())) {
    return `${source} Shop with clear pricing and local support.`;
  }

  return `${prefix} ${source}`;
}

export function getBlogSeoTitle(slug: string, fallbackTitle: string): string {
  return BLOG_SEO_TITLE_OVERRIDES[slug] || fallbackTitle;
}

export function buildBlogMetaDescription(params: { title: string; excerpt: string }): string {
  return clampMetaDescription(
    `${params.title} from BF Suma. ${normalizeSeoCopy(params.excerpt)}`
  );
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: getSiteUrl(),
    logo: toAbsoluteUrl("/bf-suma-logo.png"),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE
      }
    ]
  };
}

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "BF Suma Uganda",
    image: toAbsoluteUrl("/bf-suma-logo.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.line1 + ", " + ADDRESS.line2,
      addressLocality: ADDRESS.city,
      addressCountry: "UG"
    },
    telephone: SUPPORT_PHONE,
    email: SUPPORT_EMAIL,
    url: getSiteUrl(),
    priceRange: "$$"
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export interface ProductJsonLdParams {
  name: string;
  description: string;
  sku: string;
  category: string;
  slug: string;
  images: string[];
  price: number;
  currency: string;
  availability: "in_stock" | "out_of_stock" | "preorder";
  ratingValue?: number;
  reviewCount?: number;
}

export function buildProductJsonLd(params: ProductJsonLdParams) {
  const availabilityMap = {
    in_stock: "https://schema.org/InStock",
    out_of_stock: "https://schema.org/OutOfStock",
    preorder: "https://schema.org/PreOrder"
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    sku: params.sku,
    category: params.category,
    image: params.images.map((img) => toAbsoluteUrl(img)),
    brand: {
      "@type": "Brand",
      name: "BF Suma"
    },
    offers: {
      "@type": "Offer",
      priceCurrency: params.currency,
      price: (params.price / 100).toFixed(2),
      availability: availabilityMap[params.availability],
      url: toAbsoluteUrl(`/shop/${params.slug}`)
    },
    ...(params.reviewCount && params.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: params.ratingValue,
            reviewCount: params.reviewCount
          }
        }
      : {})
  };
}
