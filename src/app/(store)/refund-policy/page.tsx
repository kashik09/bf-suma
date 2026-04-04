import { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Refund Policy | ${APP_NAME}`,
  description: "Learn about BF Suma's return, exchange, and refund policies."
};

export default function RefundPolicyPage() {
  const whatsappLink = buildWhatsAppUrl("Hello, I have a question about a refund.", SUPPORT_WHATSAPP_PHONE);

  return (
    <LegalPage title="Refund Policy" lastUpdated="April 2026">
      <p>
        At BF Suma, we want you to be completely satisfied with your purchase. This policy outlines
        our guidelines for returns, exchanges, and refunds.
      </p>

      <h2>Return Eligibility</h2>
      <p>You may request a return or exchange if:</p>
      <ul>
        <li>The product is damaged or defective upon delivery</li>
        <li>You received the wrong product</li>
        <li>The product is significantly different from its description</li>
      </ul>

      <h3>Timeframe</h3>
      <p>
        Return requests must be made within <strong>7 days</strong> of receiving your order.
        Please contact us immediately if you notice any issues with your delivery.
      </p>

      <h3>Condition Requirements</h3>
      <p>For a return to be accepted:</p>
      <ul>
        <li>Products must be unused and in original packaging</li>
        <li>Seals must be intact (for sealed products)</li>
        <li>All original accessories and documentation must be included</li>
        <li>You must provide proof of purchase (order number or receipt)</li>
      </ul>

      <h2>Non-Returnable Items</h2>
      <p>The following items cannot be returned:</p>
      <ul>
        <li>Products that have been opened, used, or consumed</li>
        <li>Products returned after 7 days without prior approval</li>
        <li>Products damaged due to misuse or improper storage</li>
        <li>Items marked as final sale or non-returnable</li>
      </ul>

      <h2>How to Request a Return</h2>
      <ol>
        <li>
          <strong>Contact us:</strong> Reach out via{" "}
          <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a> or email at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within 7 days of delivery.
        </li>
        <li>
          <strong>Provide details:</strong> Include your order number, photos of the issue, and
          a description of the problem.
        </li>
        <li>
          <strong>Wait for approval:</strong> Our team will review your request and respond within
          24-48 hours.
        </li>
        <li>
          <strong>Return the product:</strong> If approved, we&apos;ll arrange pickup or provide
          instructions for returning the item.
        </li>
      </ol>

      <h2>Refund Process</h2>
      <h3>Refund Methods</h3>
      <p>Once we receive and inspect the returned item, we will process your refund via:</p>
      <ul>
        <li>Mobile money (M-Pesa, Airtel Money)</li>
        <li>Bank transfer</li>
        <li>Store credit (if preferred)</li>
      </ul>

      <h3>Processing Time</h3>
      <p>
        Refunds are typically processed within <strong>3-5 business days</strong> after we receive
        the returned item. The time for the refund to appear in your account may vary depending on
        your payment provider.
      </p>

      <h3>Refund Amount</h3>
      <p>
        You will receive a full refund of the product price. Original delivery fees are non-refundable
        unless the return is due to our error (wrong item, defective product, etc.).
      </p>

      <h2>Exchanges</h2>
      <p>
        If you prefer an exchange rather than a refund, we&apos;ll send a replacement product once
        we receive the original item. If the replacement has a different price:
      </p>
      <ul>
        <li>If cheaper, we&apos;ll refund the difference</li>
        <li>If more expensive, you&apos;ll pay the difference before shipment</li>
      </ul>

      <h2>Damaged in Transit</h2>
      <p>
        If your order arrives damaged, please take photos immediately and contact us within 24 hours.
        We will arrange for a replacement or full refund at no additional cost to you.
      </p>

      <h2>Order Cancellation</h2>
      <p>
        You may cancel your order free of charge before it is dispatched. Once the order is out for
        delivery, standard return policies apply.
      </p>

      <h2>Questions?</h2>
      <p>
        If you have any questions about our refund policy, please contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or via{" "}
        <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>. We&apos;re here to help!
      </p>
    </LegalPage>
  );
}
