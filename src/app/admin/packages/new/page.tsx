export const dynamic = "force-dynamic";

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PackageForm } from "@/components/admin/package-form";
import { SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { createPackage } from "@/services/packages";
import { listAdminProductOptions } from "@/services/admin-products";
import type { CurrencyCode } from "@/types";

const packageItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive()
});

const createPackageSchema = z.object({
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

export default async function AdminNewPackagePage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
  const query = searchParams ? await searchParams : {};
  const products = await listAdminProductOptions();

  async function createPackageAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    const parsed = createPackageSchema.safeParse({
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
      redirect(`/admin/packages/new?error=${encodeURIComponent(errorMessage)}`);
    }

    const normalizedSlug = normalizeSlug(parsed.data.slug);
    if (normalizedSlug.length < 2) {
      redirect(`/admin/packages/new?error=${encodeURIComponent("Slug must include letters or numbers.")}`);
    }

    try {
      const created = await createPackage({
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
      revalidatePath("/packages");
      redirect(`/admin/packages/${created.id}?created=1`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create package.";
      redirect(`/admin/packages/new?error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="New Package"
        description="Create a health package that bundles multiple products together."
        action={
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/packages">
            Back to Packages
          </Link>
        }
      />

      {query.error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {query.error}
        </div>
      )}

      <PackageForm
        products={products}
        action={createPackageAction}
        submitLabel="Create Package"
      />
    </div>
  );
}
