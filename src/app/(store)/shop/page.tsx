import { PageContainer } from "@/components/layout/page-container";
import { ShopCatalog } from "@/components/storefront/client";
import { SectionHeader } from "@/components/ui/section-header";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontCatalogSnapshot } from "@/services/products";

export const dynamic = "force-dynamic";
export const metadata = buildStorefrontMetadata({
  title: "Shop Wellness Products",
  description:
    "Browse BF Suma wellness products in Kenya by category, availability, and price. Compare trusted formulations and check out with transparent totals.",
  path: "/shop"
});

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

  const snapshot = await getStorefrontCatalogSnapshot();
  const degradedMessage = getCommerceDegradedMessage(snapshot.health);

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">Shop wellness products</h1>
      <section className="rounded-2xl border border-sky-200/60 bg-logo-spectrum-cool p-5 shadow-soft sm:p-6">
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

      <ShopCatalog
        categories={snapshot.categories}
        initialState={{
          search,
          category,
          availability,
          sort
        }}
        products={snapshot.products}
      />
    </PageContainer>
  );
}
