"use client";

import { Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface RoleSwitcherProps {
  showCustomerLink?: boolean;
}

export function RoleSwitcher({ showCustomerLink = true }: RoleSwitcherProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex items-center rounded-lg bg-slate-100 p-1">
      <Link
        href="/admin"
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          isAdmin
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Admin</span>
      </Link>
      {showCustomerLink && (
        <Link
          href="/account/dashboard"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            !isAdmin
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Customer</span>
        </Link>
      )}
    </div>
  );
}
