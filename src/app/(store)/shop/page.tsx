import { PageContainer } from "@/components/layout/page-container";
import { ProductFilters, ProductGrid } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { listStorefrontCategories, listStorefrontProducts } from "@/services/products";

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

  const [categories, products] = await Promise.all([
    listStorefrontCategories(),
    listStorefrontProducts(filters)
  ]);

  return (
    <PageContainer className="space-y-6 py-10">
      <SectionHeader
        title="Shop"
        description="Clean product browsing with practical filters and explicit availability states."
      />

      <ProductFilters
        categories={categories}
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
        products={products}
      />
    </PageContainer>
  );
}
