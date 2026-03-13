import { WHATSAPP_PHONE } from "@/lib/constants";

export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_PHONE) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
