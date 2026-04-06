import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogProse } from "@/components/content/blog-prose";
import { PageContainer } from "@/components/layout/page-container";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { Badge } from "@/components/ui";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  getBlogReadiness,
  getPublishedBlogPostBySlug,
  listRelatedPublishedBlogPosts
} from "@/services/blog";
import { listProductsRelatedToContent } from "@/services/products";

interface BlogPageParams {
  slug: string;
}

function formatPublishedDate(value: string | null, fallback: string) {
  const resolved = value || fallback;
  return new Date(resolved).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}


export async function generateMetadata({
  params
}: {
  params: Promise<BlogPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found | BF Suma"
    };
  }

  return {
    title: `${post.title} | BF Suma Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: `${post.title} | BF Suma Blog`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      url: `/blog/${post.slug}`,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined
    },
    alternates: {
      canonical: `/blog/${post.slug}`
    }
  };
}

export default async function BlogDetailPage({
  params
}: {
  params: Promise<BlogPageParams>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    const readiness = await getBlogReadiness();
    if (!readiness.ready) {
      return (
        <PageContainer className="space-y-6 py-10 sm:py-12">
          <StoreBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" }
            ]}
          />

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h1 className="text-2xl font-bold text-amber-900">Blog temporarily unavailable</h1>
            <p className="mt-2 text-sm text-amber-800">
              {readiness.message || "Please try again shortly while we restore blog content services."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/shop"
              >
                Shop Products
              </Link>
              <a
                className="inline-flex h-10 items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
                href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("blog_unavailable"), SUPPORT_WHATSAPP_PHONE)}
                rel="noreferrer"
                target="_blank"
              >
                Ask on WhatsApp
              </a>
            </div>
          </section>
        </PageContainer>
      );
    }

    notFound();
  }

  const relatedPosts = await listRelatedPublishedBlogPosts(post.id, post.tags, 3);
  const relatedProducts = await listProductsRelatedToContent(post.tags, post.title, 3);

  return (
    <PageContainer className="space-y-8 py-10 sm:py-12">
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title }
        ]}
      />

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        {post.cover_image_url ? (
          <img
            alt={post.title}
            className="max-h-[420px] w-full object-cover"
            src={post.cover_image_url}
          />
        ) : null}

        <div className="space-y-5 p-5 sm:p-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">
                {post.author} • {formatPublishedDate(post.published_at, post.created_at)}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{post.title}</h1>
            <p className="text-base text-slate-600">{post.excerpt}</p>

            {post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="info">#{tag}</Badge>
                ))}
              </div>
            ) : null}
          </header>

          <BlogProse content={post.content} />

          <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
            <h2 className="text-lg font-semibold text-slate-900">Ready to take the next step?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore products related to this topic or get quick guidance from BF Suma on WhatsApp.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/shop"
              >
                Shop Now
              </Link>
              <a
                className="inline-flex h-10 items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
                href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage(`blog:${post.slug}`), SUPPORT_WHATSAPP_PHONE)}
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp Guidance
              </a>
            </div>
          </section>
        </div>
      </article>

      {relatedProducts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Related products</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedProducts.map((product) => (
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft" key={product.id}>
                <img alt={product.name} className="h-40 w-full object-cover" src={product.image_url} />
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                  <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                    href={`/shop/${product.slug}`}
                  >
                    View Product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Related posts</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((related) => (
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft" key={related.id}>
                <h3 className="text-base font-semibold text-slate-900">
                  <Link className="transition hover:text-brand-700" href={`/blog/${related.slug}`}>
                    {related.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{related.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageContainer>
  );
}
