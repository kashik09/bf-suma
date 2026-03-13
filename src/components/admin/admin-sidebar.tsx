import Link from "next/link";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/drivers", label: "Drivers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" }
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="p-5">
        <h2 className="text-lg font-bold text-slate-900">Admin</h2>
      </div>
      <nav className="space-y-1 px-3 pb-5">
        {adminNav.map((item) => (
          <Link
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
