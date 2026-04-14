export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { RelatedProducts } from "@/components/storefront";
import { ProductDetail } from "@/components/storefront/client";
import { ProductReviewForm } from "@/components/storefront/product-review-form";
import { ProductReviewsList } from "@/components/storefront/product-reviews-list";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { getPdfProductContentForCatalogSlug } from "@/lib/catalog/pdf-catalog-content";
import { getCommerceDegradedMessage } from "@/lib/catalog-health";
import { buildProductMetaDescription, buildStorefrontMetadata, toAbsoluteUrl } from "@/lib/seo";
import { listPublishedBlogPosts, type BlogPostListItem } from "@/services/blog";
import {
  getApprovedReviewsForProduct,
  getProductAverageRating,
  type ProductReview
} from "@/services/product-reviews";
import {
  getProductUnitsSoldThisWeek,
  getStorefrontCatalogHealth,
  getStorefrontProductBySlug,
  listRelatedProducts
} from "@/services/products";

function toSchemaAvailability(availability: "in_stock" | "low_stock" | "out_of_stock") {
  if (availability === "out_of_stock") return "https://schema.org/OutOfStock";
  return "https://schema.org/InStock";
}

function pickFeaturedReview(reviews: ProductReview[]): ProductReview | null {
  if (reviews.length === 0) return null;

  const positive = reviews.filter((review) => review.rating >= 4);
  const candidates = positive.length > 0 ? positive : reviews;

  return [...candidates].sort((a, b) => {
    const scoreA = a.rating * 100 + (a.is_verified_purchase ? 20 : 0) + Math.min(a.comment.length, 240);
    const scoreB = b.rating * 100 + (b.is_verified_purchase ? 20 : 0) + Math.min(b.comment.length, 240);
    return scoreB - scoreA;
  })[0] || null;
}

function listRelatedLearningPosts(posts: BlogPostListItem[], productName: string, categoryName: string) {
  const keywords = `${productName} ${categoryName}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

  return posts
    .map((post) => {
      const searchable = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
      const score = keywords.reduce((sum, keyword) => {
        return searchable.includes(keyword) ? sum + 1 : sum;
      }, 0);
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.created_at.localeCompare(a.post.created_at))
    .slice(0, 2)
    .map((entry) => entry.post);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    return buildStorefrontMetadata({
      title: "Product not found",
      description: "The requested product could not be found. Browse the BF Suma catalog for available wellness essentials.",
      path: "/shop"
    });
  }

  return buildStorefrontMetadata({
    title: `${product.name}`,
    description: buildProductMetaDescription({
      name: product.name,
      categoryName: product.category_name,
      description: product.description
    }),
    path: `/shop/${product.slug}`,
    keywords: [
      `${product.name} Kenya`,
      `${product.category_name} Kenya`,
      "BF Suma products"
    ]
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, health] = await Promise.all([
    getStorefrontProductBySlug(slug),
    getStorefrontCatalogHealth()
  ]);

  if (!product) {
    notFound();
  }

  const [relatedProducts, reviews, ratingSummary, unitsSoldThisWeek, publishedPosts] = await Promise.all([
    listRelatedProducts(product, 3),
    getApprovedReviewsForProduct(product.id),
    getProductAverageRating(product.id),
    getProductUnitsSoldThisWeek(product.id),
    listPublishedBlogPosts()
  ]);

  const pdfContent = getPdfProductContentForCatalogSlug(product.slug);
  const featuredReview = pickFeaturedReview(reviews);
  const relatedLearningPosts = listRelatedLearningPosts(publishedPosts, product.name, product.category_name);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [toAbsoluteUrl(product.image_url)],
    sku: product.sku,
    category: product.category_name,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability: toSchemaAvailability(product.availability),
      url: toAbsoluteUrl(`/shop/${product.slug}`)
    },
    aggregateRating: ratingSummary.count > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: ratingSummary.average,
          reviewCount: ratingSummary.count
        }
      : undefined
  };

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category_name, href: `/category/${product.category_slug}` },
          { label: product.name }
        ]}
      />

      {!health.commerceReady ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {getCommerceDegradedMessage(health)}
        </div>
      ) : null}

      <ProductDetail
        averageRating={ratingSummary.average}
        commerceReady={health.commerceReady}
        degradedReason={health.degradedReason}
        featuredReview={featuredReview}
        pdfContent={pdfContent}
        product={product}
        reviewCount={ratingSummary.count}
        soldThisWeek={unitsSoldThisWeek}
      />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6" id="reviews">
        <h2 className="text-xl font-semibold text-slate-900">Customer reviews</h2>
        <p className="text-sm text-slate-600">
          Reviews are moderated for quality. Share your own experience to help the next customer choose confidently.
        </p>
        <ProductReviewsList
          averageRating={ratingSummary.average}
          reviewCount={ratingSummary.count}
          reviews={reviews}
        />
        <ProductReviewForm productId={product.id} productName={product.name} />
      </section>

      {relatedLearningPosts.length > 0 ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">Learn more about {product.category_name}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedLearningPosts.map((post) => (
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={post.id}>
                <h3 className="text-base font-semibold text-slate-900">
                  <Link className="transition hover:text-brand-700" href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>
                <Link
                  aria-label={`Read article: ${post.title}`}
                  className="mt-3 inline-flex text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                  href={`/blog/${post.slug}`}
                >
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <RelatedProducts products={relatedProducts} />
    </PageContainer>
  );
}
