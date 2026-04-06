import { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description: "Read the terms and conditions for using BF Suma's website and services."
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="April 2026">
      <p>
        Welcome to BF Suma. By accessing our website and using our services, you agree to be bound by these
        Terms of Service. Please read them carefully before making a purchase.
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By using our website, placing an order, or engaging with our services, you acknowledge that you have
        read, understood, and agree to be bound by these terms. If you do not agree, please do not use our services.
      </p>

      <h2>Products and Services</h2>
      <h3>Product Information</h3>
      <p>
        We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant
        that product descriptions or other content is accurate, complete, or error-free. Colors may vary
        slightly due to monitor settings.
      </p>

      <h3>Pricing</h3>
      <p>
        All prices are displayed in Ugandan Shillings (UGX) and include applicable taxes unless otherwise stated.
        We reserve the right to modify prices at any time without prior notice. The price at the time of order
        placement will apply to your purchase.
      </p>

      <h3>Availability</h3>
      <p>
        Product availability is subject to change. If a product becomes unavailable after you place an order,
        we will notify you promptly and offer alternatives or a full refund.
      </p>

      <h2>Orders and Payment</h2>
      <h3>Order Acceptance</h3>
      <p>
        Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order.
        Order confirmation does not guarantee availability until delivery is completed.
      </p>

      <h3>Payment Methods</h3>
      <p>
        We currently accept payment on delivery. Full payment is required upon receipt of your order.
        We may introduce additional payment methods in the future.
      </p>

      <h3>Order Cancellation</h3>
      <p>
        You may cancel your order before it is dispatched for delivery by contacting our support team.
        Once an order is out for delivery, cancellation may not be possible.
      </p>

      <h2>Delivery</h2>
      <p>
        We deliver within Uganda. Delivery times are estimates and may vary based on location and circumstances
        beyond our control. Please refer to our <a href="/shipping">Shipping Policy</a> for detailed information.
      </p>

      <h2>Returns and Refunds</h2>
      <p>
        We want you to be satisfied with your purchase. Please review our <a href="/refund-policy">Refund Policy</a> for
        information on returns, exchanges, and refunds.
      </p>

      <h2>Health and Wellness Products</h2>
      <p>
        Our wellness and supplement products are intended for general health support. They are not intended to
        diagnose, treat, cure, or prevent any disease. Please consult a healthcare professional before starting
        any supplement regimen, especially if you:
      </p>
      <ul>
        <li>Are pregnant or nursing</li>
        <li>Have existing medical conditions</li>
        <li>Are taking prescription medications</li>
        <li>Have known allergies</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        All content on this website, including text, images, logos, and designs, is owned by BF Suma or its
        licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, or
        use our content without written permission.
      </p>

      <h2>User Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use our website for any unlawful purpose</li>
        <li>Attempt to gain unauthorized access to our systems</li>
        <li>Interfere with the proper functioning of our website</li>
        <li>Submit false or misleading information</li>
        <li>Engage in any activity that could harm our reputation</li>
      </ul>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, BF Suma shall not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of our website or products. Our total liability
        shall not exceed the amount you paid for the specific product or service in question.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless BF Suma, its officers, employees, and partners from any
        claims, damages, or expenses arising from your violation of these terms or misuse of our services.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms of Service are governed by the laws of Uganda. Any disputes shall be resolved in the
        courts of Uganda.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We may update these Terms of Service at any time. Continued use of our website after changes
        constitutes acceptance of the modified terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about these Terms of Service, please contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
