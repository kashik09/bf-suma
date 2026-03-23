export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
export type CurrencyCode = "KES" | "UGX";
export type DeliveryStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED";
export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type AdminRole = "SUPER_ADMIN" | "OPERATIONS" | "SUPPORT";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  // Integer minor units (for KES, this is cents).
  price: number;
  compare_at_price: number | null;
  currency?: CurrencyCode;
  sku: string;
  stock_qty: number;
  status: ProductStatus;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  whatsapp_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  // Integer minor units (for KES, this is cents).
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency?: CurrencyCode;
  delivery_address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  // Integer minor units (for KES, this is cents).
  unit_price: number;
  quantity: number;
  line_total: number;
  currency?: CurrencyCode;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: DeliveryStatus;
  assigned_at: string | null;
  picked_at: string | null;
  delivered_at: string | null;
  notes: string | null;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  auth_user_id: string | null;
  password_hash: string | null;
  role: AdminRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
}

export type AvailabilityState = "in_stock" | "low_stock" | "out_of_stock";

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  // Integer minor units (for KES, this is cents).
  price: number;
  compare_at_price: number | null;
  currency?: CurrencyCode;
  sku: string;
  stock_qty: number;
  status: ProductStatus;
  category_id: string;
  category_name: string;
  category_slug: string;
  image_url: string;
  gallery_urls: string[];
  availability: AvailabilityState;
}

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  // Integer minor units (for KES, this is cents).
  price: number;
  image_url: string;
  quantity: number;
  max_quantity: number;
  availability: AvailabilityState;
  currency?: CurrencyCode;
}

export interface OrderIntakePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod: "pay_on_delivery" | "pay_now";
  notes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderIntakeResponse {
  persisted: boolean;
  orderNumber?: string;
  receivedAt?: string;
  message: string;
}

export interface Database {
  public: {
    Tables: {
      categories: { Row: Category };
      products: { Row: Product };
      product_images: { Row: ProductImage };
      customers: { Row: Customer };
      orders: { Row: Order };
      order_items: { Row: OrderItem };
      drivers: { Row: Driver };
      deliveries: { Row: Delivery };
      inquiries: { Row: Inquiry };
      admin_users: { Row: AdminUser };
    };
  };
}
