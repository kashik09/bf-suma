import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PackageCard } from "@/components/storefront/package-card";
import { PaginationFooter } from "@/components/storefront/pagination-footer";
import { SectionHeader } from "@/components/ui/section-header";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getPackages } from "@/services/packages";

export const dynamic = "force-dynamic";

export const metadata = buildStorefrontMetadata({
  title: "Wellness Bundles",
  description:
    "Save with BF Suma Wellness Bundles. Curated bundles for immunity, weight loss, detox, and more. Each package includes multiple products at a discounted price.",
  path: "/packages"
});

const PACKAGES_PER_PAGE = 12;

type PackagesSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function parsePage(value: string | string[] | undefined): number {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return 1;
  const parsed = Number.parseInt(v, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export default async function PackagesPage({ searchParams }: { searchParams: PackagesSearchParams }) {
  const resolvedParams = await searchParams;
  const page = parsePage(resolvedParams.page);
  const allPackages = await getPackages();

  const totalPages = Math.ceil(allPackages.length / PACKAGES_PER_PAGE);
  const startIndex = (page - 1) * PACKAGES_PER_PAGE;
  const packages = allPackages.slice(startIndex, startIndex + PACKAGES_PER_PAGE);

  const featuredPackages = packages.filter((pkg) => pkg.is_featured && pkg.is_in_stock);
  const otherPackages = packages.filter((pkg) => !pkg.is_featured || !pkg.is_in_stock);

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <h1 className="sr-only">Wellness Bundles</h1>

      <section className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Wellness Bundles"
          description="Curated wellness bundles combining multiple products for specific health goals. Each package saves you money compared to buying items separately."
        />
      </section>

      {featuredPackages.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Featured Packages</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg) => (
              <PackageCard featured key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      )}

      {otherPackages.length > 0 && (
        <section className="space-y-4">
          {featuredPackages.length > 0 && (
            <h2 className="text-xl font-semibold text-slate-900">All Packages</h2>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {otherPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      )}

      {packages.length === 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">No packages available</h2>
          <p className="mt-2 text-sm text-slate-600">
            Wellness Bundles are being prepared. Check back soon or browse individual products.
          </p>
          <a
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/shop"
          >
            Browse Products
          </a>
        </section>
      )}

      <Suspense fallback={null}>
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/packages"
          preserveParams={{}}
        />
      </Suspense>
    </PageContainer>
  );
}
