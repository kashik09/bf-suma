import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingCTA() {
  return (
    <a
      className="fixed bottom-5 right-5 z-30 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-card hover:bg-brand-700"
      href={buildWhatsAppUrl("Hello BF Suma, I want to place an order.", SUPPORT_WHATSAPP_PHONE)}
      rel="noreferrer"
      target="_blank"
    >
      WhatsApp
    </a>
  );
}
