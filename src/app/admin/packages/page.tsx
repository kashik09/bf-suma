export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { formatCurrency } from "@/lib/utils";
import { listPackagesForAdmin } from "@/services/packages";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default async function AdminPackagesPage({
  searchParams
}: {
  searchParams?: Promise<{ deleted?: string }>;
}) {
  const session = await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const canManagePackages = session.role === "SUPER_ADMIN" || session.role === "OPERATIONS";
  const query = searchParams ? await searchParams : {};

  let packages: Awaited<ReturnType<typeof listPackagesForAdmin>> = [];
  let loadError: string | null = null;

  try {
    packages = await listPackagesForAdmin();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load packages.";
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Packages"
        description={
          loadError
            ? "Package data is unavailable right now."
            : `Manage health packages and bundles. ${packages.length} package(s) total.`
        }
      />

      {query.deleted === "1" && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Package deleted successfully.
        </div>
      )}

      {loadError && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Package data is degraded</p>
          <p className="mt-1 text-sm text-amber-800">{loadError}</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Health packages bundle multiple products together at a set or calculated price.
          </p>
          {canManagePackages && (
            <Link
              href="/admin/packages/new"
              className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              + New Package
            </Link>
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Package</th>
              <th className="p-3">Items</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {pkg.hero_image_url ? (
                      <img
                        alt={pkg.name}
                        className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                        loading="lazy"
                        src={pkg.hero_image_url}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                        PKG
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{pkg.name}</p>
                      <p className="text-xs text-slate-500">/{pkg.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{pkg.item_count} products</td>
                <td className="p-3">
                  <div>
                    <p className="font-medium">{formatCurrency(pkg.final_price, pkg.currency)}</p>
                    {pkg.savings && (
                      <p className="text-xs text-emerald-600">
                        Saves {formatCurrency(pkg.savings, pkg.currency)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={pkg.is_active ? "success" : "neutral"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {pkg.is_featured && (
                      <Badge variant="warning">Featured</Badge>
                    )}
                    {!pkg.is_in_stock && (
                      <Badge variant="danger">Out of Stock</Badge>
                    )}
                  </div>
                </td>
                <td className="p-3">{formatDate(pkg.created_at)}</td>
                <td className="p-3 text-right">
                  {canManagePackages ? (
                    <Link href={`/admin/packages/${pkg.id}`} className="text-blue-600">
                      Edit
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">Read-only</span>
                  )}
                </td>
              </tr>
            ))}
            {packages.length === 0 && !loadError && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No packages yet. Create your first health package.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
