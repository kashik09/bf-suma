import Link from "next/link";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { AdminProductsUnavailableError, getAdminProducts } from "@/services/admin-products";
import { formatCurrency } from "@/lib/utils";
import type { ProductStatus } from "@/types";

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
  OUT_OF_STOCK: "Out of Stock"
};

const STATUS_VARIANTS: Record<ProductStatus, "success" | "warning" | "neutral" | "danger"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  ARCHIVED: "neutral",
  OUT_OF_STOCK: "danger"
};

type ProductsSearchParams = Promise<{
  search?: string;
  status?: ProductStatus | "all";
  deleted?: string;
}>;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams?: ProductsSearchParams;
}) {
  const session = await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const canManageProducts = session.role === "SUPER_ADMIN" || session.role === "OPERATIONS";
  const query = searchParams ? await searchParams : {};
  const searchTerm = typeof query.search === "string" ? query.search : "";
  const statusFilter =
    query.status === "ACTIVE" || query.status === "DRAFT" || query.status === "ARCHIVED" || query.status === "OUT_OF_STOCK"
      ? query.status
      : "all";
  let products: Awaited<ReturnType<typeof getAdminProducts>> = [];
  let loadError: string | null = null;

  try {
    products = await getAdminProducts({
      search: searchTerm,
      status: statusFilter
    });
  } catch (error) {
    loadError =
      error instanceof AdminProductsUnavailableError
        ? error.message
        : "Could not load products right now. Please retry shortly.";
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Products"
        description={
          loadError
            ? "Inventory control is degraded right now. Resolve the warning below to restore full product operations."
            : `Inventory control with status, pricing, stock visibility, and quick edit actions. ${products.length} result(s).`
        }
      />

      {query.deleted === "1" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Product deleted successfully.
        </div>
      ) : null}

      {loadError ? (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Product data is degraded</p>
          <p className="mt-1 text-sm text-amber-800">{loadError}</p>
        </Card>
      ) : null}

      <Card>
        <form action="/admin/products" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search">
              Search
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={searchTerm}
              id="search"
              name="search"
              placeholder="Search name, slug, or SKU"
              type="search"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
              Status
            </label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={statusFilter}
              id="status"
              name="status"
            >
              <option value="all">All</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Filter
            </button>
            {canManageProducts ? (
              <Link
                href="/admin/products/new"
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                + New Product
              </Link>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <img
                        alt={p.name}
                        className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                        loading="lazy"
                        src={p.image_url}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border border-dashed border-slate-300 bg-slate-50" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">/{p.slug} • SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{formatCurrency(p.price, p.currency)}</td>
                <td className="p-3">{p.stock_qty}</td>
                <td className="p-3">
                  <Badge variant={STATUS_VARIANTS[p.status]}>
                    {STATUS_LABELS[p.status]}
                  </Badge>
                </td>
                <td className="p-3">{formatDate(p.created_at)}</td>
                <td className="p-3 text-right">
                  {canManageProducts ? (
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-blue-600"
                    >
                      Edit
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">Read-only</span>
                  )}
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No products match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
