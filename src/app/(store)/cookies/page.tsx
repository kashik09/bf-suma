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
  { id: "cookie-settings", label: "Cookie Settings" }
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
        <li><strong>Essential cookies</strong> — Required for core site functions and security.</li>
        <li><strong>Analytics cookies</strong> — Help us measure traffic and conversion performance.</li>
      </ul>

      <h2 id="essential-cookies">Essential Cookies</h2>
      <p>
        Essential cookies are always active because they are needed for basic features like page navigation,
        secure requests, and checkout continuity. You cannot disable these cookies.
      </p>

      <h3>What Essential Cookies Do</h3>
      <ul>
        <li>Remember items in your shopping cart</li>
        <li>Keep you logged in during your session</li>
        <li>Protect against cross-site request forgery</li>
        <li>Store your cookie consent preference</li>
      </ul>

      <h2 id="analytics-cookies">Analytics Cookies</h2>
      <p>
        Analytics cookies are optional. They are only enabled when you choose <strong>Accept All</strong> in
        the cookie banner. These cookies help us understand how visitors interact with our site.
      </p>

      <h3>What Analytics Cookies Do</h3>
      <ul>
        <li>Count page visits and unique visitors</li>
        <li>Track which products are viewed most often</li>
        <li>Measure checkout completion rates</li>
        <li>Identify site errors and slow pages</li>
      </ul>

      <h3>Third-Party Analytics</h3>
      <p>
        We may use services like Google Analytics or Vercel Analytics to collect this data. These services
        have their own privacy policies governing how they process information.
      </p>

      <h2 id="cookie-settings">Cookie Settings</h2>
      <p>You can update your cookie preference at any time using the panel below or by:</p>
      <ul>
        <li>Clicking <strong>Cookie Settings</strong> in the footer</li>
        <li>Clearing your browser's site data to reset your choice</li>
      </ul>

      <CookieSettingsPanel />
    </LegalPage>
  );
}
