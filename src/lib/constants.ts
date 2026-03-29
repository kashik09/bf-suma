import type {
  AdminRole,
  DeliveryStatus,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus
} from "@/types";

export const APP_NAME = "BF Suma";
export const APP_DESCRIPTION = "Trusted wellness essentials with clear pricing and fast local support.";

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
  { label: "Contact", href: "/contact" }
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" }
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
