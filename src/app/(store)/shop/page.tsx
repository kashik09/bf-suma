import { PageContainer } from "@/components/layout/page-container";
import { ProductFilters, ProductGrid } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import { getStorefrontCatalogSnapshot } from "@/services/products";

type ShopSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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

  const filters = {
    search,
    categorySlug: category !== "all" ? category : undefined,
    availability,
    sort
  } as const;

  const snapshot = await getStorefrontCatalogSnapshot(filters);
  const degradedMessage = getCommerceDegradedMessage(snapshot.health);

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-sky-50/70 to-brand-50/40 p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Shop"
          description="Browse a clean, mobile-first catalog with clear pricing, clear availability, and low-friction checkout paths."
        />
      </section>

      {!snapshot.health.commerceReady ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {degradedMessage}
        </div>
      ) : null}

      <ProductFilters
        categories={snapshot.categories}
        state={{
          search: filters.search,
          category,
          availability: filters.availability,
          sort: filters.sort
        }}
      />

      <ProductGrid
        emptyDescription="No products match your current filters. Try another category or clear search."
        emptyTitle="No matching products"
        products={snapshot.products}
      />
    </PageContainer>
  );
}
