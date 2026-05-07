import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { CONTACT, ADDRESS, MAPS_URL } from "@/config/contact";
import { buildWhatsAppFooterSupportMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function QuickContactCard() {
  const whatsappUrl = buildWhatsAppUrl(buildWhatsAppFooterSupportMessage(), CONTACT.whatsappPrimary);

  return (
    <div className="space-y-4">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-green-300 hover:bg-green-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <MessageCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">WhatsApp us</p>
          <p className="text-sm text-slate-500">Fastest response</p>
        </div>
      </a>

      <a
        href="mailto:support@bfsumauganda.com"
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
          <Mail className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">support@bfsumauganda.com</p>
          <p className="text-sm text-slate-500">We reply within 24 hours</p>
        </div>
      </a>

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Phone className="h-5 w-5 text-slate-600" />
        </div>
        <div className="space-y-1">
          <a href={`tel:${CONTACT.whatsappPrimary}`} className="block text-sm font-medium text-slate-900 hover:text-brand-600">
            {CONTACT.whatsappPrimaryDisplay} <span className="text-slate-400">({CONTACT.whatsappPrimaryLabel})</span>
          </a>
          <a href={`tel:${CONTACT.whatsappSecondary}`} className="block text-sm font-medium text-slate-900 hover:text-brand-600">
            {CONTACT.whatsappSecondaryDisplay} <span className="text-slate-400">({CONTACT.whatsappSecondaryLabel})</span>
          </a>
        </div>
      </div>

      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <MapPin className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{ADDRESS.line1}</p>
          <p className="text-sm text-slate-500">{ADDRESS.line2}, {ADDRESS.city}</p>
        </div>
      </a>

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Clock className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <p className="font-medium text-slate-900">Open hours</p>
          <p className="text-sm text-slate-500">8 AM – 6 PM, Monday to Saturday</p>
        </div>
      </div>
    </div>
  );
}
