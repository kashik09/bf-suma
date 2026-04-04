import { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Shipping Policy | ${APP_NAME}`,
  description: "Learn about BF Suma's shipping methods, delivery times, and fees."
};

export default function ShippingPolicyPage() {
  const whatsappLink = buildWhatsAppUrl("Hello, I have a question about shipping.", SUPPORT_WHATSAPP_PHONE);

  return (
    <LegalPage title="Shipping Policy" lastUpdated="April 2026">
      <p>
        We are committed to delivering your wellness products quickly and safely. This policy explains
        our shipping methods, delivery times, and fees.
      </p>

      <h2>Delivery Areas</h2>
      <p>We currently deliver throughout Uganda, including:</p>
      <ul>
        <li><strong>Kampala and surrounding areas:</strong> Same-day or next-day delivery</li>
        <li><strong>Major towns:</strong> 1-2 business days</li>
        <li><strong>Rural areas:</strong> 2-4 business days</li>
      </ul>
      <p>
        For locations outside our standard delivery zones, please contact us to arrange delivery options.
      </p>

      <h2>Delivery Times</h2>
      <h3>Standard Delivery</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-2 text-left font-semibold">Location</th>
            <th className="py-2 text-left font-semibold">Estimated Time</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-2">Kampala City</td>
            <td className="py-2">Same day (orders before 2 PM)</td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2">Greater Kampala</td>
            <td className="py-2">Same day or next day</td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2">Entebbe, Jinja, Mukono</td>
            <td className="py-2">1-2 business days</td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2">Other major towns</td>
            <td className="py-2">2-3 business days</td>
          </tr>
          <tr>
            <td className="py-2">Rural areas</td>
            <td className="py-2">3-5 business days</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4">
        <strong>Note:</strong> Delivery times are estimates and may vary due to factors beyond our control,
        such as weather, traffic, or public holidays.
      </p>

      <h2>Delivery Fees</h2>
      <p>Delivery fees are calculated based on your location and order size:</p>
      <ul>
        <li><strong>Kampala City:</strong> From KES 500</li>
        <li><strong>Greater Kampala:</strong> From KES 800</li>
        <li><strong>Other areas:</strong> Calculated at checkout based on distance</li>
      </ul>
      <p>
        The exact delivery fee will be displayed during checkout before you confirm your order.
      </p>

      <h2>Order Processing</h2>
      <p>
        Orders are processed Monday through Saturday. Orders placed on Sundays or public holidays
        will be processed on the next business day.
      </p>
      <h3>Processing Times</h3>
      <ul>
        <li>Orders placed before 12 PM: Usually dispatched same day</li>
        <li>Orders placed after 12 PM: Dispatched next business day</li>
      </ul>

      <h2>Pickup Option</h2>
      <p>
        If you prefer, you can pick up your order from our location. Select &quot;Pickup&quot; during
        checkout and we&apos;ll notify you when your order is ready. Pickup is free of charge.
      </p>

      <h2>Order Tracking</h2>
      <p>
        Once your order is dispatched, you will receive a notification via SMS or WhatsApp with
        delivery updates. You can also contact us anytime to check your order status.
      </p>

      <h2>Delivery Instructions</h2>
      <p>
        Please provide accurate delivery information, including:
      </p>
      <ul>
        <li>Complete address with landmarks</li>
        <li>Active phone number</li>
        <li>Preferred delivery time (if any)</li>
        <li>Any special instructions for the delivery person</li>
      </ul>

      <h2>Missed Deliveries</h2>
      <p>
        If you&apos;re unavailable when our delivery person arrives, they will attempt to contact you.
        If delivery cannot be completed:
      </p>
      <ul>
        <li>We may leave the package with a neighbor or security (if permitted)</li>
        <li>We will arrange a redelivery at a convenient time</li>
        <li>Multiple failed delivery attempts may incur additional fees</li>
      </ul>

      <h2>Damaged or Lost Packages</h2>
      <p>
        We take care to package your items securely. If your package arrives damaged or is lost in
        transit, please contact us within 24 hours. We will investigate and provide a replacement
        or refund as appropriate.
      </p>

      <h2>Questions?</h2>
      <p>
        For shipping inquiries, contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or via{" "}
        <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>.
      </p>
    </LegalPage>
  );
}
