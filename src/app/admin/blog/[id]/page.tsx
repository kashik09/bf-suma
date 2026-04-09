import { revalidatePath, revalidateTag } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import {
  BlogSlugConflictError,
  deleteAdminBlogPost,
  getAdminBlogPostById,
  updateAdminBlogPost
} from "@/services/admin-blog";
import type { BlogChannelTarget, BlogPostStatus } from "@/types";

const BLOG_STATUS_VALUES = ["DRAFT", "REVIEW", "PUBLISHED"] as const;
const BLOG_CHANNEL_TARGETS = ["SHOP", "WHATSAPP", "NEWSLETTER", "SOCIAL"] as const;

const updateBlogPostSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(160),
  author: z.string().trim().min(2).max(120),
  excerpt: z.string().trim().max(320).optional(),
  coverImageUrl: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().url().optional()
  ),
  status: z.enum(BLOG_STATUS_VALUES),
  tags: z.string().trim().max(400).optional(),
  internalTags: z.string().trim().max(500).optional(),
  content: z.string().trim().min(20).max(50000)
});

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  const unique = new Set<string>();
  for (const part of value.split(",")) {
    const cleaned = part.trim();
    if (!cleaned) continue;
    unique.add(cleaned);
  }
  return [...unique];
}

function parseChannelTargets(values: FormDataEntryValue[]): BlogChannelTarget[] {
  const allowed = new Set<string>(BLOG_CHANNEL_TARGETS);
  const deduped = new Set<BlogChannelTarget>();

  values.forEach((value) => {
    if (typeof value !== "string") return;
    const cleaned = value.trim().toUpperCase();
    if (!allowed.has(cleaned)) return;
    deduped.add(cleaned as BlogChannelTarget);
  });

  return [...deduped];
}

function parseErrorMessage(error: unknown): string {
  if (error instanceof BlogSlugConflictError) return error.message;
  return "We couldn't save your blog post changes. Check your connection and try again.";
}

export default async function AdminBlogDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; updated?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
  const { id } = await params;
  const post = await getAdminBlogPostById(id);
  if (!post) {
    notFound();
  }

  const query = searchParams ? await searchParams : {};
  const previousSlug = post.slug;

  async function updateBlogPostAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    const parsed = updateBlogPostSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      author: formData.get("author"),
      excerpt: formData.get("excerpt"),
      coverImageUrl: formData.get("coverImageUrl"),
      status: formData.get("status"),
      tags: formData.get("tags"),
      internalTags: formData.get("internalTags"),
      content: formData.get("content")
    });
    const channelTargets = parseChannelTargets(formData.getAll("channelTargets"));

    if (!parsed.success) {
      redirect(`/admin/blog/${id}?error=Invalid%20blog%20payload.`);
    }

    const normalizedSlug = normalizeSlug(parsed.data.slug);
    if (normalizedSlug.length < 2) {
      redirect(`/admin/blog/${id}?error=Slug%20must%20include%20letters%20or%20numbers.`);
    }

    try {
      const updated = await updateAdminBlogPost(id, {
        title: parsed.data.title,
        slug: normalizedSlug,
        author: parsed.data.author,
        excerpt: parsed.data.excerpt?.trim() || null,
        content: parsed.data.content,
        cover_image_url: parsed.data.coverImageUrl ?? null,
        status: parsed.data.status as BlogPostStatus,
        tags: parseTags(parsed.data.tags),
        internal_tags: parseTags(parsed.data.internalTags),
        channel_targets: channelTargets
      });

      revalidateTag("blog");
      revalidatePath("/blog");
      revalidatePath(`/blog/${previousSlug}`);
      revalidatePath(`/blog/${updated.slug}`);
      revalidatePath("/admin/blog");
      revalidatePath(`/admin/blog/${id}`);
      redirect(`/admin/blog/${id}?updated=1`);
    } catch (error) {
      redirect(`/admin/blog/${id}?error=${encodeURIComponent(parseErrorMessage(error))}`);
    }
  }

  async function deleteBlogPostAction() {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    try {
      await deleteAdminBlogPost(id);
      revalidateTag("blog");
      revalidatePath("/blog");
      revalidatePath(`/blog/${previousSlug}`);
      revalidatePath("/admin/blog");
      redirect("/admin/blog?deleted=1");
    } catch {
      redirect(`/admin/blog/${id}?error=${encodeURIComponent("We couldn't delete this blog post. Please try again.")}`);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Edit ${post.title}`}
        description="Update editorial workflow, reusable internal tags, and channel distribution targets."
        action={
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/blog">
            Back to Blog Posts
          </Link>
        }
      />

      {query.updated === "1" ? (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Blog post updated successfully.
        </div>
      ) : null}

      {query.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {query.error}
        </div>
      ) : null}

      <Card>
        <form action={updateBlogPostAction} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">Title</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.title} id="title" name="title" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="slug">Slug</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.slug} id="slug" name="slug" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="author">Author</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.author} id="author" name="author" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">Status</label>
            <select className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.status} id="status" name="status">
              {BLOG_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="coverImageUrl">Cover Image URL</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.cover_image_url || ""} id="coverImageUrl" name="coverImageUrl" placeholder="https://..." type="url" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="excerpt">Excerpt</label>
            <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={post.excerpt || ""} id="excerpt" maxLength={320} name="excerpt" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="tags">Tags (comma separated)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.tags.join(", ")} id="tags" name="tags" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="internalTags">Internal Tags (for reuse)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue={post.internal_tags.join(", ")} id="internalTags" name="internalTags" />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Channel Targets</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {BLOG_CHANNEL_TARGETS.map((target) => (
                <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700" key={target}>
                  <input defaultChecked={post.channel_targets.includes(target)} name="channelTargets" type="checkbox" value={target} />
                  {target}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="content">Content</label>
            <textarea className="min-h-72 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={post.content} id="content" name="content" required />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <p className="text-sm text-slate-600">Delete this post permanently if it is no longer needed.</p>
        <ConfirmDeleteForm
          action={deleteBlogPostAction}
          triggerLabel="Delete Post"
          title="Delete Post"
          message="Delete this post? This cannot be undone."
        />
      </Card>
    </div>
  );
}
