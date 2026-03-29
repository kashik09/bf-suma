import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingCTA() {
  return (
    <a
      className="fixed bottom-5 right-5 z-30 inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-card transition hover:bg-slate-800"
      href={buildWhatsAppUrl("Hello BF Suma, I want to place an order.", SUPPORT_WHATSAPP_PHONE)}
      rel="noreferrer"
      target="_blank"
    >
      WhatsApp
    </a>
  );
}
