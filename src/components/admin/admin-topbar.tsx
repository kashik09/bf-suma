"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/reviews")) return "Reviews";
  if (pathname.startsWith("/admin/blog")) return "Blog";
  if (pathname.startsWith("/admin/contacts")) return "Contacts";
  if (pathname.startsWith("/admin/guide")) return "Guide";
  if (pathname.startsWith("/admin/reset-password")) return "Reset Password";
  if (pathname.startsWith("/admin/login")) return "Login";
  return "Dashboard";
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const sectionLabel = useMemo(() => getSectionLabel(pathname), [pathname]);

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Admin</p>
            <p className="text-sm font-semibold text-slate-900">{sectionLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            href="/admin/orders?status=PENDING"
          >
            Pending Orders
          </Link>
          <Link
            className="hidden rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            href="/admin/contacts?status=NEW"
          >
            New Contacts
          </Link>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden items-center gap-2 text-left sm:flex">
              <div>
                <p className="text-xs font-medium text-slate-700">Admin Console</p>
                <p className="text-[10px] text-slate-500">Protected mode</p>
              </div>
              <Link
                className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                href="/admin/logout"
              >
                Logout
              </Link>
            </div>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:hidden"
            href="/admin/logout"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
