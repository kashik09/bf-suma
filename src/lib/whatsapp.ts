import { WHATSAPP_PHONE } from "@/lib/constants";

export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_PHONE) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * PRODUCT INTEREST (soft intent)
 */
export function buildWhatsAppProductInterestMessage(productName: string) {
  return `Hi! I came across "${productName}" and I’m interested. Could you explain how it works and if it’s right for me?`;
}

/**
 * ORDER INTENT (strong intent)
 */
export function buildWhatsAppProductOrderMessage(productName: string, quantity: number) {
  return `Hi! I’d like to order ${quantity} × "${productName}". Is it available, and how do I proceed?`;
}

/**
 * ORDER SUPPORT
 */
export function buildWhatsAppOrderSupportMessage() {
  return `Hi! I need help with my order.`;
}

/**
 * GENERIC INQUIRY (footer, floating CTA, homepage)
 */
export function buildWhatsAppGenericInquiryMessage() {
  return "Hi! I'd like to ask about BF Suma products.";
}

/**
 * BLOG POST INQUIRY
 */
export function buildWhatsAppBlogMessage(postTitle: string) {
  return `Hi! I just read your article "${postTitle}" — could you recommend products related to this?`;
}

/**
 * FOOTER SUPPORT LINK
 */
export function buildWhatsAppFooterSupportMessage() {
  return "Hi! I have a question about BF Suma — could you help me?";
}

/**
 * FLOATING CTA (bottom-right button)
 */
export function buildWhatsAppFloatingCtaMessage() {
  return "Hi! I'm browsing the BF Suma site and could use some help.";
}

/**
 * HOMEPAGE CTA
 */
export function buildWhatsAppHomepageCtaMessage() {
  return "Hi! I'm new to BF Suma and would like to learn more about your products.";
}

/**
 * BLOG FALLBACK (when no article loaded)
 */
export function buildWhatsAppBlogFallbackMessage() {
  return "Hi! I was reading on the BF Suma site and would like to ask a question.";
}

export interface PaymentConfirmationOrder {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  total: number;
  currency: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress: string;
}

export interface OrderHelpOrder {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  total: number;
  currency: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress: string;
  createdAt: string;
}

/**
 * ORDER HELP (confirmation page "Need help?" button)
 */
export function buildWhatsAppOrderHelpMessage(
  order: OrderHelpOrder,
  totalFormatted: string
) {
  const placedDate = new Date(order.createdAt).toLocaleString("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const fulfillmentLine =
    order.fulfillmentType === "pickup"
      ? "Pickup at shop"
      : `Delivery to: ${order.deliveryAddress}`;

  return `Hi BF Suma,

I need help with my order:
• Order: ${order.orderNumber}
• Name: ${order.customer.firstName} ${order.customer.lastName}
• Placed: ${placedDate}
• Total: ${totalFormatted}
• ${fulfillmentLine}

Issue: [Please describe your issue here]`;
}

/**
 * MTN MoMo payment confirmation
 */
export function buildWhatsAppMtnPaymentMessage(
  order: PaymentConfirmationOrder,
  totalFormatted: string
) {
  const fulfillmentLine =
    order.fulfillmentType === "pickup"
      ? "Pickup between 8 AM and 6 PM at your shop"
      : `Delivery to: ${order.deliveryAddress}`;

  return `Hi BF Suma,

I just paid for my order via MTN MoMo:
• Order: ${order.orderNumber}
• Name: ${order.customer.firstName} ${order.customer.lastName}
• Total: ${totalFormatted}
• ${fulfillmentLine}

Could you confirm receipt? Thanks!`;
}

/**
 * Airtel Money payment confirmation
 */
export function buildWhatsAppAirtelPaymentMessage(
  order: PaymentConfirmationOrder,
  totalFormatted: string
) {
  const fulfillmentLine =
    order.fulfillmentType === "pickup"
      ? "Pickup between 8 AM and 6 PM at your shop"
      : `Delivery to: ${order.deliveryAddress}`;

  return `Hi BF Suma,

I just paid for my order via Airtel Money:
• Order: ${order.orderNumber}
• Name: ${order.customer.firstName} ${order.customer.lastName}
• Total: ${totalFormatted}
• ${fulfillmentLine}

Could you confirm receipt? Thanks!`;
}

/**
 * Cash on arrival payment confirmation
 */
export function buildWhatsAppCashPaymentMessage(
  order: PaymentConfirmationOrder,
  totalFormatted: string
) {
  const fulfillmentLine =
    order.fulfillmentType === "pickup"
      ? "Pickup between 8 AM and 6 PM at your shop"
      : `Delivery to: ${order.deliveryAddress}`;

  return `Hi BF Suma,

I'd like to pay cash for my order:
• Order: ${order.orderNumber}
• Name: ${order.customer.firstName} ${order.customer.lastName}
• Total: ${totalFormatted}
• ${fulfillmentLine}

Please confirm. Thanks!`;
}

export interface CheckoutCartItem {
  name: string;
  quantity: number;
}

/**
 * Checkout page WhatsApp order request (for hesitant customers)
 */
export function buildWhatsAppCheckoutOrderRequestMessage(
  cartItems: CheckoutCartItem[],
  totalFormatted: string
) {
  const itemLines = cartItems
    .map((item) => `• ${item.name} (×${item.quantity})`)
    .join("\n");

  return `Hi BF Suma! I'd like to place an order but would prefer to confirm via WhatsApp. Here's what I want:

${itemLines}

Total estimate: ${totalFormatted}

Could you guide me through the rest?`;
}