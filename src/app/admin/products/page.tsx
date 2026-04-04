import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { getAdminProducts } from "@/services/admin-products";
import { formatCurrency } from "@/lib/utils";
import type { ProductStatus } from "@/types";

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
  OUT_OF_STOCK: "Out of Stock"
};

export default async function AdminProductsPage() {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Products"
        description="Manage inventory, stock, and availability."
      />

      <div className="flex justify-end">
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-lg bg-black text-white text-sm"
        >
          + New Product
        </Link>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{formatCurrency(p.price, p.currency)}</td>
                <td className="p-3">{p.stock_qty}</td>
                <td className="p-3">
                  {STATUS_LABELS[p.status]}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
