import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { ShopCatalog } from "@/components/storefront/client";
import { PaginationFooter } from "@/components/storefront/pagination-footer";
import { SectionHeader } from "@/components/ui/section-header";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontCatalogSnapshot } from "@/services/products";

export const dynamic = "force-dynamic";
export const metadata = buildStorefrontMetadata({
  title: "Shop BF Suma Products in Uganda | Supplements & Wellness",
  description:
    "Browse 24+ authentic BF Suma health products in Uganda. From immune boosters and digestive health to men's and women's wellness. Clear prices in UGX. Order today.",
  path: "/shop"
});

type ShopSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const PRODUCTS_PER_PAGE = 24;

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePage(value: string | undefined): number {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export default async function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = getSingleSearchParam(resolvedSearchParams.search) || "";
  const category = getSingleSearchParam(resolvedSearchParams.category) || "all";
  const availability =
    (getSingleSearchParam(resolvedSearchParams.availability) as "all" | "in_stock" | "out_of_stock" | undefined) ||
    "all";
  const sort =
    (getSingleSearchParam(resolvedSearchParams.sort) as
      | "featured"
      | "price_asc"
      | "price_desc"
      | "name_asc"
      | undefined) || "featured";
  const page = parsePage(getSingleSearchParam(resolvedSearchParams.page));

  const snapshot = await getStorefrontCatalogSnapshot({
    search: search || undefined,
    categorySlug: category === "all" ? undefined : category,
    availability,
    sort
  });
  const degradedMessage = getCommerceDegradedMessage(snapshot.health);

  const totalPages = Math.ceil(snapshot.products.length / PRODUCTS_PER_PAGE);
  const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
  const endIndex = page * PRODUCTS_PER_PAGE;
  const paginatedProducts = snapshot.products.slice(startIndex, endIndex);

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">Shop wellness products</h1>
      <section className="rounded-2xl border border-sky-200/60 bg-logo-spectrum-cool p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Shop"
          description="Browse a clean, mobile-first catalog with clear pricing and low-friction checkout paths."
        />
      </section>

      {!snapshot.health.commerceReady ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {degradedMessage}
        </div>
      ) : null}

      <ShopCatalog
        categories={snapshot.categories}
        initialState={{
          search,
          category,
          availability,
          sort
        }}
        products={paginatedProducts}
      />

      <Suspense fallback={null}>
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/shop"
          preserveParams={{
            ...(search ? { search } : {}),
            ...(category !== "all" ? { category } : {}),
            ...(availability !== "all" ? { availability } : {}),
            ...(sort !== "featured" ? { sort } : {})
          }}
        />
      </Suspense>
    </PageContainer>
  );
}
