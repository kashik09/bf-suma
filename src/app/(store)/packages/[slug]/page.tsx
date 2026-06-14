import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, MessageCircle, Package, ShieldCheck, Tag, Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PackageAddToCart } from "@/components/storefront/package-add-to-cart";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { WHATSAPP_PHONE } from "@/lib/constants";
import { buildStorefrontMetadata, toAbsoluteUrl } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getPackageBySlug } from "@/services/packages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    return buildStorefrontMetadata({
      title: "Package not found",
      description: "The requested package could not be found.",
      path: "/packages"
    });
  }

  return buildStorefrontMetadata({
    title: pkg.name,
    description: pkg.tagline || pkg.description || `${pkg.name} - ${pkg.item_count} products bundled together`,
    path: `/packages/${pkg.slug}`,
    image: pkg.hero_image_url || undefined
  });
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    notFound();
  }

  const dmWhatsAppUrl = pkg.dm_keyword
    ? buildWhatsAppUrl(pkg.dm_keyword, WHATSAPP_PHONE)
    : null;

  const packageJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.name,
    description: pkg.description || pkg.tagline,
    image: pkg.hero_image_url ? [toAbsoluteUrl(pkg.hero_image_url)] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: pkg.currency,
      price: (pkg.final_price / (pkg.currency === "UGX" ? 1 : 100)).toFixed(pkg.currency === "UGX" ? 0 : 2),
      availability: pkg.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: toAbsoluteUrl(`/packages/${pkg.slug}`)
    }
  };

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packageJsonLd) }}
      />

      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Packages", href: "/packages" },
          { label: pkg.name }
        ]}
      />

      {/* Hero Section */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-soft">
          {pkg.hero_image_url ? (
            <Image
              alt={`${pkg.name} health package`}
              className="object-contain p-4"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              src={pkg.hero_image_url}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-24 w-24 text-slate-300" />
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
              <Package className="h-3.5 w-3.5" />
              {pkg.item_count} products
            </span>
            {pkg.savings && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Tag className="h-3.5 w-3.5" />
                Save included
              </span>
            )}
            {!pkg.is_in_stock && (
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                Currently Unavailable
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{pkg.name}</h1>

          {pkg.tagline && (
            <p className="text-base leading-relaxed text-slate-600">{pkg.tagline}</p>
          )}

          <PackageAddToCart pkg={pkg} />

          <ul className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>All products added to cart as individual items.</span>
            </li>
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>Standard delivery and pickup options available.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              <span>Pay on delivery or at pickup location.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* What's Inside */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">What&apos;s Inside</h2>
        <p className="mt-1 text-sm text-slate-600">
          This package includes {pkg.item_count} products. Each item links to its full product page.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pkg.items.map((item) => (
            <Link
              key={item.id}
              href={`/shop/${item.product.slug}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-200 hover:bg-brand-50/50"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image
                  alt={item.product.name}
                  className="object-contain"
                  fill
                  sizes="64px"
                  src={item.product.image_url || "/catalog-images/placeholder.svg"}
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.product.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Qty: {item.quantity} × included
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Infographic */}
      {pkg.infographic_image_url && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 shadow-soft">
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <Image
              alt={`${pkg.name} infographic`}
              className="object-contain"
              fill
              sizes="100vw"
              src={pkg.infographic_image_url}
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* Description */}
      {pkg.description && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">About This Package</h2>
          <div className="prose prose-slate mt-3 max-w-none prose-p:text-slate-600 prose-li:text-slate-600">
            <ReactMarkdown>{pkg.description}</ReactMarkdown>
          </div>
        </section>
      )}

      {/* DM CTA */}
      {dmWhatsAppUrl && pkg.dm_keyword && (
        <section className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-soft sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Ready to Get Started?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">
            Send us &ldquo;{pkg.dm_keyword}&rdquo; on WhatsApp and we&apos;ll help you get this package.
          </p>
          <a
            href={dmWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-base font-semibold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" />
            DM &ldquo;{pkg.dm_keyword}&rdquo; to Get Started
          </a>
        </section>
      )}

      {/* Trust Block */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">Why This Package?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            <h3 className="mt-2 font-semibold text-slate-900">Certified Products</h3>
            <p className="mt-1 text-sm text-slate-600">
              All BF Suma products meet quality and safety standards.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <Truck className="h-6 w-6 text-brand-600" />
            <h3 className="mt-2 font-semibold text-slate-900">Fast Delivery</h3>
            <p className="mt-1 text-sm text-slate-600">
              Same-day in city areas, 1-2 days for nearby locations.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <MessageCircle className="h-6 w-6 text-brand-600" />
            <h3 className="mt-2 font-semibold text-slate-900">WhatsApp Support</h3>
            <p className="mt-1 text-sm text-slate-600">
              Get quick answers and guidance via WhatsApp anytime.
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
