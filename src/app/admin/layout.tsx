"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AdminSidebar, AdminTopbar, MobileSidebar } from "@/components/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuOpen = useCallback(() => setIsMobileMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMobileMenuOpen(false), []);

  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <>{children}</>;
  }

  return (
    <AppShell>
      <div className="flex min-h-screen bg-surface-50">
        <AdminSidebar />
        <MobileSidebar isOpen={isMobileMenuOpen} onClose={handleMenuClose} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar onMenuClick={handleMenuOpen} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AppShell>
  );
}
