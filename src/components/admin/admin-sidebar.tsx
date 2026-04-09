"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  FileText,
  MessagesSquare,
  Package,
  Star,
  Store,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/products", label: "Products", icon: Boxes, exact: false },
  { href: "/admin/reviews", label: "Reviews", icon: Star, exact: false },
  { href: "/admin/blog", label: "Blog", icon: FileText, exact: false },
  { href: "/admin/contacts", label: "Contacts", icon: MessagesSquare, exact: false }
];

const bottomNav = [
  { href: "/admin/guide", label: "Admin Guide", icon: BookOpen, external: false },
  { href: "/shop", label: "View Store", icon: Store, external: true }
];

interface SidebarContentProps {
  onLinkClick?: () => void;
}

function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Link href="/admin" className="flex items-center gap-2" onClick={onLinkClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">BF Suma</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main
        </p>
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

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
                  "h-5 w-5 shrink-0",
                  active ? "text-brand-600" : "text-slate-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick Links
        </p>
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer noopener" : undefined}
              onClick={onLinkClick}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon className="h-5 w-5 shrink-0 text-slate-400" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <SidebarContent />
    </aside>
  );
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
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

        <SidebarContent onLinkClick={onClose} />
      </div>
    </div>
  );
}
