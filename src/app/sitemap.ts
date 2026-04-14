import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { listPublishedBlogPosts } from "@/services/blog";
import {
  listStorefrontCategories,
  listStorefrontProducts
} from "@/services/products";

export const dynamic = "force-dynamic";

function buildFallbackSitemap(baseUrl: string, now: Date): MetadataRoute.Sitemap {
  return [
    "/",
    "/shop",
    "/blog",
    "/account/login",
    "/account/signup"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();
  const fallbackPages = buildFallbackSitemap(baseUrl, now);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/blog",
    "/contact",
    "/faq",
    "/cart",
    "/checkout",
    "/privacy",
    "/terms",
    "/shipping",
    "/refund-policy"
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallbackPages;
  }

  try {
    const [products, categories, posts] = await Promise.all([
      listStorefrontProducts(),
      listStorefrontCategories(),
      listPublishedBlogPosts()
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    }));

    const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.published_at || post.created_at),
      changeFrequency: "monthly",
      priority: 0.6
    }));

    return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
  } catch {
    return fallbackPages;
  }
}
