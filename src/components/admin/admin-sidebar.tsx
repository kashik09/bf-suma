"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  ShoppingBag,
  Boxes,
  Users,
  UserCheck,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavBadge } from "@/components/dashboard";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
  badgeVariant?: "default" | "danger";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 }
    ]
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: 0 },
      { href: "/admin/products", label: "Products", icon: Boxes, badge: 0 },
      { href: "/admin/packages", label: "Health Packages", icon: Package },
      { href: "/admin/promotions", label: "Promotions", icon: Percent }
    ]
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/partners", label: "Partners", icon: UserCheck }
    ]
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", label: "Blog & Insights", icon: FileText }
    ]
  }
];

interface AdminUserInfo {
  initials: string;
  name: string;
  role: string;
}

interface SidebarContentProps {
  onLinkClick?: () => void;
  user?: AdminUserInfo;
  pendingOrders?: number;
  lowStockProducts?: number;
}

function SidebarContent({
  onLinkClick,
  user = { initials: "AK", name: "Aisha Kembabazi", role: "Store Administrator" },
  pendingOrders = 0,
  lowStockProducts = 0
}: SidebarContentProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Update badges dynamically
  const getBadgeCount = (href: string): number => {
    if (href === "/admin/orders") return pendingOrders;
    if (href === "/admin/products") return lowStockProducts;
    return 0;
  };

  return (
    <>
      {/* Logo Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <Link href="/admin" className="flex items-center gap-3" onClick={onLinkClick}>
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
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                const badgeCount = getBadgeCount(item.href);

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
                    {badgeCount > 0 && (
                      <NavBadge count={badgeCount} variant={item.badgeVariant} />
                    )}
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
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.role}</p>
          </div>
          <Link
            href="/admin/logout"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

interface AdminSidebarProps {
  user?: AdminUserInfo;
  pendingOrders?: number;
  lowStockProducts?: number;
}

export function AdminSidebar({ user, pendingOrders, lowStockProducts }: AdminSidebarProps) {
  return (
    <aside className="hidden w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white lg:flex">
      <SidebarContent
        user={user}
        pendingOrders={pendingOrders}
        lowStockProducts={lowStockProducts}
      />
    </aside>
  );
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUserInfo;
  pendingOrders?: number;
  lowStockProducts?: number;
}

export function MobileSidebar({
  isOpen,
  onClose,
  user,
  pendingOrders,
  lowStockProducts
}: MobileSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const container = sidebarRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const isInside = active ? container.contains(active) : false;

      if (event.shiftKey) {
        if (!isInside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!isInside || active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusedElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      previousFocusedElementRef.current?.focus();
      previousFocusedElementRef.current = null;
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

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
        aria-label="Admin navigation menu"
        className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl"
      >
        <div className="absolute right-3 top-3">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SidebarContent
          onLinkClick={onClose}
          user={user}
          pendingOrders={pendingOrders}
          lowStockProducts={lowStockProducts}
        />
      </div>
    </div>
  );
}
