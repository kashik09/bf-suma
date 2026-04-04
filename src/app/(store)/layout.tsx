import { AppShell } from "@/components/layout/app-shell";
import { StoreFooter, StoreHeader, WhatsAppFloatingCTA } from "@/components/storefront";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <WhatsAppFloatingCTA />
    </AppShell>
  );
}
