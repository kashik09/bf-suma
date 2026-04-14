import { LegalPage } from "@/components/layout/legal-page";
import { CookieSettingsPanel } from "@/components/storefront/cookie-settings-panel";
import { APP_NAME } from "@/lib/constants";
import { buildStorefrontMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata = buildStorefrontMetadata({
  title: `Cookie Policy | ${APP_NAME}`,
  description:
    "Learn which BF Suma cookies are essential, which support analytics, and how to change your cookie consent settings at any time.",
  path: "/cookies"
});

const cookieToc = [
  { id: "cookie-types", label: "Cookie Types We Use" },
  { id: "essential-cookies", label: "Essential Cookies" },
  { id: "analytics-cookies", label: "Analytics Cookies" },
  { id: "manage-consent", label: "How to Change Consent" }
] as const;

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="April 2026" toc={[...cookieToc]}>
      <p>
        We use cookies to keep the storefront working correctly and, when you allow it, to understand
        how people use the site so we can improve checkout and product discovery.
      </p>

      <h2 id="cookie-types">Cookie Types We Use</h2>
      <p>We use two categories of cookies on this website:</p>
      <ul>
        <li><strong>Essential cookies:</strong> Required for core site functions and security.</li>
        <li><strong>Analytics cookies:</strong> Help us measure traffic and conversion performance.</li>
      </ul>

      <h2 id="essential-cookies">Essential Cookies</h2>
      <p>
        Essential cookies are always active because they are needed for basic features like page navigation,
        secure requests, and checkout continuity.
      </p>

      <h2 id="analytics-cookies">Analytics Cookies</h2>
      <p>
        Analytics cookies are optional. They are only enabled when you choose <strong>Accept All</strong> in
        the cookie banner. These cookies help us understand visits, page views, and conversion events.
      </p>

      <h2 id="manage-consent">How to Change Consent</h2>
      <p>You can update your cookie preference at any time by:</p>
      <ul>
        <li>Using the <strong>Cookie Settings</strong> link in the footer</li>
        <li>Clearing browser site data to reset your choice</li>
      </ul>

      <CookieSettingsPanel />
    </LegalPage>
  );
}
