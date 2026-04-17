import Link from "next/link";
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

function buildLoadMoreHref(params: {
  search: string;
  category: string;
  availability: "all" | "in_stock" | "out_of_stock";
  sort: "featured" | "price_asc" | "price_desc" | "name_asc";
  page: number;
}): string {
  const query = new URLSearchParams();

  if (params.search.trim()) query.set("search", params.search.trim());
  if (params.category !== "all") query.set("category", params.category);
  if (params.availability !== "all") query.set("availability", params.availability);
  if (params.sort !== "featured") query.set("sort", params.sort);
  query.set("page", String(params.page));

  return `/shop?${query.toString()}`;
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

  const visibleCount = page * PRODUCTS_PER_PAGE;
  const paginatedProducts = snapshot.products.slice(0, visibleCount);
  const hasMoreProducts = paginatedProducts.length < snapshot.products.length;

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
        products={paginatedProducts}
      />

      {hasMoreProducts ? (
        <div className="flex justify-center pt-2">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            href={buildLoadMoreHref({
              search,
              category,
              availability,
              sort,
              page: page + 1
            })}
          >
            Load more
          </Link>
        </div>
      ) : null}
    </PageContainer>
  );
}
