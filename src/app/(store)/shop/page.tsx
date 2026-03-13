import { PageContainer } from "@/components/layout/page-container";
import { ProductFilters, ProductGrid } from "@/components/storefront";
import { SectionHeader } from "@/components/ui/section-header";
import { listStorefrontCategories, listStorefrontProducts } from "@/services/products";

interface ShopPageProps {
  searchParams?: {
    search?: string;
    category?: string;
    availability?: "all" | "in_stock" | "out_of_stock";
    sort?: "featured" | "price_asc" | "price_desc" | "name_asc";
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters = {
    search: searchParams?.search || "",
    categorySlug: searchParams?.category && searchParams.category !== "all" ? searchParams.category : undefined,
    availability: searchParams?.availability || "all",
    sort: searchParams?.sort || "featured"
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
          category: searchParams?.category || "all",
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
