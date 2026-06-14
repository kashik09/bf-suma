export const dynamic = "force-dynamic";

import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DollarSign,
  Download,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users
} from "lucide-react";
import { PartnersLeaderboard } from "@/components/admin/partners-leaderboard";
import { KpiCard, RevenueChart, SalesByCategory } from "@/components/dashboard";
import { PasswordInput } from "@/components/forms/password-input";
import { Card } from "@/components/ui";
import {
  clearFlashError,
  clearFlashRedirect,
  normalizeAdminRedirect,
  readFlashError,
  readFlashRedirect,
  setFlashError,
  setFlashRedirect
} from "@/lib/admin-flash";
import { getAdminSessionFromCookies } from "@/lib/admin-server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  ADMIN_SESSION_REMEMBER_MAX_AGE_SECONDS,
  createAdminSessionToken
} from "@/lib/admin-session";
import { logEvent } from "@/lib/logger";
import { checkRateLimitInMemory } from "@/lib/rate-limit";
import { resolveClientIp } from "@/lib/request-ip";
import { formatCurrency } from "@/lib/utils";
import { AdminAuthUnavailableError, authenticateAdminUser } from "@/services/admin-auth";
import { getAdminDashboardSnapshot } from "@/services/admin-dashboard";
import { getPartnersLeaderboard, getPartnerStats, partnersTableExists } from "@/services/partners";

const ADMIN_LOGIN_RATE_LIMIT = {
  endpoint: "admin-login",
  maxRequests: 5,
  windowSeconds: 15 * 60
} as const;

function getLoginErrorMessage(error: string | null) {
  if (!error) return null;
  if (error === "invalid_credentials") return "Invalid email or password.";
  if (error === "auth_unavailable") return "Admin auth is not available yet. Apply database migrations.";
  if (error === "forbidden") return "You do not have permission for that admin action.";
  if (error === "password_reset_required") return "Password reset required. Please set a new password.";
  if (error === "session_expired") return "Session expired. Please log in again.";
  if (error === "rate_limited") return "Too many login attempts. Please try again in 15 minutes.";
  return "Unable to sign in. Please try again.";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const session = await getAdminSessionFromCookies();

  // If not authenticated, show login form
  if (!session) {
    const flashError = await readFlashError();
    const redirectTarget = await readFlashRedirect();
    const errorMessage = getLoginErrorMessage(flashError);

    async function loginAction(formData: FormData) {
      "use server";

      const email = String(formData.get("email") || "").trim().toLowerCase();
      const password = String(formData.get("password") || "");
      const rememberMe = formData.get("remember") === "on";
      const submittedNext = normalizeAdminRedirect(String(formData.get("next") || ""));

      const headersList = await headers();
      const ip = resolveClientIp(headersList);

      const rateLimit = checkRateLimitInMemory(ip, ADMIN_LOGIN_RATE_LIMIT);
      if (rateLimit.limited) {
        logEvent("warn", "admin.login_failed", { email, reason: "rate_limited", ip });
        await setFlashError("rate_limited");
        await setFlashRedirect(submittedNext);
        redirect("/admin");
      }

      if (!email || !password) {
        logEvent("warn", "admin.login_failed", { email, reason: "missing_credentials" });
        await setFlashError("invalid_credentials");
        await setFlashRedirect(submittedNext);
        redirect("/admin");
      }

      try {
        const user = await authenticateAdminUser(email, password);
        if (!user) {
          logEvent("warn", "admin.login_failed", { email, reason: "invalid_credentials" });
          await setFlashError("invalid_credentials");
          await setFlashRedirect(submittedNext);
          redirect("/admin");
        }

        if (user.mustResetPassword) {
          const resetToken = await createAdminSessionToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            passwordVersion: user.passwordVersion,
            mustResetPassword: true
          });

          const cookieStore = await cookies();
          cookieStore.set(ADMIN_SESSION_COOKIE_NAME, resetToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 60 * 15,
            path: "/"
          });

          await setFlashRedirect(submittedNext);
          redirect("/admin/reset-password");
        }

        const sessionMaxAge = rememberMe
          ? ADMIN_SESSION_REMEMBER_MAX_AGE_SECONDS
          : ADMIN_SESSION_MAX_AGE_SECONDS;

        const token = await createAdminSessionToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          passwordVersion: user.passwordVersion,
          mustResetPassword: false
        }, sessionMaxAge);

        const cookieStore = await cookies();
        cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: sessionMaxAge,
          path: "/"
        });

        logEvent("info", "admin.login_success", { email });
        await clearFlashError();
        await clearFlashRedirect();
        redirect(submittedNext);
      } catch (error) {
        if (error instanceof AdminAuthUnavailableError) {
          logEvent("warn", "admin.login_failed", { email, reason: "auth_unavailable" });
          await setFlashError("auth_unavailable");
          await setFlashRedirect(submittedNext);
          redirect("/admin");
        }
        logEvent("warn", "admin.login_failed", { email, reason: "invalid_credentials" });
        await setFlashError("invalid_credentials");
        await setFlashRedirect(submittedNext);
        redirect("/admin");
      }
    }

    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-12">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to access order operations and inventory tools.
          </p>
          {errorMessage ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
          <form action={loginAction} className="mt-5 space-y-4">
            <input name="next" type="hidden" value={redirectTarget} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                autoComplete="email"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                id="email"
                name="email"
                required
                type="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <PasswordInput id="password" name="password" autoComplete="current-password" required />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Remember me for 30 days
              </label>
            </div>
            <button
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              Sign In
            </button>
          </form>
          <Link className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800" href="/">
            Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  // If password reset required, redirect
  if (session.mustResetPassword) {
    redirect("/admin/reset-password");
  }

  // Fetch dashboard data
  const snapshot = await getAdminDashboardSnapshot();

  // Check if partners table exists and fetch partner data
  const hasPartnersTable = await partnersTableExists();
  let partnerStats = null;
  let partnersLeaderboard: Awaited<ReturnType<typeof getPartnersLeaderboard>> = [];

  if (hasPartnersTable) {
    [partnerStats, partnersLeaderboard] = await Promise.all([
      getPartnerStats(),
      getPartnersLeaderboard(6)
    ]);
  }

  // Use real chart data from snapshot
  const weeklyRevenue = snapshot.weeklyRevenue;
  const categorySales = snapshot.categorySales;

  // Calculate average order value
  const avgOrderValue = snapshot.kpis.totalOrders > 0
    ? Math.round(snapshot.kpis.totalRevenue / snapshot.kpis.totalOrders)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, Admin <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm text-slate-500">
            Here&apos;s how BF Suma Uganda is performing this month.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Revenue this month"
          value={formatCurrency(snapshot.kpis.totalRevenue)}
          trend={snapshot.kpis.revenueTrend || undefined}
          variant="success"
        />
        <KpiCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Orders"
          value={snapshot.kpis.totalOrders.toString()}
          trend={snapshot.kpis.ordersTrend || undefined}
          variant="default"
        />
        <KpiCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Avg. order value"
          value={formatCurrency(avgOrderValue)}
          subtext={`${snapshot.kpis.ordersThisWeek} orders this week`}
          variant="warning"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Active partners"
          value={partnerStats ? `${partnerStats.active_partners} / ${partnerStats.total_partners}` : "0 / 0"}
          subtext={partnerStats ? `${partnerStats.pending_payouts} payouts pending review` : "No partner data"}
          variant="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 p-5">
          <RevenueChart data={weeklyRevenue} />
        </Card>
        <Card className="lg:col-span-2 p-5">
          <SalesByCategory data={categorySales} />
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {snapshot.recentOrders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{order.customerName}</td>
                    <td className="py-3 pr-4 font-medium text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                        order.status === "OUT_FOR_DELIVERY" ? "bg-blue-50 text-blue-700" :
                        order.status === "PROCESSING" ? "bg-amber-50 text-amber-700" :
                        order.status === "PENDING" ? "bg-slate-100 text-slate-600" :
                        order.status === "CANCELED" ? "bg-rose-50 text-rose-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-UG", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
                {snapshot.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Top products</h2>
            <span className="text-xs text-slate-400">This week</span>
          </div>
          <div className="space-y-4">
            {snapshot.revenueIntelligence.topProducts.slice(0, 5).map((product, index) => (
              <Link
                key={product.productId}
                href={product.href}
                className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{product.productName}</p>
                  <p className="text-xs text-slate-500">{product.unitsSold} sold · {product.orderCount} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(product.revenue)}</p>
                  {product.attention && (
                    <span className="text-xs text-amber-600">Low stock</span>
                  )}
                </div>
              </Link>
            ))}
            {snapshot.revenueIntelligence.topProducts.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No sales data this week</p>
            )}
          </div>
        </Card>
      </div>

      {/* Partners Section - Only show if partners table exists */}
      {hasPartnersTable && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Partners & Distributors</h2>
              <p className="text-sm text-slate-500">
                BF Suma &quot;Join Us&quot; network — sales volume, downline and commissions.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Download className="h-4 w-4" />
                Payout report
              </button>
              <Link
                href="/admin/partners"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                Invite partner
              </Link>
            </div>
          </div>

          {/* Partner Stats */}
          {partnerStats && (
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">+14.2%</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(partnerStats.network_volume)}
                </p>
                <p className="text-sm text-slate-500">Network volume (mo)</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(partnerStats.commissions_due)}
                </p>
                <p className="text-sm text-slate-500">Commissions due</p>
                <p className="text-xs text-slate-400">{partnerStats.pending_payouts} pending approval</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">{partnerStats.active_partners}</p>
                <p className="text-sm text-slate-500">Active partners</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">{partnerStats.total_downline}</p>
                <p className="text-sm text-slate-500">Total downline</p>
                <p className="text-xs text-slate-400">across all tiers</p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Partner leaderboard</h3>
              <span className="text-xs text-slate-400">Ranked by monthly volume</span>
            </div>
            <PartnersLeaderboard partners={partnersLeaderboard} limit={6} />
          </div>
        </Card>
      )}

      {/* Quick Stats Footer */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Orders today</p>
              <p className="text-xl font-bold text-slate-900">{snapshot.kpis.ordersToday}</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending orders</p>
              <p className="text-xl font-bold text-slate-900">{snapshot.kpis.pendingOrders}</p>
            </div>
            <Link href="/admin/orders?status=PENDING" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Process
            </Link>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Low stock items</p>
              <p className="text-xl font-bold text-slate-900">{snapshot.kpis.outOfStockProducts}</p>
            </div>
            <Link href="/admin/products?stock=low" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Restock
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
