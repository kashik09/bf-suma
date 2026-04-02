import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingCTA() {
  return (
    <a
      aria-label="Chat with BF Suma on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex h-11 items-center justify-center rounded-full border border-white/50 bg-gradient-to-r from-brand-500 via-earth-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-card transition hover:brightness-105"
      href={buildWhatsAppUrl("Hello BF Suma, I want to place an order.", SUPPORT_WHATSAPP_PHONE)}
      rel="noreferrer"
      target="_blank"
    >
      Need help? WhatsApp
    </a>
  );
}
