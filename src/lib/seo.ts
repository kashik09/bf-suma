import type { Metadata } from "next";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

const SITE_NAME = "BF Suma Uganda";
const BRAND_NAME = "BF Suma";
const DEFAULT_SITE_URL = "https://www.bfsumauganda.com";
const DEFAULT_SOCIAL_IMAGE = "/bf-suma-logo.png";
const META_DESCRIPTION_LIMIT = 160;

interface SeoEntry {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}

export const STATIC_PAGE_SEO = {
  home: {
    path: "/",
    title: "BF Suma Uganda | Health Supplements & Wellness Products in Kampala",
    description:
      "Buy authentic BF Suma wellness products in Uganda. Immune boosters, digestive health, skincare & more. Fast delivery in Kampala. WhatsApp: +256 778 928 815."
  },
  shop: {
    path: "/shop",
    title: "Shop BF Suma Products in Uganda | Supplements & Wellness",
    description:
      "Browse 24+ authentic BF Suma health products in Uganda. From immune boosters and digestive health to men's and women's wellness. Clear prices in UGX. Order today."
  },
  categories: {
    path: "/categories",
    title: "BF Suma Product Categories Uganda | Browse by Health Goal",
    description:
      "Explore BF Suma Uganda product categories: Immune Boosters, Digestive Health, Cardiovascular, Skincare, Men's & Women's Health. Find the right supplement for your goal."
  },
  packages: {
    path: "/packages",
    title: "BF Suma Health Packages Uganda | Bundled Wellness Solutions",
    description:
      "Save with BF Suma wellness bundles in Uganda. Curated packages for weight loss, men's vitality, and women's health. Delivered in Kampala."
  },
  blog: {
    path: "/blog",
    title: "BF Suma Uganda Wellness Blog | Health Tips & Product Guides",
    description:
      "Read expert wellness tips from BF Suma Uganda. Learn about immune health, ginseng benefits, gut health, and more to make smarter choices for your daily wellness routine."
  },
  contact: {
    path: "/contact",
    title: "Contact BF Suma Uganda | Kampala Wellness Store",
    description:
      "Reach BF Suma Uganda at Lloyds Mall, Kampala. MTN: +256 778 928 815, Airtel: +256 747 928 920. WhatsApp us for fast support and product guidance."
  },
  partnership: {
    path: "/partnership",
    title: "Become a BF Suma Distributor in Uganda | Join the Wellness Network",
    description:
      "Join BF Suma Uganda as a distributor or wellness partner. Earn from a growing health supplements business in Uganda. Learn about partnership opportunities today."
  }
} as const;

export const CATEGORY_SEO = {
  "immune-boosters": {
    path: "/category/immune-boosters",
    title: "Immune Support Supplements Uganda | BF Suma Immune Range",
    description:
      "Shop BF Suma immune support supplements in Uganda, including Reishi Coffee, Cordyceps Coffee and Ganoderma products. Order online or WhatsApp."
  },
  "digestive-health": {
    path: "/category/digestive-health",
    title: "Digestive Health Supplements Uganda | BF Suma Gut Support",
    description:
      "Browse BF Suma digestive health supplements in Uganda for gut comfort, regularity and daily digestive support. Clear prices and local support."
  },
  "cardiovascular-health": {
    path: "/category/cardiovascular-health",
    title: "Heart & Cardiovascular Wellness Uganda | BF Suma",
    description:
      "Support everyday heart and circulation wellness with BF Suma cardiovascular products in Uganda, including Detoxilive Pro Oil and MicrO2 Cycle."
  },
  "skincare-youth-series": {
    path: "/category/skincare-youth-series",
    title: "BF Suma Skincare Uganda | Youth Series for Healthy Skin",
    description:
      "Explore BF Suma Youth Series skincare in Uganda for cleansing, hydration and healthy-looking skin. Shop authentic products with local support."
  },
  "womens-health": {
    path: "/category/womens-health",
    title: "Women's Wellness Supplements Uganda | BF Suma",
    description:
      "Shop BF Suma women's wellness products in Uganda, including FemiBiotics, FemiVitamins and FemiCare Cleanser. Clear prices and guidance."
  },
  "mens-health": {
    path: "/category/mens-health",
    title: "Men's Wellness Supplements Uganda | BF Suma Vitality Range",
    description:
      "Shop BF Suma men's wellness supplements in Uganda for energy, prostate support and vitality, including ProstatRelax and X Power products."
  },
  "bone-joint-care": {
    path: "/category/bone-joint-care",
    title: "Bone & Joint Supplements Uganda | BF Suma Joint Support",
    description:
      "Shop BF Suma bone and joint care products in Uganda, including Arthro Xtra and GluzoJoint-Ultra Pro. Support mobility, comfort and strength."
  },
  "premium-selected": {
    path: "/category/premium-selected",
    title: "Premium BF Suma Supplements Uganda | Advanced Wellness",
    description:
      "Explore BF Suma premium supplements in Uganda, including NMN Coffee, NMN Sharp Mind and advanced formulas for daily wellness support."
  }
} as const;

const BLOG_SEO_TITLE_OVERRIDES: Record<string, string> = {
  "understanding-power-reishi-mushrooms-immune-health":
    "Reishi Mushroom Benefits: Immune Support Guide",
  "complete-guide-ginseng-energy-focus-vitality":
    "Ginseng Benefits for Energy, Focus & Vitality",
  "skin-health-within-science-youth-essence":
    "Skin Health Tips: Nutrition, Routine & Youth Essence",
  "building-strong-immune-system-complete-wellness-guide":
    "How to Support Your Immune System Naturally",
  "natural-ways-boost-energy-levels-throughout-day":
    "Natural Ways to Boost Energy Levels",
  "gut-health-connection-why-digestive-system-matters":
    "Gut Health Guide: Digestion, Immunity & Daily Habits",
  "sleep-better-tonight-science-backed-tips-quality-rest":
    "How to Sleep Better Naturally: Practical Tips",
  "stress-management-practical-tools-modern-life":
    "Stress Management Tips for Everyday Life"
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

function normalizeCanonicalPath(path: string): string {
  const clean = path.trim() || "/";

  if (/^https?:\/\//i.test(clean)) {
    const url = new URL(clean);
    return `${url.pathname}${url.search}` || "/";
  }

  return clean.startsWith("/") ? clean : `/${clean}`;
}

function withSiteName(title: string): string {
  const clean = normalizeSeoCopy(title);
  const lower = clean.toLowerCase();

  if (
    lower.includes(SITE_NAME.toLowerCase()) ||
    lower.includes(BRAND_NAME.toLowerCase()) ||
    lower.includes(APP_NAME.toLowerCase())
  ) {
    return clean;
  }

  return `${clean} | ${SITE_NAME}`;
}

export function clampMetaDescription(
  text: string,
  maxLength: number = META_DESCRIPTION_LIMIT
): string {
  const clean = normalizeSeoCopy(text);
  if (clean.length <= maxLength) return clean;

  const clipped = clean
    .slice(0, Math.max(0, maxLength - 1))
    .replace(/[,\s:;.-]+$/g, "");

  return `${clipped}…`;
}

export function toComplianceSafeSnippet(text: string): string {
  return normalizeSeoCopy(text)
    .replace(/\b(cure|cures|cured|curing)\b/gi, "support")
    .replace(/\b(treat|treats|treated|treating)\b/gi, "support")
    .replace(/\b(heal|heals|healed|healing)\b/gi, "support")
    .replace(/\b(reverse|reverses|reversed|reversing)\b/gi, "support")
    .replace(/\b(prevent|prevents|prevented|preventing)\b/gi, "support")
    .replace(/\bguaranteed\b/gi, "")
    .replace(/\banti[-\s]?cancer\b/gi, "wellness support")
    .replace(/\brelieve(s|d)?\b/gi, "support");
}

export function getSiteMetadataBase(): URL {
  const envUrl = toValidUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  );

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
  noIndex?: boolean;
}

export function buildStorefrontMetadata({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_SOCIAL_IMAGE,
  keywords,
  noIndex = false
}: BuildStorefrontMetadataInput): Metadata {
  const canonicalPath = normalizeCanonicalPath(path);
  const fullTitle = withSiteName(title);
  const cleanDescription = clampMetaDescription(
    toComplianceSafeSnippet(description)
  );
  const absoluteImage = toAbsoluteUrl(image);

  return {
    metadataBase: getSiteMetadataBase(),
    title: fullTitle,
    description: cleanDescription,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: canonicalPath
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1
      }
    },
    openGraph: {
      title: fullTitle,
      description: cleanDescription,
      type,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: "en_UG",
      images: [
        {
          url: absoluteImage,
          alt: fullTitle,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: cleanDescription,
      images: [absoluteImage]
    }
  };
}

export type StaticSeoKey = keyof typeof STATIC_PAGE_SEO;

export function buildStaticPageMetadata(key: StaticSeoKey): Metadata {
  const seo = STATIC_PAGE_SEO[key];

  return buildStorefrontMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.path
  });
}

export function getCategorySeo(slug: string, fallbackName: string): SeoEntry {
  const known = CATEGORY_SEO[slug as keyof typeof CATEGORY_SEO];

  if (known) {
    return {
      title: known.title,
      description: known.description,
      path: known.path
    };
  }

  const categoryName = normalizeSeoCopy(fallbackName);

  return {
    path: `/category/${slug}`,
    title: `${categoryName} Products Uganda | ${SITE_NAME}`,
    description: clampMetaDescription(
      `Shop BF Suma ${categoryName.toLowerCase()} products in Uganda. Compare options, see clear UGX prices and order with local support.`
    )
  };
}

export function buildCategoryMetadata(
  slug: string,
  fallbackName: string
): Metadata {
  const seo = getCategorySeo(slug, fallbackName);

  return buildStorefrontMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.path
  });
}

export function buildProductMetaDescription(params: {
  name: string;
  categoryName: string;
  description: string;
}): string {
  const category = params.categoryName.trim().toLowerCase();
  const benefit = toComplianceSafeSnippet(
    params.description || `Daily ${category} wellness support.`
  );

  return clampMetaDescription(
    `${params.name} by BF Suma Uganda. ${benefit} Shop with clear UGX pricing, Kampala support and WhatsApp ordering.`
  );
}

export function buildProductLeadDescription(params: {
  name: string;
  categoryName: string;
  description: string;
}): string {
  const source = toComplianceSafeSnippet(params.description);

  if (!source) {
    return `${params.name} is an authentic BF Suma ${params.categoryName.toLowerCase()} product available in Uganda for daily wellness routines.`;
  }

  const prefix = `${params.name} is an authentic BF Suma ${params.categoryName.toLowerCase()} product available in Uganda.`;

  if (source.toLowerCase().startsWith(params.name.toLowerCase())) {
    return `${source} Shop with clear pricing, Kampala support and WhatsApp ordering.`;
  }

  return `${prefix} ${source}`;
}

export function getBlogSeoTitle(slug: string, fallbackTitle: string): string {
  return BLOG_SEO_TITLE_OVERRIDES[slug] || fallbackTitle;
}

export function buildBlogMetaDescription(params: {
  title: string;
  excerpt: string;
}): string {
  const excerpt = toComplianceSafeSnippet(params.excerpt);

  return clampMetaDescription(
    `${params.title}. BF Suma Uganda guide: ${excerpt}`
  );
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: siteUrl,
    logo: toAbsoluteUrl("/bf-suma-logo.png"),
    image: toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE),
    email: SUPPORT_EMAIL,
    telephone: SUPPORT_PHONE,
    areaServed: [
      {
        "@type": "Country",
        name: "Uganda"
      },
      {
        "@type": "City",
        name: "Kampala"
      }
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE,
        areaServed: "UG",
        availableLanguage: ["English"]
      }
    ]
  };
}

export function buildLocalBusinessJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: SITE_NAME,
    image: toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE),
    logo: toAbsoluteUrl("/bf-suma-logo.png"),
    url: siteUrl,
    telephone: ["+256778928815", "+256747928920"],
    email: SUPPORT_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot 1 Entebbe Road, Lloyds Mall, 2nd Floor Room F9",
      addressLocality: "Kampala",
      addressCountry: "UG"
    },
    openingHours: "Mo-Sa 09:00-18:00",
    priceRange: "UGX 4,500 - UGX 783,000",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61568820027321",
      "https://instagram.com/bfsumaugandaoriginal",
      "https://tiktok.com/bfsuma_ugandaoriginal",
      "https://x.com/BfsumaUga",
      "https://youtube.com/@Bfsumaugandaoriginal"
    ],
    parentOrganization: {
      "@id": `${siteUrl}/#organization`
    },
    areaServed: {
      "@type": "Country",
      name: "Uganda"
    }
  };
}

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    alternateName: BRAND_NAME,
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}/#organization`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
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
      item: toAbsoluteUrl(item.url)
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
        text: toComplianceSafeSnippet(faq.answer)
      }
    }))
  };
}

export interface ArticleJsonLdParams {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
}

export function buildArticleJsonLd(params: ArticleJsonLdParams) {
  const siteUrl = getSiteUrl();
  const articleUrl = toAbsoluteUrl(`/blog/${params.slug}`);
  const authorName = params.authorName || `${SITE_NAME} Health Team`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: params.title,
    description: clampMetaDescription(
      toComplianceSafeSnippet(params.description)
    ),
    image: [toAbsoluteUrl(params.image || DEFAULT_SOCIAL_IMAGE)],
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    author: {
      "@type": params.authorUrl ? "Person" : "Organization",
      name: authorName,
      ...(params.authorUrl ? { url: toAbsoluteUrl(params.authorUrl) } : {})
    },
    publisher: {
      "@id": `${siteUrl}/#organization`
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    }
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
  const siteUrl = getSiteUrl();

  const availabilityMap = {
    in_stock: "https://schema.org/InStock",
    out_of_stock: "https://schema.org/OutOfStock",
    preorder: "https://schema.org/PreOrder"
  };

  const productUrl = toAbsoluteUrl(`/shop/${params.slug}`);
  const hasValidRating =
    typeof params.ratingValue === "number" &&
    typeof params.reviewCount === "number" &&
    params.reviewCount > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: params.name,
    description: toComplianceSafeSnippet(params.description),
    sku: params.sku,
    category: params.category,
    image: params.images.map((img) => toAbsoluteUrl(img)),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME
    },
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: params.currency,
      price: params.price.toFixed(2),
      availability: availabilityMap[params.availability],
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${siteUrl}/#organization`
      }
    },
    ...(hasValidRating
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
