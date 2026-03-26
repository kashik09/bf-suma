/**
 * BF Suma Fallback Catalog
 *
 * Clean catalog module derived from data/catalog/catalog_manifest.json
 * Used as fallback when Supabase is unavailable or catalog is incomplete.
 */

import type { StorefrontCategory, StorefrontProduct, ProductStatus, AvailabilityState } from "@/types";
import { STORE_CURRENCY, toMinorUnits } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const BFSUMA_CATEGORIES: StorefrontCategory[] = [
  {
    id: "cat-skincare",
    name: "Skincare",
    slug: "skincare",
    description: "Premium skincare products for radiant, youthful skin.",
    image_url: "/catalog-images/joshoppers.com/youth-essence-facial-cream.webp"
  },
  {
    id: "cat-anti-aging",
    name: "Anti-Aging",
    slug: "anti-aging",
    description: "Advanced formulas to combat aging and restore vitality.",
    image_url: "/catalog-images/joshoppers.com/nmn-duo-release.webp"
  },
  {
    id: "cat-beverages",
    name: "Beverages",
    slug: "beverages",
    description: "Functional coffees and teas for health and energy.",
    image_url: "/catalog-images/joshoppers.com/ginseng-coffee.png"
  },
  {
    id: "cat-supplements",
    name: "Supplements",
    slug: "supplements",
    description: "Nutritional supplements for overall wellness.",
    image_url: "/catalog-images/joshoppers.com/quad-reishi-capsules.webp"
  },
  {
    id: "cat-joint-health",
    name: "Joint Health",
    slug: "joint-health",
    description: "Support for healthy joints and mobility.",
    image_url: "/catalog-images/joshoppers.com/arthro-xtra-tablets.webp"
  },
  {
    id: "cat-bone-health",
    name: "Bone Health",
    slug: "bone-health",
    description: "Calcium and mineral support for strong bones.",
    image_url: "/catalog-images/joshoppers.com/zaminocal-plus-capsules.webp"
  },
  {
    id: "cat-digestive-health",
    name: "Digestive Health",
    slug: "digestive-health",
    description: "Products for digestive comfort and gut health.",
    image_url: "/catalog-images/joshoppers.com/probio-3-plus.webp"
  },
  {
    id: "cat-personal-care",
    name: "Personal Care",
    slug: "personal-care",
    description: "Daily essentials for personal hygiene and care.",
    image_url: "/catalog-images/joshoppers.com/dr-ts-toothpaste.webp"
  },
  {
    id: "cat-weight-management",
    name: "Weight Management",
    slug: "weight-management",
    description: "Natural solutions for healthy weight control.",
    image_url: "/catalog-images/joshoppers.com/gym-effect-capsules.webp"
  },
  {
    id: "cat-womens-health",
    name: "Women's Health",
    slug: "womens-health",
    description: "Specialized formulas for women's wellness needs.",
    image_url: "/catalog-images/joshoppers.com/femicare-cleanser.webp"
  },
  {
    id: "cat-mens-health",
    name: "Men's Health",
    slug: "mens-health",
    description: "Targeted solutions for men's vitality and wellness.",
    image_url: "/catalog-images/joshoppers.com/xpower-coffee.webp"
  },
  {
    id: "cat-brain-health",
    name: "Brain Health",
    slug: "brain-health",
    description: "Cognitive support for memory and mental clarity.",
    image_url: "/catalog-images/joshoppers.com/cerebrain-tablets.webp"
  },
  {
    id: "cat-detox",
    name: "Detox",
    slug: "detox",
    description: "Natural cleansing and detoxification support.",
    image_url: "/catalog-images/joshoppers.com/detoxilive-capsules.webp"
  }
];

// ---------------------------------------------------------------------------
// Category lookup helpers
// ---------------------------------------------------------------------------

const CATEGORY_BY_SLUG = new Map(BFSUMA_CATEGORIES.map((cat) => [cat.slug, cat]));

function getCategoryInfo(slug: string | null | undefined): {
  id: string;
  name: string;
  slug: string;
} {
  const cat = slug ? CATEGORY_BY_SLUG.get(slug) : undefined;
  if (cat) {
    return { id: cat.id, name: cat.name, slug: cat.slug };
  }
  // Default to supplements for unconfirmed mappings
  return { id: "cat-supplements", name: "Supplements", slug: "supplements" };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

interface ManifestProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category_slug: string | null;
  image_url: string | null;
  source: string;
}

// Products extracted from manifest - prices in major currency units.
const MANIFEST_PRODUCTS: ManifestProduct[] = [
  // SKINCARE
  { name: "Youth Essence Facial Cream", slug: "youth-essence-facial-cream", description: "Packed with the latest cell technology and mitochondrial repair enzymes, this cream is the ultimate solution for restoring firmness.", price: 5371, compare_at_price: 5967, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/youth-essence-facial-cream.webp", source: "joshoppers.com" },
  { name: "Youth Essence Lotion", slug: "youth-essence-lotion", description: "Contains Niacinamide and Astaxanthin for nourishing and brightening skin without bleaching.", price: 3949, compare_at_price: 4387, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/youth-essence-lotion.webp", source: "joshoppers.com" },
  { name: "Youth Essence Toner", slug: "youth-essence-toner", description: "Designed to restore firmness, hydrate, and protect skin in seconds with advanced technology ingredients.", price: 4265, compare_at_price: 4738, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/youth-essence-toner.webp", source: "joshoppers.com" },
  { name: "Youth Refreshing Facial Cleanser", slug: "youth-refreshing-facial-cleanser", description: "Formulated with niacinamide to improve skin barrier and restore firmness quickly.", price: 3475, compare_at_price: 3861, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/youth-refreshing-facial-cleanser.webp", source: "joshoppers.com" },
  { name: "Youth Essence Facial Mask", slug: "youth-essence-facial-mask", description: "Luxury skincare designed to restore firmness and reduce fine lines in minimal time.", price: 2844, compare_at_price: 3159, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/youth-essence-facial-mask.webp", source: "joshoppers.com" },
  { name: "Anatic Herbal Essence Soap", slug: "anatic-herbal-soap", description: "Combines grapefruit, green tea extract, wild honey for deep hydration and age-defying benefits.", price: 348, compare_at_price: 386, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/anatic-herbal-soap.webp", source: "joshoppers.com" },
  { name: "Derma Repair Body Lotion 150ml", slug: "derma-repair-lotion", description: "Natural botanical ingredients for daily moisturizing and youthful skin health.", price: 3000, compare_at_price: null, currency: "KES", category_slug: "skincare", image_url: "/catalog-images/joshoppers.com/derma-repair-lotion.webp", source: "joshoppers.com" },

  // ANTI-AGING
  { name: "NMN DUO Release", slug: "nmn-duo-release", description: "100% absorbable formula created to fight aging and maximize potential with energy-boosting NAD+ support.", price: 28500, compare_at_price: 32000, currency: "KES", category_slug: "anti-aging", image_url: "/catalog-images/joshoppers.com/nmn-duo-release.webp", source: "joshoppers.com" },
  { name: "NMN Sharp Mind", slug: "nmn-sharp-mind", description: "Contains NMN, Resveratrol, Ginkgo Biloba for cognitive performance and brain health.", price: 31500, compare_at_price: 35000, currency: "KES", category_slug: "anti-aging", image_url: "/catalog-images/joshoppers.com/nmn-sharp-mind.webp", source: "joshoppers.com" },
  { name: "Youth Ever", slug: "youth-ever", description: "Age-defying potion with high absorption rate using cold-pressed technology and six fruits.", price: 22000, compare_at_price: 25000, currency: "KES", category_slug: "anti-aging", image_url: "/catalog-images/joshoppers.com/youth-ever.webp", source: "joshoppers.com" },

  // BEVERAGES
  { name: "Xpower Coffee", slug: "xpower-coffee", description: "Combines organic ginseng and Tongkat Ali for vigor, energy, and enhanced sexual confidence.", price: 2370, compare_at_price: 2633, currency: "KES", category_slug: "beverages", image_url: "/catalog-images/joshoppers.com/xpower-coffee.webp", source: "joshoppers.com" },
  { name: "4 in 1 Ginseng Coffee", slug: "ginseng-coffee", description: "Premium all-natural coffee with ginseng extract for enhanced stamina and energy.", price: 2054, compare_at_price: 2282, currency: "KES", category_slug: "beverages", image_url: "/catalog-images/joshoppers.com/ginseng-coffee.png", source: "joshoppers.com" },
  { name: "4 in 1 Reishi Coffee", slug: "reishi-coffee", description: "Colombian coffee beans with Reishi extract for immune support and rejuvenation.", price: 2054, compare_at_price: 2282, currency: "KES", category_slug: "beverages", image_url: "/catalog-images/joshoppers.com/reishi-coffee.png", source: "joshoppers.com" },
  { name: "4 in 1 Cordyceps Coffee", slug: "cordyceps-coffee", description: "Premium coffee with Cordyceps mushroom extract for energy and vitality.", price: 2054, compare_at_price: 2282, currency: "KES", category_slug: "beverages", image_url: "/catalog-images/wellthessentials.co.ke/cordyceps-coffee.png", source: "wellthessentials.co.ke" },
  { name: "Relivin Tea", slug: "relivin-tea", description: "Caffeine-free herbal tea with green tea and luobuma for stress relief and blood pressure support.", price: 2844, compare_at_price: 3159, currency: "KES", category_slug: "beverages", image_url: "/catalog-images/joshoppers.com/relivin-tea.webp", source: "joshoppers.com" },
  { name: "Gym Ease Tea", slug: "gym-ease-tea", description: "Contains Gymnema (sugar destroyer) for blood sugar control and weight management.", price: 2844, compare_at_price: 3159, currency: "KES", category_slug: "beverages", image_url: "/catalog-images/joshoppers.com/gym-ease-tea.webp", source: "joshoppers.com" },

  // SUPPLEMENTS
  { name: "4 IN 1 Quad Reishi Capsules", slug: "quad-reishi-capsules", description: "Contains Yunzhi, Ganoderma, Chaga extracts for immune support and healthy blood sugar.", price: 5529, compare_at_price: 6143, currency: "KES", category_slug: "supplements", image_url: "/catalog-images/joshoppers.com/quad-reishi-capsules.webp", source: "joshoppers.com" },
  { name: "Pure & Broken Ganoderma Spores (30s)", slug: "pure-ganoderma-spores-30", description: "Premium Ganoderma spores for immune support and overall wellness.", price: 9162, compare_at_price: 10179, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Pure & Broken Ganoderma Spores (60s)", slug: "pure-ganoderma-spores-60", description: "Premium Ganoderma spores for immune support and overall wellness - larger pack.", price: 17375, compare_at_price: 19305, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Pure Broken Ganoderma Spores Oil Capsules (60s)", slug: "ganoderma-spores-oil-60", description: "Premium Ganoderma spores oil for enhanced bioavailability.", price: 20218, compare_at_price: 22464, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Refined Yunzhi Essence", slug: "refined-yunzhi-essence", description: "Refined Yunzhi mushroom essence for immune modulation.", price: 4581, compare_at_price: 5090, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Veggie Veggie", slug: "veggie-veggie", description: "Concentrated vegetable nutrients for daily nutritional support.", price: 4739, compare_at_price: 5265, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Blueberry Chewable Tablets", slug: "blueberry-chewable", description: "Blueberry-flavored chewable tablets for eye health and antioxidant support.", price: 3791, compare_at_price: 4212, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Vitamin C Chewable Tablets", slug: "vitamin-c-chewable", description: "Chewable Vitamin C tablets for immune support.", price: 3159, compare_at_price: 3510, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Elements", slug: "elements", description: "Essential mineral elements for overall health and wellbeing.", price: 4739, compare_at_price: 5265, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "MicrO2 Cycle Tablets", slug: "micro2-cycle", description: "Supports healthy blood circulation and oxygen delivery.", price: 3475, compare_at_price: 3861, currency: "KES", category_slug: "supplements", image_url: null, source: "bfsumaproducts.co.ke" },

  // JOINT HEALTH
  { name: "Gluzo-Joint Capsules", slug: "gluzo-joint-capsules", description: "Super-strength glucosamine supports healthy cartilage and joint mobility.", price: 4423, compare_at_price: 4914, currency: "KES", category_slug: "joint-health", image_url: "/catalog-images/joshoppers.com/gluzo-joint-capsules.webp", source: "joshoppers.com" },
  { name: "Arthro Xtra Tablets", slug: "arthro-xtra-tablets", description: "Combines glucosamine and chondroitin for cartilage support and joint health.", price: 6318, compare_at_price: 7020, currency: "KES", category_slug: "joint-health", image_url: "/catalog-images/joshoppers.com/arthro-xtra-tablets.webp", source: "joshoppers.com" },
  { name: "GluzoJoint-Ultra Pro", slug: "gluzo-joint-ultra-pro", description: "Advanced formula for joint health and mobility - premium strength.", price: 8846, compare_at_price: 9828, currency: "KES", category_slug: "joint-health", image_url: null, source: "bfsumaproducts.co.ke" },

  // BONE HEALTH
  { name: "ZaminoCal Plus Capsules", slug: "zaminocal-plus-capsules", description: "Calcium, zinc, magnesium, selenium formula for bone health and muscle cramp relief.", price: 3633, compare_at_price: 4036, currency: "KES", category_slug: "bone-health", image_url: "/catalog-images/joshoppers.com/zaminocal-plus-capsules.webp", source: "joshoppers.com" },
  { name: "Dr Cow Calcium Milk Candy", slug: "dr-cow-calcium-candy", description: "Cartoon-shaped candies with New Zealand milk providing calcium equivalent of one cup.", price: 3791, compare_at_price: 4212, currency: "KES", category_slug: "bone-health", image_url: "/catalog-images/joshoppers.com/dr-cow-calcium-candy.webp", source: "joshoppers.com" },
  { name: "Calcium & Vitamin D3 Milk Tablets", slug: "calcium-vitamin-d3-milk", description: "Calcium and Vitamin D3 combination for bone strength.", price: 3791, compare_at_price: 4212, currency: "KES", category_slug: "bone-health", image_url: null, source: "bfsumaproducts.co.ke" },

  // DIGESTIVE HEALTH
  { name: "NT Diarr Pills", slug: "nt-diarr-pills", description: "Natural red bamboo pills for instant relief from diarrhea, toothaches, and menstrual discomfort.", price: 1895, compare_at_price: 2106, currency: "KES", category_slug: "digestive-health", image_url: "/catalog-images/joshoppers.com/nt-diarr-pills.webp", source: "joshoppers.com" },
  { name: "Novel Depile Capsules", slug: "novel-depile-capsules", description: "100% natural treatment for hemorrhoid relief without surgery.", price: 3475, compare_at_price: 3861, currency: "KES", category_slug: "digestive-health", image_url: "/catalog-images/joshoppers.com/novel-depile-capsules.webp", source: "joshoppers.com" },
  { name: "Consti Relax Solution", slug: "consti-relax-solution", description: "Contains Radix Astragali and FOS prebiotic for digestive health and toxin removal.", price: 4581, compare_at_price: 5090, currency: "KES", category_slug: "digestive-health", image_url: "/catalog-images/joshoppers.com/consti-relax-solution.webp", source: "joshoppers.com" },
  { name: "Probio 3 Plus", slug: "probio-3-plus", description: "Seven patented bacterial strains for digestive balance and immunity enhancement.", price: 4815, compare_at_price: 5350, currency: "KES", category_slug: "digestive-health", image_url: "/catalog-images/joshoppers.com/probio-3-plus.webp", source: "joshoppers.com" },

  // PERSONAL CARE
  { name: "Cool Roll", slug: "cool-roll", description: "Portable roll-on with plant oils for headaches, muscle aches, mosquito bites.", price: 1896, compare_at_price: 2106, currency: "KES", category_slug: "personal-care", image_url: "/catalog-images/joshoppers.com/cool-roll.webp", source: "joshoppers.com" },
  { name: "Dr. Ts Toothpaste", slug: "dr-ts-toothpaste", description: "4D tooth protection fighting bacteria, repairing gums, strengthening teeth.", price: 869, compare_at_price: 965, currency: "KES", category_slug: "personal-care", image_url: "/catalog-images/joshoppers.com/dr-ts-toothpaste.webp", source: "joshoppers.com" },

  // WEIGHT MANAGEMENT
  { name: "Gym Effect Capsules", slug: "gym-effect-capsules", description: "Gymnema Sylvestris formulation reducing sugar cravings and supporting healthy blood levels.", price: 3159, compare_at_price: 3510, currency: "KES", category_slug: "weight-management", image_url: "/catalog-images/joshoppers.com/gym-effect-capsules.webp", source: "joshoppers.com" },
  { name: "Ez-Xlim", slug: "ez-xlim", description: "Advanced weight management formula for healthy body composition.", price: 8214, compare_at_price: 9126, currency: "KES", category_slug: "weight-management", image_url: null, source: "bfsumaproducts.co.ke" },

  // WOMEN'S HEALTH
  { name: "FemiCare Feminine Cleanser", slug: "femicare-cleanser", description: "Natural ingredients for cleaning, irritation relief, and feminine health maintenance.", price: 1738, compare_at_price: 1931, currency: "KES", category_slug: "womens-health", image_url: "/catalog-images/joshoppers.com/femicare-cleanser.webp", source: "joshoppers.com" },
  { name: "Feminergy Capsules", slug: "feminergy-capsules", description: "Specially formulated for female energy, hormonal balance and vitality.", price: 4739, compare_at_price: 5265, currency: "KES", category_slug: "womens-health", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "Femicalcium D3", slug: "femicalcium-d3", description: "Calcium and Vitamin D3 specifically formulated for women.", price: 5055, compare_at_price: 5616, currency: "KES", category_slug: "womens-health", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "FemiBiotics", slug: "femibiotics", description: "Probiotic formula designed for women's digestive and intimate health.", price: 6318, compare_at_price: 7020, currency: "KES", category_slug: "womens-health", image_url: null, source: "bfsumaproducts.co.ke" },

  // MEN'S HEALTH
  { name: "X Power Man Plus Capsules", slug: "xpower-man-plus", description: "Premium supplement for male vitality and performance enhancement.", price: 6634, compare_at_price: 7371, currency: "KES", category_slug: "mens-health", image_url: null, source: "bfsumaproducts.co.ke" },
  { name: "ProstatRelax Capsules", slug: "prostat-relax", description: "Natural formula for prostate health and urinary function support.", price: 3791, compare_at_price: 4212, currency: "KES", category_slug: "mens-health", image_url: null, source: "bfsumaproducts.co.ke" },

  // BRAIN HEALTH
  { name: "CereBrain Tablets", slug: "cerebrain-tablets", description: "Ginkgo Biloba formula enhancing blood flow, supporting memory and concentration.", price: 3949, compare_at_price: 4388, currency: "KES", category_slug: "brain-health", image_url: "/catalog-images/joshoppers.com/cerebrain-tablets.webp", source: "joshoppers.com" },

  // DETOX
  { name: "Detoxilive Capsules", slug: "detoxilive-capsules", description: "100% natural, absorbable ingredients promoting liver detoxification and cleansing.", price: 3159, compare_at_price: 3510, currency: "KES", category_slug: "detox", image_url: "/catalog-images/joshoppers.com/detoxilive-capsules.webp", source: "joshoppers.com" }
];

// Default placeholder image for products without images
const DEFAULT_PRODUCT_IMAGE = "/catalog-images/placeholder.webp";

// Generate SKU from slug
function generateSku(slug: string, index: number): string {
  const prefix = slug.substring(0, 3).toUpperCase().replace(/-/g, "");
  return `BFS-${prefix}-${String(index + 1).padStart(3, "0")}`;
}

// Build StorefrontProduct array
export const BFSUMA_PRODUCTS: StorefrontProduct[] = MANIFEST_PRODUCTS
  .map<StorefrontProduct | null>((p, index) => {
    const catInfo = getCategoryInfo(p.category_slug);
    const status: ProductStatus = "ACTIVE";
    const availability: AvailabilityState = "in_stock";
    const currency = (p.currency || STORE_CURRENCY).toUpperCase();
    if (currency !== STORE_CURRENCY) {
      return null;
    }

    const mappedProduct: StorefrontProduct = {
      id: `prod-${p.slug}`,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: toMinorUnits(p.price, currency),
      compare_at_price: p.compare_at_price !== null ? toMinorUnits(p.compare_at_price, currency) : null,
      currency: STORE_CURRENCY,
      sku: generateSku(p.slug, index),
      stock_qty: 50, // Default stock - not invented, just a placeholder
      status,
      category_id: catInfo.id,
      category_name: catInfo.name,
      category_slug: catInfo.slug,
      image_url: p.image_url || DEFAULT_PRODUCT_IMAGE,
      gallery_urls: p.image_url ? [p.image_url] : [DEFAULT_PRODUCT_IMAGE],
      availability
    };

    return mappedProduct;
  })
  .filter((product): product is StorefrontProduct => product !== null);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const BFSUMA_CATALOG = {
  categories: BFSUMA_CATEGORIES,
  products: BFSUMA_PRODUCTS
} as const;

// For backwards compatibility with existing imports
export const BFSUMA_CATALOG_SEED = BFSUMA_CATALOG;
export const BFSUMA_CATALOG_SEED_CATEGORIES = BFSUMA_CATEGORIES;
export const BFSUMA_CATALOG_SEED_PRODUCTS = BFSUMA_PRODUCTS;
