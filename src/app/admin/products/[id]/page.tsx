export const dynamic = "force-dynamic";

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { fromMinorUnits, toMinorUnits } from "@/lib/utils";
import {
  deleteAdminProduct,
  getAdminProductById,
  listAdminCategoryOptions,
  ProductDeleteRestrictedError,
  ProductSlugConflictError,
  updateAdminProduct,
  upsertProductImageUrl
} from "@/services/admin-products";
import type { ProductStatus } from "@/types";

const PRODUCT_STATUS_VALUES = ["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"] as const;

const updateProductSchema = z.object({
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
  status: z.enum(PRODUCT_STATUS_VALUES),
  imageUrl: z.string().trim().max(2048).optional()
});

function parseErrorMessage(error: unknown): string {
  if (error instanceof ProductSlugConflictError) {
    return error.message;
  }
  if (error instanceof ProductDeleteRestrictedError) {
    return error.message;
  }
  return "We couldn't complete this product action. Check your connection and try again.";
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function AdminProductDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; updated?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
  const { id } = await params;
  const [product, categories, query] = await Promise.all([
    getAdminProductById(id),
    listAdminCategoryOptions(),
    searchParams
      ? searchParams
      : Promise.resolve({} as { error?: string; updated?: string })
  ]);

  if (!product) {
    notFound();
  }

  async function updateProductAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    const parsed = updateProductSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      sku: formData.get("sku"),
      priceMajor: formData.get("priceMajor"),
      compareAtPriceMajor: formData.get("compareAtPriceMajor"),
      stockQty: formData.get("stockQty"),
      categoryId: formData.get("categoryId"),
      status: formData.get("status"),
      imageUrl: formData.get("imageUrl")
    });

    if (!parsed.success) {
      redirect(`/admin/products/${id}?error=Invalid%20product%20payload.`);
    }

    const normalizedSlug = normalizeSlug(parsed.data.slug);
    if (normalizedSlug.length < 2) {
      redirect(`/admin/products/${id}?error=Slug%20must%20include%20letters%20or%20numbers.`);
    }

    try {
      await updateAdminProduct(id, {
        name: parsed.data.name,
        slug: normalizedSlug,
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
      await upsertProductImageUrl(id, parsed.data.imageUrl || null);
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}`);
      revalidatePath("/shop");
      redirect(`/admin/products/${id}?updated=1`);
    } catch (error) {
      redirect(`/admin/products/${id}?error=${encodeURIComponent(parseErrorMessage(error))}`);
    }
  }

  async function deleteProductAction() {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    try {
      await deleteAdminProduct(id);
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}`);
      revalidatePath("/shop");
      redirect("/admin/products?deleted=1");
    } catch (error) {
      redirect(`/admin/products/${id}?error=${encodeURIComponent(parseErrorMessage(error))}`);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Edit ${product.name}`}
        description="Update inventory and catalog publishing fields."
        action={<Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/products">Back to Products</Link>}
      />

      {query.updated === "1" ? (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Product updated successfully.
        </div>
      ) : null}

      {query.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {query.error}
        </div>
      ) : null}

      <Card>
        <form action={updateProductAction} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">Name</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.name} id="name" name="name" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="slug">Slug</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.slug} id="slug" name="slug" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sku">SKU</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.sku} id="sku" name="sku" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="priceMajor">Price (KES)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={fromMinorUnits(product.price)} id="priceMajor" min="0" name="priceMajor" required step="0.01" type="number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="compareAtPriceMajor">Compare At Price (KES)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.compare_at_price !== null ? fromMinorUnits(product.compare_at_price) : ""} id="compareAtPriceMajor" min="0" name="compareAtPriceMajor" step="0.01" type="number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="stockQty">Stock Qty</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.stock_qty} id="stockQty" min="0" name="stockQty" required type="number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">Status</label>
            <select className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.status} id="status" name="status">
              {PRODUCT_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="categoryId">Category</label>
            <select className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={product.category_id} id="categoryId" name="categoryId" required>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="imageUrl">Image URL</label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={product.image_url || ""}
              id="imageUrl"
              name="imageUrl"
              placeholder="https://..."
              type="url"
            />
            <p className="mt-1 text-xs text-slate-500">Paste a direct image URL</p>
            {product.image_url ? (
              <img
                alt={product.name}
                className="mt-2 h-24 w-24 rounded-md border border-slate-200 bg-white object-contain p-1"
                loading="lazy"
                src={product.image_url}
              />
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">Description</label>
            <textarea className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={product.description || ""} id="description" name="description" />
          </div>

          <div className="md:col-span-2">
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <p className="text-sm text-slate-600">
          Delete this product if it was created by mistake and has no order history.
        </p>
        <ConfirmDeleteForm
          action={deleteProductAction}
          triggerLabel="Delete Product"
          title="Delete Product"
          message="Delete this product? This cannot be undone."
        />
      </Card>
    </div>
  );
}
