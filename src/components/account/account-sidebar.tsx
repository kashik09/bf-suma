"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Target
} from "lucide-react";

interface AccountSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
}

const tierStyles = {
  BRONZE: { bg: "bg-orange-100", text: "text-orange-700", label: "Bronze Member" },
  SILVER: { bg: "bg-slate-100", text: "text-slate-700", label: "Silver Member" },
  GOLD: { bg: "bg-amber-100", text: "text-amber-700", label: "Gold Member" },
  PLATINUM: { bg: "bg-purple-100", text: "text-purple-700", label: "Platinum Member" }
};

const NAV_SECTIONS = [
  {
    title: "MY WELLNESS",
    items: [
      { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/account/wellness", label: "Wellness Goals", icon: Target }
    ]
  },
  {
    title: "SHOPPING",
    items: [
      { href: "/account/orders", label: "My Orders", icon: Package, badge: "orders" },
      { href: "/account/refills", label: "Reorder & Refills", icon: RefreshCw },
      { href: "/account/wishlist", label: "Wishlist", icon: Heart, badge: "wishlist" }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/account/addresses", label: "Addresses & Payment", icon: MapPin }
    ]
  }
];

function displayName(firstName: string, lastName: string, email: string) {
  const full = `${firstName} ${lastName}`.trim();
  if (full) return full;
  return email.split("@")[0] || "Customer";
}

function getInitials(firstName: string, lastName: string, email: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function AccountSidebar({ user, tier = "GOLD" }: AccountSidebarProps) {
  const pathname = usePathname();
  const name = displayName(user.firstName, user.lastName, user.email);
  const initials = getInitials(user.firstName, user.lastName, user.email);
  const tierStyle = tierStyles[tier];

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex-1 space-y-6 p-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierStyle.bg} ${tierStyle.text}`}>
              {tierStyle.label}
            </span>
          </div>
          <form action="/account/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
