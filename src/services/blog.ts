import { unstable_cache } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type BlogPostStatus = "DRAFT" | "REVIEW" | "PUBLISHED";

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  author: string;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  author: string;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

export interface BlogPostDetail extends BlogPostListItem {
  content: string;
}

export interface BlogReadiness {
  ready: boolean;
  message: string | null;
}

function hasErrorCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string | null };
  return candidate.code === code;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  const unique = new Set<string>();
  for (const value of tags) {
    if (typeof value !== "string") continue;
    const cleaned = value.trim();
    if (!cleaned) continue;
    unique.add(cleaned);
  }

  return [...unique];
}

function makeExcerpt(excerpt: string | null, content: string): string {
  const cleanExcerpt = excerpt?.trim();
  if (cleanExcerpt) return cleanExcerpt;

  const condensed = content.replace(/\s+/g, " ").trim();
  if (condensed.length <= 180) return condensed;
  return `${condensed.slice(0, 177)}...`;
}

function toBlogListItem(row: BlogPostRow): BlogPostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: makeExcerpt(row.excerpt, row.content),
    cover_image_url: row.cover_image_url,
    author: row.author,
    tags: normalizeTags(row.tags),
    published_at: row.published_at,
    created_at: row.created_at
  };
}

async function fetchPublishedBlogPosts(limit?: number): Promise<BlogPostListItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, cover_image_url, author, tags, published_at, created_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (typeof limit === "number" && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  // DEBUG: Log the query result
  console.log("[blog] fetchPublishedBlogPosts result:", {
    dataLength: data?.length ?? 0,
    error: error ? { message: error.message, code: (error as { code?: string }).code } : null,
    firstPost: data?.[0]?.title ?? null
  });

  if (error) {
    if (hasErrorCode(error, "PGRST205")) {
      console.warn("blog list unavailable: blog_posts missing in schema cache");
      return [];
    }
    console.error("blog list error:", error);
    return [];
  }

  return ((data ?? []) as BlogPostRow[]).map(toBlogListItem);
}

export const listPublishedBlogPosts = unstable_cache(
  fetchPublishedBlogPosts,
  ["blog-posts-list"],
  { revalidate: 60, tags: ["blog"] }
);

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, cover_image_url, author, tags, published_at, created_at")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) {
    if (hasErrorCode(error, "PGRST205")) {
      console.warn("blog detail unavailable: blog_posts missing in schema cache");
      return null;
    }
    console.error("blog detail error:", error);
    return null;
  }

  if (!data) return null;

  const row = data as BlogPostRow;
  const base = toBlogListItem(row);

  return {
    ...base,
    content: row.content
  };
}

function getTagOverlapCount(source: string[], target: string[]): number {
  if (source.length === 0 || target.length === 0) return 0;
  const sourceSet = new Set(source.map((item) => item.toLowerCase()));
  return target.reduce((count, item) => {
    return sourceSet.has(item.toLowerCase()) ? count + 1 : count;
  }, 0);
}

export async function listRelatedPublishedBlogPosts(
  postId: string,
  tags: string[],
  limit: number = 3
): Promise<BlogPostListItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, cover_image_url, author, tags, published_at, created_at")
    .eq("status", "PUBLISHED")
    .neq("id", postId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(Math.max(limit * 3, limit));

  if (error) {
    if (hasErrorCode(error, "PGRST205")) {
      console.warn("related blog posts unavailable: blog_posts missing in schema cache");
      return [];
    }
    console.error("related blog posts error:", error);
    return [];
  }

  const posts = ((data ?? []) as BlogPostRow[]).map(toBlogListItem);

  return posts
    .sort((a, b) => {
      const overlapA = getTagOverlapCount(tags, a.tags);
      const overlapB = getTagOverlapCount(tags, b.tags);

      if (overlapA !== overlapB) return overlapB - overlapA;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, limit);
}

export async function getBlogReadiness(): Promise<BlogReadiness> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("blog_posts").select("id", { count: "exact", head: true }).limit(1);

  if (!error) {
    return { ready: true, message: null };
  }

  if (hasErrorCode(error, "PGRST205")) {
    return {
      ready: false,
      message: "Blog is temporarily unavailable while schema migrations are pending."
    };
  }

  return {
    ready: false,
    message: "Blog is temporarily unavailable. Please try again shortly."
  };
}
