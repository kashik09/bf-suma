import type { Metadata } from "next";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

const DEFAULT_SITE_URL = "https://bfsuma.com";
const DEFAULT_SOCIAL_IMAGE = "/bf-suma-logo.png";
const META_DESCRIPTION_LIMIT = 160;

const BLOG_SEO_TITLE_OVERRIDES: Record<string, string> = {
  "understanding-power-reishi-mushrooms-immune-health": "Reishi Mushroom Benefits for Immune Health in Kenya",
  "complete-guide-ginseng-energy-focus-vitality": "Ginseng Benefits for Energy and Focus in Kenya",
  "skin-health-within-science-youth-essence": "Skin Health Tips in Kenya: Nutrition, Routine, and Youth Essence",
  "building-strong-immune-system-complete-wellness-guide":
    "How to Build a Strong Immune System Naturally in Kenya",
  "natural-ways-boost-energy-levels-throughout-day": "Natural Ways to Boost Energy Levels in Kenya",
  "gut-health-connection-why-digestive-system-matters":
    "Gut Health Guide in Kenya: Digestion, Immunity, and Daily Habits",
  "sleep-better-tonight-science-backed-tips-quality-rest": "How to Sleep Better Naturally: Practical Tips in Kenya",
  "stress-management-practical-tools-modern-life": "Stress Management Tips for Modern Life in Kenya"
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
    `${params.name} in Kenya by BF Suma. ${benefit} Order online with transparent pricing and fast support.`
  );
}

export function buildProductLeadDescription(params: {
  name: string;
  categoryName: string;
  description: string;
}): string {
  const source = normalizeSeoCopy(params.description);
  if (!source) {
    return `${params.name} is a BF Suma ${params.categoryName.toLowerCase()} product in Kenya for daily wellness routines.`;
  }

  const prefix = `${params.name} is a BF Suma ${params.categoryName.toLowerCase()} option in Kenya.`;
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
    `${params.title} from BF Suma Kenya. ${normalizeSeoCopy(params.excerpt)}`
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
