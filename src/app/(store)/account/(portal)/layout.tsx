import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Target
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { requireCustomerUser } from "@/lib/auth/customer-server";

export const dynamic = "force-dynamic";

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
      { href: "/account/orders", label: "My Orders", icon: Package },
      { href: "/account/refills", label: "Reorder & Refills", icon: RefreshCw },
      { href: "/account/wishlist", label: "Wishlist", icon: Heart }
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/account/addresses", label: "Addresses & Payment", icon: MapPin },
      { href: "/account/profile", label: "Profile Settings", icon: Package }
    ]
  }
];

export default async function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomerUser();
  const name = displayName(user.firstName, user.lastName, user.email);
  const initials = getInitials(user.firstName, user.lastName, user.email);

  // Mock tier - would come from database
  const tier = "Gold Member";

  return (
    <PageContainer className="grid gap-6 py-8 md:grid-cols-[250px_minmax(0,1fr)] md:py-10">
      <aside className="hidden md:flex md:h-fit md:flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex-1 space-y-6 p-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
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
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {tier}
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

      <section className="space-y-4">{children}</section>

      <nav
        aria-label="Account quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white p-2 md:hidden"
      >
        <Link className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-slate-700" href="/account/dashboard">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-slate-700" href="/account/orders">
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Orders</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-slate-700" href="/account/wellness">
          <Target className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Goals</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-slate-700" href="/account/wishlist">
          <Heart className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Wishlist</span>
        </Link>
        <form action="/account/logout" method="POST" className="flex items-center justify-center">
          <button type="submit" className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-rose-700">
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Sign Out</span>
          </button>
        </form>
      </nav>
    </PageContainer>
  );
}
