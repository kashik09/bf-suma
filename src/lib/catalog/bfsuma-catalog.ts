/**
 * Category Image Resolution
 *
 * Maps category slugs to their corresponding image paths.
 * Used by the catalog service to resolve category images.
 */

const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  skincare: "/category-images/01-skincare.jpg",
  "skincare-youth-series": "/category-images/01-skincare.jpg",
  "anti-aging": "/category-images/02-anti-aging.jpg",
  "premium-selected": "/category-images/02-anti-aging.jpg",
  beverages: "/category-images/03-beverages.jpg",
  "cardiovascular-health": "/category-images/03-beverages.jpg",
  supplements: "/category-images/04-supplements.jpg",
  "immune-booster": "/category-images/04-supplements.jpg",
  "immune-boosters": "/category-images/04-supplements.jpg",
  "joint-health": "/category-images/05-joint-health.jpg",
  "bone-joint-care": "/category-images/05-joint-health.jpg",
  "bone-health": "/category-images/06-bone-health.jpg",
  "digestive-health": "/category-images/07-digestive-health.jpg",
  "personal-care": "/category-images/08-personal-care.jpg",
  "suma-living": "/category-images/08-personal-care.jpg",
  "weight-management": "/category-images/09-weight-management.jpg",
  "womens-health": "/category-images/10-womens-health.jpg",
  "womens-beauty": "/category-images/10-womens-health.jpg",
  "mens-health": "/category-images/11-mens-health.jpg",
  "brain-health": "/category-images/12-brain-health.jpg",
  "smart-kids": "/category-images/12-brain-health.jpg",
  detox: "/category-images/13-detox.jpg"
};

function normalizeCategorySlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveCategoryImageBySlug(slug?: string | null, categoryName?: string | null): string {
  const slugCandidate = normalizeCategorySlug(slug || "");
  const nameCandidate = normalizeCategorySlug(categoryName || "");

  const candidates = [slugCandidate, nameCandidate].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const directMatch = CATEGORY_IMAGE_BY_SLUG[candidate];
    if (directMatch) return directMatch;
  }

  return "";
}
