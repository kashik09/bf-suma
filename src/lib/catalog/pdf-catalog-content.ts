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

export function listPdfFaqEntries(): PdfFaqEntry[] {
  return PDF_CATALOG_CONTENT.websiteContentMapping.faq;
}

export function listPdfProducts(): PdfProduct[] {
  return PDF_CATALOG_CONTENT.products;
}

export function getPdfProductBySlug(slug: string): PdfProduct | null {
  return PDF_CATALOG_CONTENT.products.find((product) => product.slug === slug) || null;
}

export function listPdfComplianceFlags(): string[] {
  return PDF_CATALOG_CONTENT.manualReview.complianceSensitiveClaims;
}

export function getPdfExtractionMetadata() {
  return PDF_CATALOG_CONTENT.metadata;
}
