import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getBlogReadiness, listPublishedBlogPosts } from "@/services/blog";

export const metadata: Metadata = {
  title: "Blog | BF Suma",
  description: "Wellness guides, product education, and practical health insights from BF Suma."
};

function formatPublishedDate(value: string | null, fallback: string) {
  const resolved = value || fallback;
  return new Date(resolved).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default async function BlogIndexPage() {
  const [posts, readiness] = await Promise.all([
    listPublishedBlogPosts(),
    getBlogReadiness()
  ]);

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" }
        ]}
      />

      <section className="rounded-2xl border border-slate-200 bg-logo-spectrum-soft p-5 shadow-soft sm:p-6">
        <SectionHeader
          title="Blog"
          description="Wellness insights, practical guides, and product education from the BF Suma team."
        />
      </section>

      {!readiness.ready ? (
        <Card className="border-amber-300 bg-amber-50">
          <h3 className="text-base font-semibold text-amber-900">Blog is in maintenance mode</h3>
          <p className="mt-1 text-sm text-amber-800">
            {readiness.message || "Some blog data is currently unavailable. Please check back shortly."}
          </p>
        </Card>
      ) : null}

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No posts published yet</h3>
          <p className="mt-2 text-sm text-slate-600">Check back soon for new wellness updates and practical guides.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft" key={post.id}>
              {post.cover_image_url ? (
                <img
                  alt={post.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                  src={post.cover_image_url}
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
                    {post.title}
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
                  className="inline-flex text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                  href={`/blog/${post.slug}`}
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
