import type {
  AdminRole,
  DeliveryStatus,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus
} from "@/types";
import { CONTACT } from "@/config/contact";

export const APP_NAME = "BF Suma";
export const APP_DESCRIPTION = "Trusted wellness essentials with clear pricing and fast local support.";

export const SUPPORT_EMAIL = "support@bfsumauganda.com";

/** Display format phone for UI (primary) */
export const SUPPORT_PHONE = CONTACT.whatsappPrimaryDisplay;

/** Digits-only for wa.me links */
export const SUPPORT_WHATSAPP_PHONE = CONTACT.whatsappPrimary;
export const WHATSAPP_PHONE = CONTACT.whatsappPrimary;

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
export const ADMIN_ROLES: AdminRole[] = ["SUPER_ADMIN", "OPERATIONS", "EXECUTIVE", "SUPPORT"];

export const STORE_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Health Goals", href: "/packages" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Join Us", href: "/partnership" }
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" }
] as const;

export const TRUST_STRIP_ITEMS = [
  "Transparent pricing and totals",
  "No forced account checkout",
  "Pay on delivery or pickup",
  "Optional WhatsApp guidance"
] as const;

export const DELIVERY_FEE_AMOUNT_MINOR = 5000;

export const SHOP_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" }
] as const;

export const DELIVERY_ESTIMATE_TEXT = "Delivery estimate: same day in city, 1-2 days nearby areas.";

export const PAYMENT_METHODS = {
  CASH: "CASH",
  MTN_MOMO: "MTN_MOMO",
  AIRTEL_MONEY: "AIRTEL_MONEY",
  BANK_TRANSFER: "BANK_TRANSFER",
  OTHER: "OTHER"
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MTN_MOMO: "MTN Mobile Money",
  AIRTEL_MONEY: "Airtel Money",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other"
};
