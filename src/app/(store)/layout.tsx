import { AppShell } from "@/components/layout/app-shell";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { StoreFooter, StoreHeader, WhatsAppFloatingCTA } from "@/components/storefront";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <GoogleAnalytics />
      <a
        className="sr-only absolute left-3 top-3 z-50 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-brand-500"
        href="#main-content"
      >
        Skip to content
      </a>
      <StoreHeader />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <StoreFooter />
      <WhatsAppFloatingCTA />
    </AppShell>
  );
}
