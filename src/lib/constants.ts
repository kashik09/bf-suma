import type {
  AdminRole,
  DeliveryStatus,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  StorefrontCategory,
  StorefrontProduct
} from "@/types";

export const APP_NAME = "BF Suma";
export const APP_DESCRIPTION = "Trusted household essentials with clear pricing and fast support.";

export const SUPPORT_EMAIL = "support@bfsuma.com";
export const SUPPORT_PHONE = "+256700000000";
export const SUPPORT_WHATSAPP_PHONE = "256700000000";

export const WHATSAPP_PHONE = SUPPORT_WHATSAPP_PHONE;

export const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"];
export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED"
];
export const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "FAILED", "REFUNDED"];
export const DELIVERY_STATUSES: DeliveryStatus[] = [
  "UNASSIGNED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED"
];
export const INQUIRY_STATUSES: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
export const ADMIN_ROLES: AdminRole[] = ["SUPER_ADMIN", "OPERATIONS", "SUPPORT"];

export const STORE_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Drivers", href: "/admin/drivers" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" }
] as const;

export const TRUST_STRIP_ITEMS = [
  "Transparent pricing",
  "Fast local delivery",
  "WhatsApp-first support",
  "Quality checked essentials"
] as const;

export const SHOP_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" }
] as const;

export const DELIVERY_ESTIMATE_TEXT = "Delivery estimate: same day in city, 1-2 days nearby areas.";

export const FALLBACK_CATEGORIES: StorefrontCategory[] = [
  {
    id: "cat-cleaning",
    name: "Cleaning",
    slug: "cleaning",
    description: "Everyday cleaning and hygiene products.",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "cat-home-care",
    name: "Home Care",
    slug: "home-care",
    description: "Core home essentials for daily use.",
    image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "cat-kitchen",
    name: "Kitchen",
    slug: "kitchen",
    description: "Reliable kitchen basics and supplies.",
    image_url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "cat-personal-care",
    name: "Personal Care",
    slug: "personal-care",
    description: "Personal care and hygiene picks.",
    image_url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=60"
  }
];

export const FALLBACK_PRODUCTS: StorefrontProduct[] = [
  {
    id: "prod-multi-surface-cleaner",
    name: "Multi-Surface Cleaner",
    slug: "multi-surface-cleaner",
    description: "All-purpose cleaner for home and office surfaces.",
    price: 18500,
    compare_at_price: 22000,
    sku: "BFS-CLEAN-001",
    stock_qty: 34,
    status: "ACTIVE",
    category_id: "cat-cleaning",
    category_name: "Cleaning",
    category_slug: "cleaning",
    image_url: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=60",
    gallery_urls: [
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=60",
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=60"
    ],
    availability: "in_stock"
  },
  {
    id: "prod-dish-soap",
    name: "Dishwashing Liquid",
    slug: "dishwashing-liquid",
    description: "Grease-cut formula with fresh citrus scent.",
    price: 9500,
    compare_at_price: null,
    sku: "BFS-KITCH-002",
    stock_qty: 12,
    status: "ACTIVE",
    category_id: "cat-kitchen",
    category_name: "Kitchen",
    category_slug: "kitchen",
    image_url: "https://images.unsplash.com/photo-1615486511241-469b0d0ba668?auto=format&fit=crop&w=900&q=60",
    gallery_urls: [
      "https://images.unsplash.com/photo-1615486511241-469b0d0ba668?auto=format&fit=crop&w=900&q=60"
    ],
    availability: "low_stock"
  },
  {
    id: "prod-laundry-powder",
    name: "Laundry Powder 2kg",
    slug: "laundry-powder-2kg",
    description: "Deep clean formula for everyday laundry needs.",
    price: 28000,
    compare_at_price: 32000,
    sku: "BFS-CLEAN-003",
    stock_qty: 0,
    status: "OUT_OF_STOCK",
    category_id: "cat-cleaning",
    category_name: "Cleaning",
    category_slug: "cleaning",
    image_url: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=900&q=60",
    gallery_urls: [
      "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=900&q=60"
    ],
    availability: "out_of_stock"
  },
  {
    id: "prod-hand-wash",
    name: "Moisturizing Hand Wash",
    slug: "moisturizing-hand-wash",
    description: "Gentle formula for frequent daily use.",
    price: 12000,
    compare_at_price: null,
    sku: "BFS-PCARE-004",
    stock_qty: 23,
    status: "ACTIVE",
    category_id: "cat-personal-care",
    category_name: "Personal Care",
    category_slug: "personal-care",
    image_url: "https://images.unsplash.com/photo-1584305574647-acf8069a0f4c?auto=format&fit=crop&w=900&q=60",
    gallery_urls: [
      "https://images.unsplash.com/photo-1584305574647-acf8069a0f4c?auto=format&fit=crop&w=900&q=60"
    ],
    availability: "in_stock"
  },
  {
    id: "prod-floor-disinfectant",
    name: "Floor Disinfectant",
    slug: "floor-disinfectant",
    description: "Long-lasting hygiene protection for tiled surfaces.",
    price: 21000,
    compare_at_price: null,
    sku: "BFS-HOME-005",
    stock_qty: 9,
    status: "ACTIVE",
    category_id: "cat-home-care",
    category_name: "Home Care",
    category_slug: "home-care",
    image_url: "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=60",
    gallery_urls: [
      "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=60"
    ],
    availability: "low_stock"
  },
  {
    id: "prod-sponge-pack",
    name: "Kitchen Sponge Pack",
    slug: "kitchen-sponge-pack",
    description: "Durable non-scratch sponge set of 6.",
    price: 6500,
    compare_at_price: null,
    sku: "BFS-KITCH-006",
    stock_qty: 58,
    status: "ACTIVE",
    category_id: "cat-kitchen",
    category_name: "Kitchen",
    category_slug: "kitchen",
    image_url: "https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=900&q=60",
    gallery_urls: [
      "https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=900&q=60"
    ],
    availability: "in_stock"
  }
];
