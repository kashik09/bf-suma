import pdfCatalogSource from "../../../data/catalog/catalog_pdf.extracted.json";

export interface PdfFaqEntry {
  question: string;
  answer: string;
  sourcePageRefs: string[];
}

export interface PdfWebsiteContent {
  homepage: {
    hero: {
      headline: string;
      supportingText: string;
      sourcePageRefs: string[];
    };
    trustSection: {
      items: string[];
      sourcePageRefs: string[];
    };
    featuredProducts: string[];
  };
  productCards: {
    fieldsToSurface: string[];
  };
  productDetailPages: {
    fieldsToSurface: string[];
    complianceNote: string;
  };
  faq: PdfFaqEntry[];
  about: {
    title: string;
    facts: string[];
    sourcePageRefs: string[];
  };
  disclaimerContact: {
    disclaimer: string;
    contactDataStatus: string;
  };
}

interface PdfProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  currency: string | null;
  sku: string | null;
  stockStatus: string;
  sizes: string[];
  variants: Array<Record<string, unknown>>;
  tags: string[];
  benefits: string[];
  ingredients: string[];
  usageInstructions: string;
  warnings: string[];
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  bundle: boolean;
  sourcePageRefs: string[];
  mappedCatalogSlug: string | null;
}

interface PdfCatalogSource {
  metadata: {
    sourceFile: string;
    sourceType: string;
    extractedAt: string;
    extractionMethod: string;
    traceabilityFormat: string;
    accuracyPolicy: string;
    sourcePagesReviewed?: number;
  };
  brandProfile: {
    brand: string;
    tagline: string;
    companyFacts: Array<{ fact: string; sourcePageRefs: string[] }>;
    certificationsMentioned: Array<{ label: string; status: string; sourcePageRefs: string[] }>;
  };
  contactOrderInfo: {
    orderingChannels: string[];
    phone: string | null;
    email: string | null;
    website: string | null;
    notes: string;
  };
  categories: Array<{ name: string; slug: string; sourcePageRefs: string[] }>;
  products: PdfProduct[];
  websiteContentMapping: PdfWebsiteContent;
  manualReview: {
    unclearOrMissingFields: string[];
    complianceSensitiveClaims: string[];
    requiresManualConfirmation: string[];
  };
}

export const PDF_CATALOG_CONTENT = pdfCatalogSource as PdfCatalogSource;

export interface PdfCatalogProductContent {
  shortDescription: string | null;
  description: string | null;
  benefits: string[];
  ingredients: string[];
  usageInstructions: string | null;
  warnings: string[];
  sourcePageRefs: string[];
  complianceNote: string;
}

export interface PdfCatalogCategoryContent {
  description: string;
  sourcePageRefs: string[];
}

export interface PdfHomepageContent {
  heroHeadline: string;
  heroSupportingText: string;
  heroSourcePageRefs: string[];
  trustItems: string[];
  trustSourcePageRefs: string[];
  companyFacts: string[];
}

const PDF_PRODUCT_BY_MAPPED_CATALOG_SLUG = new Map<string, PdfProduct>(
  PDF_CATALOG_CONTENT.products
    .filter((product) => Boolean(product.mappedCatalogSlug))
    .map((product) => [product.mappedCatalogSlug as string, product])
);

const PDF_PRODUCT_BY_SLUG = new Map<string, PdfProduct>(
  PDF_CATALOG_CONTENT.products.map((product) => [product.slug, product])
);

const PDF_CATEGORY_BY_SLUG = new Map(
  PDF_CATALOG_CONTENT.categories.map((category) => [category.slug, category])
);

const STOREFRONT_TO_PDF_CATEGORY_SLUG: Record<string, string> = {
  "anti-aging": "premium-selected",
  beverages: "better-life",
  "bone-health": "bone-joint-care",
  "digestive-health": "digestive-health",
  "joint-health": "bone-joint-care",
  skincare: "skin-care",
  supplements: "immune-booster"
};

function cleanString(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));
}

export function listPdfFaqEntries(): PdfFaqEntry[] {
  return PDF_CATALOG_CONTENT.websiteContentMapping.faq;
}

export function listPdfProducts(): PdfProduct[] {
  return PDF_CATALOG_CONTENT.products;
}

export function getPdfProductBySlug(slug: string): PdfProduct | null {
  return PDF_CATALOG_CONTENT.products.find((product) => product.slug === slug) || null;
}

export function getPdfProductForCatalogSlug(catalogSlug: string): PdfProduct | null {
  return PDF_PRODUCT_BY_MAPPED_CATALOG_SLUG.get(catalogSlug) || PDF_PRODUCT_BY_SLUG.get(catalogSlug) || null;
}

export function getPdfProductContentForCatalogSlug(catalogSlug: string): PdfCatalogProductContent | null {
  const product = getPdfProductForCatalogSlug(catalogSlug);
  if (!product) return null;

  return {
    shortDescription: cleanString(product.shortDescription),
    description: cleanString(product.description),
    benefits: uniqueStrings(product.benefits || []),
    ingredients: uniqueStrings(product.ingredients || []),
    usageInstructions: cleanString(product.usageInstructions),
    warnings: uniqueStrings(product.warnings || []),
    sourcePageRefs: uniqueStrings(product.sourcePageRefs || []),
    complianceNote: PDF_CATALOG_CONTENT.websiteContentMapping.productDetailPages.complianceNote
  };
}

export function getPdfShortDescriptionForCatalogSlug(catalogSlug: string): string | null {
  return getPdfProductContentForCatalogSlug(catalogSlug)?.shortDescription || null;
}

export function getPdfCategoryContentForStorefrontSlug(storefrontCategorySlug: string): PdfCatalogCategoryContent | null {
  const pdfCategorySlug = STOREFRONT_TO_PDF_CATEGORY_SLUG[storefrontCategorySlug];
  if (!pdfCategorySlug) return null;

  const category = PDF_CATEGORY_BY_SLUG.get(pdfCategorySlug);
  if (!category) return null;

  return {
    description: `Explore products listed under ${category.name} in the BF Suma catalogue.`,
    sourcePageRefs: uniqueStrings(category.sourcePageRefs || [])
  };
}

export function getPdfHomepageContent(): PdfHomepageContent {
  return {
    heroHeadline: PDF_CATALOG_CONTENT.websiteContentMapping.homepage.hero.headline,
    heroSupportingText: PDF_CATALOG_CONTENT.websiteContentMapping.homepage.hero.supportingText,
    heroSourcePageRefs: uniqueStrings(PDF_CATALOG_CONTENT.websiteContentMapping.homepage.hero.sourcePageRefs || []),
    trustItems: uniqueStrings(PDF_CATALOG_CONTENT.websiteContentMapping.homepage.trustSection.items || []),
    trustSourcePageRefs: uniqueStrings(PDF_CATALOG_CONTENT.websiteContentMapping.homepage.trustSection.sourcePageRefs || []),
    companyFacts: uniqueStrings(PDF_CATALOG_CONTENT.brandProfile.companyFacts.map((item) => item.fact))
  };
}

export function listPdfComplianceFlags(): string[] {
  return PDF_CATALOG_CONTENT.manualReview.complianceSensitiveClaims;
}

export function getPdfExtractionMetadata() {
  return PDF_CATALOG_CONTENT.metadata;
}
