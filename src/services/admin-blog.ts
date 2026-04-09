import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { BlogChannelTarget, BlogPostStatus } from "@/types";

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
  internal_tags: string[] | null;
  channel_targets: BlogChannelTarget[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: BlogPostStatus;
  author: string;
  tags: string[];
  internal_tags: string[];
  channel_targets: BlogChannelTarget[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminBlogPostDetail extends AdminBlogPostListItem {
  content: string;
  cover_image_url: string | null;
}

export interface UpsertAdminBlogPostInput {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  author: string;
  tags: string[];
  internal_tags: string[];
  channel_targets: BlogChannelTarget[];
}

export interface ListAdminBlogPostsInput {
  search?: string;
  status?: "all" | BlogPostStatus;
  page?: number;
  pageSize?: number;
}

export interface AdminBlogPostListResult {
  posts: AdminBlogPostListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class BlogSlugConflictError extends Error {
  constructor(message: string = "A blog post with this slug already exists.") {
    super(message);
    this.name = "BlogSlugConflictError";
  }
}

export class AdminBlogUnavailableError extends Error {
  constructor(message: string = "Blog management is temporarily unavailable in admin.") {
    super(message);
    this.name = "AdminBlogUnavailableError";
  }
}

function hasErrorCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string | null };
  return candidate.code === code;
}

function clampPage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value as number));
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(1, Math.min(100, Math.floor(value as number)));
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

function normalizeChannelTargets(value: unknown): BlogChannelTarget[] {
  if (!Array.isArray(value)) return [];

  const allowed: BlogChannelTarget[] = ["SHOP", "WHATSAPP", "NEWSLETTER", "SOCIAL"];
  const allowedSet = new Set<string>(allowed);
  const deduped = new Set<BlogChannelTarget>();

  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const cleaned = entry.trim().toUpperCase();
    if (!allowedSet.has(cleaned)) continue;
    deduped.add(cleaned as BlogChannelTarget);
  }

  return [...deduped];
}

function toListItem(row: BlogPostRow): AdminBlogPostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    status: row.status,
    author: row.author,
    tags: normalizeTags(row.tags),
    internal_tags: normalizeTags(row.internal_tags),
    channel_targets: normalizeChannelTargets(row.channel_targets),
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function assertUniqueSlug(slug: string, excludeId?: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return;
  if (excludeId && data.id === excludeId) return;

  throw new BlogSlugConflictError();
}

export async function listAdminBlogPosts(
  input: ListAdminBlogPostsInput = {}
): Promise<AdminBlogPostListResult> {
  const supabase = createServiceRoleSupabaseClient();
  const page = clampPage(input.page);
  const pageSize = clampPageSize(input.pageSize);
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, status, author, tags, internal_tags, channel_targets, published_at, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  const normalizedSearch = input.search?.trim();
  if (normalizedSearch) {
    const escaped = normalizedSearch.replace(/[%_]/g, "\\$&");
    query = query.or(`title.ilike.%${escaped}%,slug.ilike.%${escaped}%,author.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    if (hasErrorCode(error, "PGRST205")) {
      throw new AdminBlogUnavailableError(
        "Blog schema is missing in cache. Apply latest migrations and reload PostgREST."
      );
    }

    throw new AdminBlogUnavailableError(
      "We couldn't load blog posts right now. Please check your database connection and try again."
    );
  }

  return {
    posts: ((data ?? []) as BlogPostRow[]).map(toListItem),
    totalCount: count || 0,
    page,
    pageSize
  };
}

export async function getAdminBlogPostById(id: string): Promise<AdminBlogPostDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, cover_image_url, status, author, tags, internal_tags, channel_targets, published_at, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as BlogPostRow;
  const base = toListItem(row);

  return {
    ...base,
    content: row.content,
    cover_image_url: row.cover_image_url
  };
}

export async function createAdminBlogPost(input: UpsertAdminBlogPostInput): Promise<{ id: string }> {
  await assertUniqueSlug(input.slug);
  const supabase = createServiceRoleSupabaseClient();
  const nowIso = new Date().toISOString();

  const payload = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_image_url: input.cover_image_url,
    status: input.status,
    author: input.author,
    tags: input.tags,
    internal_tags: input.internal_tags,
    channel_targets: input.channel_targets,
    published_at: input.status === "PUBLISHED" ? nowIso : null
  };

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") throw new BlogSlugConflictError();
    throw error || new Error("Failed to create blog post.");
  }

  return { id: data.id };
}

export async function updateAdminBlogPost(id: string, input: UpsertAdminBlogPostInput): Promise<{ id: string; slug: string }> {
  await assertUniqueSlug(input.slug, id);
  const supabase = createServiceRoleSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from("blog_posts")
    .select("id, published_at")
    .eq("id", id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Blog post not found.");

  const publishedAt =
    input.status === "PUBLISHED"
      ? existing.published_at || new Date().toISOString()
      : null;

  const payload = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_image_url: input.cover_image_url,
    status: input.status,
    author: input.author,
    tags: input.tags,
    internal_tags: input.internal_tags,
    channel_targets: input.channel_targets,
    published_at: publishedAt,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error?.code === "23505") throw new BlogSlugConflictError();
    throw error || new Error("Failed to update blog post.");
  }

  return { id: data.id, slug: data.slug };
}

export async function deleteAdminBlogPost(id: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}
