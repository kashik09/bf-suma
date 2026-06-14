export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, TrendingUp, Users, ShoppingBag, RefreshCw } from "lucide-react";
import { getAdminSessionFromCookies } from "@/lib/admin-server";
import { Card } from "@/components/ui";
import { getAdminDashboardSnapshot } from "@/services/admin-dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function AdminReportsPage() {
  const session = await getAdminSessionFromCookies();
  if (!session) redirect("/admin");
  if (session.mustResetPassword) redirect("/admin/reset-password");

  const snapshot = await getAdminDashboardSnapshot();

  const avgOrderValue = snapshot.kpis.totalOrders > 0
    ? Math.round(snapshot.kpis.totalRevenue / snapshot.kpis.totalOrders)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500">Revenue, orders, and product performance insights.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(snapshot.kpis.totalRevenue)}</p>
              <p className="text-xs text-slate-500">Total Revenue</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{snapshot.kpis.totalOrders}</p>
              <p className="text-xs text-slate-500">Total Orders</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(avgOrderValue)}</p>
              <p className="text-xs text-slate-500">Avg. Order Value</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{snapshot.kpis.totalCustomers}</p>
              <p className="text-xs text-slate-500">Total Customers</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Sales by Category</h2>
        {snapshot.categorySales.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No sales data available</p>
        ) : (
          <div className="space-y-4">
            {snapshot.categorySales.map((cat) => (
              <div key={cat.category_id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{cat.category_name}</span>
                  <span className="text-sm text-slate-500">{cat.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">
                  {formatCurrency(cat.total_sales)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Top Products */}
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Top Selling Products (This Week)</h2>
        {snapshot.revenueIntelligence.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No sales data this week</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4 text-right">Units Sold</th>
                  <th className="pb-3 pr-4 text-right">Orders</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {snapshot.revenueIntelligence.topProducts.map((product, index) => (
                  <tr key={product.productId}>
                    <td className="py-3 pr-4 font-semibold text-slate-400">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <Link href={product.href} className="font-medium text-slate-900 hover:text-brand-600">
                        {product.productName}
                      </Link>
                      {product.attention && (
                        <span className="ml-2 text-xs text-amber-600">Low stock</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-700">{product.unitsSold}</td>
                    <td className="py-3 pr-4 text-right text-slate-700">{product.orderCount}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Orders Today</p>
              <p className="text-2xl font-bold text-slate-900">{snapshot.kpis.ordersToday}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-slate-200" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Orders This Week</p>
              <p className="text-2xl font-bold text-slate-900">{snapshot.kpis.ordersThisWeek}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-slate-200" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Repeat Rate</p>
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-xs text-slate-400">Coming soon</p>
            </div>
            <RefreshCw className="h-8 w-8 text-slate-200" />
          </div>
        </Card>
      </div>
    </div>
  );
}
