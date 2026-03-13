import { AppShell } from "@/components/layout/app-shell";
import { StoreFooter, StoreHeader, WhatsAppFloatingCTA } from "@/components/storefront";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <StoreHeader />
      <main>{children}</main>
      <StoreFooter />
      <WhatsAppFloatingCTA />
    </AppShell>
  );
}
