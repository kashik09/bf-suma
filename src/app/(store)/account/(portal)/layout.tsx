import Link from "next/link";
import { Heart, type LucideIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { requireCustomerUser } from "@/lib/auth/customer-server";

export const dynamic = "force-dynamic";

function displayName(firstName: string, lastName: string, email: string) {
  const full = `${firstName} ${lastName}`.trim();
  if (full) return full;
  return email.split("@")[0] || "Customer";
}

interface AccountNavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

const ACCOUNT_NAV_LINKS: AccountNavLink[] = [
  { href: "/account/dashboard", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart }
];

export default async function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomerUser();
  const name = displayName(user.firstName, user.lastName, user.email);

  return (
    <PageContainer className="grid gap-6 py-8 md:grid-cols-[250px_minmax(0,1fr)] md:py-10">
      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="border-b border-slate-200 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>

        <nav aria-label="Account navigation" className="space-y-1.5">
          {ACCOUNT_NAV_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                href={item.href}
                key={item.href}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            className="block rounded-md px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 hover:text-rose-800"
            href="/account/logout"
          >
            Sign Out
          </Link>
        </nav>
      </aside>

      <section className="space-y-4">{children}</section>

      <nav
        aria-label="Account quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white p-2 md:hidden"
      >
        <Link className="rounded-md px-2 py-2 text-center text-xs font-semibold text-slate-700" href="/account/dashboard">
          Dashboard
        </Link>
        <Link className="rounded-md px-2 py-2 text-center text-xs font-semibold text-slate-700" href="/account/orders">
          Orders
        </Link>
        <Link className="rounded-md px-2 py-2 text-center text-xs font-semibold text-slate-700" href="/account/profile">
          Profile
        </Link>
        <Link className="rounded-md px-2 py-2 text-center text-xs font-semibold text-slate-700" href="/account/wishlist">
          Wishlist
        </Link>
        <Link className="rounded-md px-2 py-2 text-center text-xs font-semibold text-rose-700" href="/account/logout">
          Sign Out
        </Link>
      </nav>
    </PageContainer>
  );
}
