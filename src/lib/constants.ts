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
const DEFAULT_SUPPORT_PHONE = "+256700000000";

function parseSupportPhones(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function normalizeWhatsappPhone(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length > 0 ? digitsOnly : DEFAULT_SUPPORT_PHONE.replace(/\D/g, "");
}

const configuredSupportPhones = parseSupportPhones(process.env.NEXT_PUBLIC_SUPPORT_PHONES);
const configuredSupportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
const configuredWhatsappPhone = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  ?? process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_PHONE
)?.trim();

const fallbackSupportPhone = configuredSupportPhone && configuredSupportPhone.length > 0
  ? configuredSupportPhone
  : DEFAULT_SUPPORT_PHONE;

export const SUPPORT_PHONES = configuredSupportPhones.length > 0
  ? configuredSupportPhones
  : [fallbackSupportPhone];

export const SUPPORT_PHONE = SUPPORT_PHONES[0];

export const SUPPORT_WHATSAPP_PHONE = configuredWhatsappPhone && configuredWhatsappPhone.length > 0
  ? normalizeWhatsappPhone(configuredWhatsappPhone)
  : normalizeWhatsappPhone(SUPPORT_PHONE);

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
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
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

export const SHOP_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" }
] as const;

export const DELIVERY_ESTIMATE_TEXT = "Delivery estimate: same day in city, 1-2 days nearby areas.";
