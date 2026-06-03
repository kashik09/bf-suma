export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";
export type OrderStatus =
  | "PENDING"
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
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
export type NewsletterSubscriberStatus = "ACTIVE" | "UNSUBSCRIBED";
export type AdminRole = "SUPER_ADMIN" | "OPERATIONS" | "EXECUTIVE" | "SUPPORT";
export type BlogPostStatus = "DRAFT" | "REVIEW" | "PUBLISHED";
export type BlogChannelTarget = "SHOP" | "WHATSAPP" | "NEWSLETTER" | "SOCIAL";

// Partner/Distributor system
export type PartnerRank = "DISTRIBUTOR" | "SILVER" | "GOLD" | "DIAMOND";
export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID";
export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type WellnessGoalType = "DAILY_ENERGY" | "IMMUNE_RESILIENCE" | "DIGESTIVE_HEALTH" | "HEART_HEALTH" | "CUSTOM";

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
  currency: CurrencyCode;
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

export type PaymentMethodCode = "CASH" | "MTN_MOMO" | "AIRTEL_MONEY" | "BANK_TRANSFER" | "OTHER";

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
  currency: CurrencyCode;
  delivery_address: string;
  delivery_zone?: string | null;
  notes: string | null;
  // Payment tracking (optional - added in later migration)
  payment_method?: PaymentMethodCode | null;
  payment_reference?: string | null;
  payment_received_at?: string | null;
  payment_received_by?: string | null;
  payment_notes?: string | null;
  // Delivery tracking (optional - added in later migration)
  delivered_at?: string | null;
  delivered_by?: string | null;
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
  currency: CurrencyCode;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  changed_at: string;
  created_at: string;
}

export type OrderNotificationOutboxStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED";
export type OrderNotificationOutboxEventType = "ORDER_CREATED";

export interface OrderNotificationOutbox {
  id: string;
  order_id: string;
  event_type: OrderNotificationOutboxEventType;
  payload: Record<string, unknown>;
  status: OrderNotificationOutboxStatus;
  attempt_count: number;
  available_at: string;
  last_error: string | null;
  created_at: string;
  updated_at: string;
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

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  context: string | null;
  status: NewsletterSubscriberStatus;
  welcome_email_sent_at: string | null;
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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  author: string;
  tags: string[];
  internal_tags: string[];
  channel_targets: BlogChannelTarget[];
  published_at: string | null;
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
  product_count?: number;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  // Integer minor units (for KES, this is cents).
  price: number;
  compare_at_price: number | null;
  currency: CurrencyCode;
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
  currency: CurrencyCode;
  // Optional bundle tracking for package purchases
  bundle_id?: string;
  bundle_name?: string;
  bundle_image_url?: string;
}

export interface OrderIntakePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod: "pay_on_delivery";
  notes?: string;
  items: Array<{
    product_id: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export type OrderIntakeResultCode =
  | "CREATED"
  | "REPLAYED"
  | "REJECTED"
  | "CONFLICT"
  | "IN_PROGRESS"
  | "TEMPORARY_FAILURE";

export interface OrderIntakeFieldErrors {
  [key: string]: string[];
}

export interface OrderIntakeResponse {
  persisted: boolean;
  resultCode: OrderIntakeResultCode;
  orderNumber?: string;
  receivedAt?: string;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  currency?: CurrencyCode;
  fieldErrors?: OrderIntakeFieldErrors;
  retryAfterSeconds?: number;
  degraded?: boolean;
  errorCode?: string;
  message: string;
}

export interface NewsletterSignupResponse {
  id: string;
  status: "subscribed" | "already_subscribed";
  message: string;
  emailDelivery: "sent" | "skipped" | "failed";
}

// Packages (health bundles containing multiple products)
export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  infographic_image_url: string | null;
  override_price_minor: number | null;
  currency: CurrencyCode;
  dm_keyword: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  package_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export interface PackageItemWithProduct extends PackageItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: CurrencyCode;
    image_url: string;
    stock_qty: number;
    status: ProductStatus;
  };
}

export interface PackageWithItems extends Package {
  items: PackageItemWithProduct[];
}

export interface PackageDisplayData extends PackageWithItems {
  calculated_price: number;
  final_price: number;
  savings: number | null;
  is_in_stock: boolean;
  item_count: number;
}

export type ContactSubmissionStatus = "new" | "responded" | "spam";

export interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip_address: string | null;
  user_agent: string | null;
  status: ContactSubmissionStatus;
  email_sent_at: string | null;
}

export type ContactSubmissionInsert = Omit<ContactSubmission, "id" | "created_at" | "status" | "email_sent_at">;

// Partner/Distributor types
export interface Partner {
  id: string;
  customer_id: string;
  partner_code: string;
  rank: PartnerRank;
  sponsor_id: string | null;
  region: string | null;
  total_volume: number;
  commission_earned: number;
  payout_status: PayoutStatus;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerWithCustomer extends Partner {
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface PartnerLeaderboardItem {
  id: string;
  partner_code: string;
  customer_name: string;
  region: string | null;
  rank: PartnerRank;
  downline_count: number;
  total_volume: number;
  commission_earned: number;
  payout_status: PayoutStatus;
}

export interface PartnerStats {
  total_partners: number;
  active_partners: number;
  network_volume: number;
  commissions_due: number;
  pending_payouts: number;
  total_downline: number;
}

// Loyalty system types (for future backend implementation)
export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  points_balance: number;
  tier: LoyaltyTier;
  points_earned_total: number;
  points_redeemed_total: number;
  tier_progress: number;
  tier_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface WellnessGoal {
  id: string;
  customer_id: string;
  goal_name: string;
  goal_type: WellnessGoalType;
  target_value: number;
  current_value: number;
  is_active: boolean;
  streak_days?: number;
  routine_note?: string;
  created_at: string;
  updated_at: string;
}

// Chart data types
export interface WeeklyRevenue {
  week_start: string;
  week_label: string;
  revenue: number;
}

export interface CategorySales {
  category_id: string;
  category_name: string;
  total_sales: number;
  percentage: number;
}

export interface ActiveOrderTracking {
  order_id: string;
  order_number: string;
  status: OrderStatus;
  estimated_delivery: string | null;
  last_update: string;
  items_count: number;
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
      order_status_history: { Row: OrderStatusHistory };
      order_notification_outbox: { Row: OrderNotificationOutbox };
      drivers: { Row: Driver };
      deliveries: { Row: Delivery };
      inquiries: { Row: Inquiry };
      newsletter_subscribers: { Row: NewsletterSubscriber };
      admin_users: { Row: AdminUser };
      blog_posts: { Row: BlogPost };
      packages: { Row: Package };
      package_items: { Row: PackageItem };
      contact_submissions: { Row: ContactSubmission };
    };
  };
}
