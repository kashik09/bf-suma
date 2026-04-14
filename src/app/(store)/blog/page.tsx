import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { buildStorefrontMetadata, getBlogSeoTitle } from "@/lib/seo";
import { listPublishedBlogPosts } from "@/services/blog";
import { listFeaturedProducts } from "@/services/products";

// Force dynamic rendering to avoid build-time fetch failures
export const dynamic = "force-dynamic";

export const metadata = buildStorefrontMetadata({
  title: "Wellness Blog",
  description:
    "Read practical wellness guides in Kenya, product education, and daily health insights from BF Suma to make faster, more confident buying decisions.",
  path: "/blog"
});

function formatPublishedDate(value: string | null, fallback: string) {
  const resolved = value || fallback;
  return new Date(resolved).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default async function BlogIndexPage() {
  const [posts, featuredProducts] = await Promise.all([
    listPublishedBlogPosts(),
    listFeaturedProducts(6)
  ]);

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <h1 className="sr-only">BF Suma wellness blog</h1>
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" }
        ]}
      />

      <section className="rounded-2xl border border-amber-200/60 bg-logo-spectrum-warm p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Blog"
          description="Wellness insights, practical guides, and product education from the BF Suma team."
          action={
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
              href="/blog/submit"
            >
              Submit an Article
            </Link>
          }
        />
      </section>

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No posts published yet</h3>
          <p className="mt-2 text-sm text-slate-600">Check back soon for new wellness updates and practical guides.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const seoTitle = getBlogSeoTitle(post.slug, post.title);
            return (
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft" key={post.id}>
                {post.cover_image_url ? (
                  <Image
                  alt={`${seoTitle} article cover image`}
                  className="h-48 w-full object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  src={post.cover_image_url}
                  unoptimized
                    width={1200}
                    height={720}
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-r from-brand-100 via-brand-50 to-slate-100" />
                )}

                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {post.author} • {formatPublishedDate(post.published_at, post.created_at)}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    <Link className="transition hover:text-brand-700" href={`/blog/${post.slug}`}>
                      {seoTitle}
                    </Link>
                  </h3>

                  <p className="line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>

                  {post.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="neutral">#{tag}</Badge>
                      ))}
                    </div>
                  ) : null}

                  <Link
                    aria-label={`Read article: ${seoTitle}`}
                    className="inline-flex text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                    href={`/blog/${post.slug}`}
                  >
                    Read article
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}