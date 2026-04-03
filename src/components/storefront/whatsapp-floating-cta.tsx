import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloatingCTA() {
  return (
    <a
      aria-label="Chat with BF Suma on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex h-11 items-center justify-center rounded-full border border-brand-400/40 bg-brand-500 px-4 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600"
      href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("floating_cta"), SUPPORT_WHATSAPP_PHONE)}
      rel="noreferrer"
      target="_blank"
    >
      Need help? WhatsApp
    </a>
  );
}
