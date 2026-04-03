import { WHATSAPP_PHONE } from "@/lib/constants";

export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_PHONE) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppGeneralHelpMessage(context?: string) {
  if (context?.trim()) {
    return `Hello BF Suma, I need help choosing products. Context: ${context.trim()}.`;
  }
  return "Hello BF Suma, I need help choosing the right product.";
}

export function buildWhatsAppProductInterestMessage(productName: string) {
  return `Hello BF Suma, I am interested in ${productName}. Please guide me before I order.`;
}

export function buildWhatsAppProductOrderMessage(productName: string, quantity: number) {
  return `Hello BF Suma, I want to order ${productName} (${quantity} item${quantity > 1 ? "s" : ""}). Please confirm availability.`;
}

export function buildWhatsAppOrderSupportMessage() {
  return "Hello BF Suma, I need help with my order.";
}
