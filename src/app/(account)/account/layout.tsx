"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  X
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "SHOPPING",
    items: [
      { href: "/account/orders", label: "My Orders", icon: Package },
      { href: "/account/refills", label: "Reorder & Refills", icon: RefreshCw },
      { href: "/account/wishlist", label: "Wishlist", icon: Heart }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/account/addresses", label: "Addresses", icon: MapPin },
      { href: "/account/profile", label: "Profile Settings", icon: User }
    ]
  }
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/account/dashboard") return pathname === href || pathname === "/account";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <Link href="/account/dashboard" className="flex items-center gap-3" onClick={onLinkClick}>
          <Image
            src="/bf-suma-mark.png"
            alt="BF Suma"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">BF SUMA</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              My Account
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-brand-600" : "text-slate-400"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">Customer</p>
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Gold Member
            </span>
          </div>
          <form action="/account/logout" method="POST">
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function AccountSidebar() {
  return (
    <aside className="hidden w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white lg:flex">
      <SidebarContent />
    </aside>
  );
}

function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl"
      >
        <div className="absolute right-3 top-3">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent onLinkClick={onClose} />
      </div>
    </div>
  );
}

function AccountTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search products & orders..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/shop"
          className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop
        </Link>
      </div>
    </header>
  );
}

export default function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuOpen = useCallback(() => setIsMobileMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <AppShell>
      <div className="flex min-h-screen bg-slate-50">
        <AccountSidebar />
        <MobileSidebar isOpen={isMobileMenuOpen} onClose={handleMenuClose} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AccountTopbar onMenuClick={handleMenuOpen} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AppShell>
  );
}
