import { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: "Learn how BF Suma collects, uses, and protects your personal information."
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="April 2026">
      <p>
        At BF Suma, we respect your privacy and are committed to protecting your personal information.
        This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
      </p>

      <h2>Information We Collect</h2>

      <h3>Information You Provide</h3>
      <p>We collect information you voluntarily provide when you:</p>
      <ul>
        <li>Place an order (name, email, phone number, delivery address)</li>
        <li>Subscribe to our newsletter (email address)</li>
        <li>Contact us through our contact form or WhatsApp</li>
        <li>Create an account (if applicable)</li>
      </ul>

      <h3>Information Collected Automatically</h3>
      <p>When you visit our website, we may automatically collect:</p>
      <ul>
        <li>Device information (browser type, operating system)</li>
        <li>IP address and general location</li>
        <li>Pages visited and time spent on our site</li>
        <li>Referring website or source</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Communicate about your order status and delivery</li>
        <li>Send product updates and newsletters (if you opted in)</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Improve our website and services</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Information Sharing</h2>
      <p>We do not sell your personal information. We may share your data with:</p>
      <ul>
        <li><strong>Delivery partners:</strong> To fulfill and deliver your orders</li>
        <li><strong>Payment processors:</strong> To process transactions securely</li>
        <li><strong>Service providers:</strong> Who help us operate our business (email services, analytics)</li>
        <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We implement appropriate security measures to protect your personal information from unauthorized access,
        alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
      </p>

      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your personal information</li>
        <li>Unsubscribe from marketing communications at any time</li>
        <li>Opt out of certain data collection</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use cookies and similar technologies to improve your browsing experience, analyze site traffic,
        and remember your preferences. You can control cookies through your browser settings.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        Our website may contain links to third-party sites. We are not responsible for the privacy practices
        of these external sites. We encourage you to review their privacy policies.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our services are not directed to individuals under 18. We do not knowingly collect personal information
        from children. If you believe we have collected such information, please contact us immediately.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes by
        posting the new policy on this page with an updated revision date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or your personal information, please contact us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
