import Link from "next/link";
import {
  CircleAlert,
  DollarSign,
  ExternalLink,
  FileText,
  MessageSquare,
  Package,
  ShoppingBag,
  TriangleAlert,
  Users
} from "lucide-react";
import { QuickActions, RecentOrders, StatsCard } from "@/components/admin";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { formatCurrency } from "@/lib/utils";
import { getAdminDashboardSnapshot } from "@/services/admin-dashboard";

const quickActions = [
  {
    href: "/admin/orders?status=PENDING",
    label: "Review Pending Orders",
    description: "Triage and process new incoming orders",
    icon: ShoppingBag,
    variant: "warning" as const
  },
  {
    href: "/admin/products",
    label: "Manage Inventory",
    description: "Adjust product status, stock, and pricing",
    icon: Package,
    variant: "default" as const
  },
  {
    href: "/admin/contacts?status=NEW",
    label: "Handle Contacts",
    description: "Respond to incoming customer inquiries",
    icon: MessageSquare,
    variant: "default" as const
  },
  {
    href: "/shop",
    label: "View Storefront",
    description: "Open the live public storefront",
    icon: ExternalLink,
    variant: "primary" as const
  }
];

const managementActions = [
  {
    href: "/admin/products/new",
    label: "Create Product",
    description: "Add a new catalog item",
    icon: Package,
    variant: "primary" as const
  },
  {
    href: "/admin/blog/new",
    label: "Publish Post",
    description: "Create and publish blog content",
    icon: FileText,
    variant: "primary" as const
  }
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const canManageContent = session.role === "SUPER_ADMIN" || session.role === "OPERATIONS";
  const resolvedQuickActions = canManageContent ? [...managementActions, ...quickActions] : quickActions;
  const snapshot = await getAdminDashboardSnapshot();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Control Center"
        description="Operational dashboard for orders, inventory, content, and customer contact workflows."
      />

      {snapshot.degraded ? (
        <Card className="border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">Some admin metrics are degraded</p>
              <ul className="space-y-1 text-sm text-amber-800">
                {snapshot.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Revenue"
          value={formatCurrency(snapshot.kpis.totalRevenue)}
          description="Total captured from all orders"
          trend={snapshot.kpis.revenueTrend || undefined}
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="Orders"
          value={snapshot.kpis.totalOrders}
          description={`${snapshot.kpis.pendingOrders} pending • ${snapshot.kpis.canceledOrders} canceled`}
          trend={snapshot.kpis.ordersTrend || undefined}
          icon={ShoppingBag}
          variant={snapshot.kpis.pendingOrders > 0 ? "warning" : "default"}
        />
        <StatsCard
          title="Products"
          value={snapshot.kpis.totalProducts}
          description={`${snapshot.kpis.activeProducts} active • ${snapshot.kpis.outOfStockProducts} out of stock`}
          icon={Package}
          variant={snapshot.kpis.outOfStockProducts > 0 ? "danger" : "default"}
        />
        <StatsCard
          title="Customers"
          value={snapshot.kpis.totalCustomers}
          description="Unique customer records"
          icon={Users}
          variant="info"
        />
        <StatsCard
          title="Blog"
          value={snapshot.kpis.publishedBlogPosts}
          description={`${snapshot.kpis.draftBlogPosts} drafts awaiting publish`}
          icon={FileText}
          variant={snapshot.kpis.draftBlogPosts > 0 ? "warning" : "default"}
        />
        <StatsCard
          title="Contacts"
          value={snapshot.kpis.newInquiries + snapshot.kpis.inProgressInquiries}
          description={`${snapshot.kpis.newInquiries} new • ${snapshot.kpis.inProgressInquiries} in progress`}
          icon={MessageSquare}
          variant={snapshot.kpis.newInquiries > 0 ? "warning" : "default"}
        />
      </div>

      {snapshot.criticalAlerts.length > 0 ? (
        <Card className="border-rose-300 bg-rose-50">
          <div className="mb-3 flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-rose-700" />
            <h3 className="text-base font-semibold text-rose-900">Critical Alerts</h3>
          </div>
          <ul className="space-y-2">
            {snapshot.criticalAlerts.map((alert) => (
              <li className="rounded-md border border-rose-200 bg-white px-3 py-2.5" key={alert.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{alert.title}</p>
                    <p className="text-sm text-slate-600">{alert.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={alert.severity === "danger" ? "danger" : "warning"}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href={alert.href}>
                      Open
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Pending Actions</h3>
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/orders?status=PENDING">
            View Queue
          </Link>
        </div>

        {snapshot.pendingActions.length === 0 ? (
          <p className="text-sm text-slate-600">No urgent operational actions right now.</p>
        ) : (
          <ul className="space-y-3">
            {snapshot.pendingActions.map((action) => (
              <li className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" key={action.id}>
                <div>
                  <p className="font-medium text-slate-900">{action.label}</p>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={action.severity === "danger" ? "danger" : action.severity === "warning" ? "warning" : "info"}>
                    {action.severity.toUpperCase()}
                  </Badge>
                  <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href={action.href}>
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders orders={snapshot.recentOrders} title="Recent Orders" />
        </div>
        <div>
          <QuickActions actions={resolvedQuickActions} title="Operational Shortcuts" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Latest Blog Updates</h3>
            <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/blog">
              Manage Blog
            </Link>
          </div>

          {snapshot.recentBlogPosts.length === 0 ? (
            <p className="text-sm text-slate-600">No blog records yet.</p>
          ) : (
            <ul className="space-y-3">
              {snapshot.recentBlogPosts.map((post) => (
                <li className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5" key={post.id}>
                  <div>
                    <p className="font-medium text-slate-900">{post.title}</p>
                    <p className="text-xs text-slate-500">/{post.slug} • Updated {formatDateTime(post.updatedAt)}</p>
                  </div>
                  <Badge variant={post.status === "PUBLISHED" ? "success" : "warning"}>
                    {post.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Latest Contact Inquiries</h3>
            <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/contacts">
              View Contacts
            </Link>
          </div>

          {snapshot.recentInquiries.length === 0 ? (
            <p className="text-sm text-slate-600">No recent inquiries.</p>
          ) : (
            <ul className="space-y-3">
              {snapshot.recentInquiries.map((inquiry) => (
                <li className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5" key={inquiry.id}>
                  <div>
                    <p className="font-medium text-slate-900">{inquiry.name}</p>
                    <p className="text-xs text-slate-500">Received {formatDateTime(inquiry.createdAt)}</p>
                  </div>
                  <Badge variant={inquiry.status === "RESOLVED" ? "success" : inquiry.status === "CLOSED" ? "neutral" : "warning"}>
                    {inquiry.status.replace(/_/g, " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
