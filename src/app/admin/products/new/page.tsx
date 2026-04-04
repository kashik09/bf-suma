import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { toMinorUnits } from "@/lib/utils";
import { createAdminProduct, listAdminCategoryOptions } from "@/services/admin-products";
import type { ProductStatus } from "@/types";

const PRODUCT_STATUS_VALUES = ["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"] as const;

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000).optional(),
  sku: z.string().trim().min(1).max(64),
  priceMajor: z.coerce.number().nonnegative(),
  compareAtPriceMajor: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().nonnegative().optional()
  ),
  stockQty: z.coerce.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  status: z.enum(PRODUCT_STATUS_VALUES)
});

function parseErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Could not create product.";
}

export default async function AdminNewProductPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
  const categories = await listAdminCategoryOptions();
  const query = searchParams ? await searchParams : {};

  async function createProductAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    const parsed = createProductSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      sku: formData.get("sku"),
      priceMajor: formData.get("priceMajor"),
      compareAtPriceMajor: formData.get("compareAtPriceMajor"),
      stockQty: formData.get("stockQty"),
      categoryId: formData.get("categoryId"),
      status: formData.get("status")
    });

    if (!parsed.success) {
      redirect("/admin/products/new?error=Invalid%20product%20payload.");
    }

    try {
      const created = await createAdminProduct({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description?.trim() || null,
        sku: parsed.data.sku,
        price: toMinorUnits(parsed.data.priceMajor),
        compare_at_price:
          typeof parsed.data.compareAtPriceMajor === "number"
            ? toMinorUnits(parsed.data.compareAtPriceMajor)
            : null,
        currency: "KES",
        stock_qty: parsed.data.stockQty,
        status: parsed.data.status as ProductStatus,
        category_id: parsed.data.categoryId
      });

      redirect(`/admin/products/${created.id}?updated=1`);
    } catch (error) {
      redirect(`/admin/products/new?error=${encodeURIComponent(parseErrorMessage(error))}`);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Create Product"
        description="Add a new catalog product and publish inventory status."
        action={<Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/products">Back to Products</Link>}
      />

      {query.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {query.error}
        </div>
      ) : null}

      <Card>
        <form action={createProductAction} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">Name</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="name" name="name" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="slug">Slug</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="slug" name="slug" placeholder="nmn-duo-release" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sku">SKU</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="sku" name="sku" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="priceMajor">Price (KES)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="priceMajor" min="0" name="priceMajor" required step="0.01" type="number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="compareAtPriceMajor">Compare At Price (KES)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="compareAtPriceMajor" min="0" name="compareAtPriceMajor" step="0.01" type="number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="stockQty">Stock Qty</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="stockQty" min="0" name="stockQty" required type="number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">Status</label>
            <select className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue="ACTIVE" id="status" name="status">
              {PRODUCT_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="categoryId">Category</label>
            <select className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="categoryId" name="categoryId" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">Description</label>
            <textarea className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" id="description" name="description" />
          </div>

          <div className="md:col-span-2">
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700" type="submit">
              Create Product
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
