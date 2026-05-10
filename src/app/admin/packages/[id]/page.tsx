export const dynamic = "force-dynamic";

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { PackageForm } from "@/components/admin/package-form";
import { Card, SectionHeader } from "@/components/ui";
import { canDelete, OPERATIONAL_ROLES } from "@/lib/admin-permissions";
import { requireAdminSession } from "@/lib/admin-server";
import { deletePackage, getPackageById, updatePackage } from "@/services/packages";
import { listAdminProductOptions } from "@/services/admin-products";
import type { CurrencyCode } from "@/types";

const packageItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive()
});

const updatePackageSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  tagline: z.string().trim().max(500).optional(),
  description: z.string().trim().max(5000).optional(),
  heroImageUrl: z.string().trim().url().optional().or(z.literal("")),
  infographicImageUrl: z.string().trim().url().optional().or(z.literal("")),
  overridePrice: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().nonnegative().optional()
  ),
  currency: z.enum(["UGX", "KES"]),
  dmKeyword: z.string().trim().max(50).optional(),
  isActive: z.preprocess((val) => val === "on" || val === true, z.boolean()),
  isFeatured: z.preprocess((val) => val === "on" || val === true, z.boolean()),
  sortOrder: z.coerce.number().int().nonnegative(),
  items: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(packageItemSchema).min(1, "At least one product is required")
  )
});

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function AdminEditPackagePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; updated?: string; created?: string }>;
}) {
  const session = await requireAdminSession(OPERATIONAL_ROLES);
  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  const [pkg, products] = await Promise.all([
    getPackageById(id),
    listAdminProductOptions()
  ]);

  if (!pkg) {
    notFound();
  }

  async function updatePackageAction(formData: FormData) {
    "use server";

    await requireAdminSession(OPERATIONAL_ROLES);

    const parsed = updatePackageSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      tagline: formData.get("tagline"),
      description: formData.get("description"),
      heroImageUrl: formData.get("heroImageUrl"),
      infographicImageUrl: formData.get("infographicImageUrl"),
      overridePrice: formData.get("overridePrice"),
      currency: formData.get("currency"),
      dmKeyword: formData.get("dmKeyword"),
      isActive: formData.get("isActive"),
      isFeatured: formData.get("isFeatured"),
      sortOrder: formData.get("sortOrder"),
      items: formData.get("items")
    });

    if (!parsed.success) {
      const errorMessage = parsed.error.errors[0]?.message || "Invalid package data.";
      redirect(`/admin/packages/${id}?error=${encodeURIComponent(errorMessage)}`);
    }

    const normalizedSlug = normalizeSlug(parsed.data.slug);
    if (normalizedSlug.length < 2) {
      redirect(`/admin/packages/${id}?error=${encodeURIComponent("Slug must include letters or numbers.")}`);
    }

    try {
      await updatePackage(id, {
        name: parsed.data.name,
        slug: normalizedSlug,
        tagline: parsed.data.tagline || null,
        description: parsed.data.description || null,
        hero_image_url: parsed.data.heroImageUrl || null,
        infographic_image_url: parsed.data.infographicImageUrl || null,
        override_price_minor: parsed.data.overridePrice ?? null,
        currency: parsed.data.currency as CurrencyCode,
        dm_keyword: parsed.data.dmKeyword || null,
        is_active: parsed.data.isActive,
        is_featured: parsed.data.isFeatured,
        sort_order: parsed.data.sortOrder,
        items: parsed.data.items
      });

      revalidatePath("/admin/packages");
      revalidatePath(`/admin/packages/${id}`);
      revalidatePath("/packages");
      revalidatePath(`/packages/${normalizedSlug}`);
      redirect(`/admin/packages/${id}?updated=1`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update package.";
      redirect(`/admin/packages/${id}?error=${encodeURIComponent(message)}`);
    }
  }

  async function deletePackageAction() {
    "use server";

    const session = await requireAdminSession(OPERATIONAL_ROLES);

    if (!canDelete(session.role)) {
      redirect(`/admin/packages/${id}?error=${encodeURIComponent("Forbidden: Only super admins can delete packages.")}`);
    }

    try {
      await deletePackage(id);
      revalidatePath("/admin/packages");
      revalidatePath("/packages");
      redirect("/admin/packages?deleted=1");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete package.";
      redirect(`/admin/packages/${id}?error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Edit: ${pkg.name}`}
        description="Update package details, items, and pricing."
        action={
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/packages">
            Back to Packages
          </Link>
        }
      />

      {query.created === "1" && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Package created successfully.
        </div>
      )}

      {query.updated === "1" && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Package updated successfully.
        </div>
      )}

      {query.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {query.error}
        </div>
      )}

      <PackageForm
        products={products}
        initialData={pkg}
        action={updatePackageAction}
        submitLabel="Save Changes"
      />

      {canDelete(session.role) && (
        <Card>
          <p className="text-sm text-slate-600">
            Delete this package if it was created by mistake. This will not affect the individual products.
          </p>
          <ConfirmDeleteForm
            action={deletePackageAction}
            triggerLabel="Delete Package"
            title="Delete Package"
            message="Delete this package? This cannot be undone."
          />
        </Card>
      )}
    </div>
  );
}
