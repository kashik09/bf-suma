import { LegalPage } from "@/components/layout/legal-page";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildStorefrontMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-static";

export const metadata = buildStorefrontMetadata({
  title: `No Refund Policy | ${APP_NAME}`,
  description:
    "Read BF Suma's no-refund terms before checkout so you understand that all purchases are final and non-refundable.",
  path: "/refund-policy"
});

const refundPolicyToc = [
  { id: "all-sales-are-final", label: "All Sales Are Final" },
  { id: "why-we-have-this-policy", label: "Why We Have This Policy" },
  { id: "what-this-means", label: "What This Means" },
  { id: "questions", label: "Questions" }
] as const;

export default function RefundPolicyPage() {
  const whatsappLink = buildWhatsAppUrl("Hello, I have a question before purchasing.", SUPPORT_WHATSAPP_PHONE);

  return (
    <LegalPage title="No Refund Policy" lastUpdated="April 2026" toc={[...refundPolicyToc]}>
      <p>
        All sales are final. We do not offer refunds under any circumstances. By completing a purchase
        on bfsumauganda.com, you acknowledge and agree that all sales are final and non-refundable.
      </p>

      <h2 id="all-sales-are-final">All Sales Are Final</h2>
      <p>
        We do not offer refunds under any circumstances once an order is placed and confirmed.
      </p>

      <h2 id="why-we-have-this-policy">Why We Have This Policy</h2>
      <p>
        BF Suma products are health and wellness consumables. Once dispatched, we cannot accept returns
        or issue refunds.
      </p>

      <h2 id="what-this-means">What This Means</h2>
      <ul>
        <li>No refunds for change of mind</li>
        <li>No refunds for unused or partially used products</li>
        <li>No refunds after delivery</li>
        <li>All purchases are considered final at checkout</li>
      </ul>

      <h2 id="questions">Questions</h2>
      <p>
        If you have questions before purchasing, contact us via{" "}
        <a href={whatsappLink} rel="noreferrer" target="_blank">WhatsApp</a> or email at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> before placing your order.
      </p>
    </LegalPage>
  );
}
