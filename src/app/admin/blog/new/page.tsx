import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { BlogSlugConflictError, createAdminBlogPost } from "@/services/admin-blog";
import type { BlogChannelTarget, BlogPostStatus } from "@/types";

const BLOG_STATUS_VALUES = ["DRAFT", "REVIEW", "PUBLISHED"] as const;
const BLOG_CHANNEL_TARGETS = ["SHOP", "WHATSAPP", "NEWSLETTER", "SOCIAL"] as const;

const createBlogPostSchema = z.object({
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

function parseErrorMessage(error: unknown): string {
  if (error instanceof BlogSlugConflictError) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Could not create blog post.";
}

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

export default async function AdminNewBlogPostPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
  const query = searchParams ? await searchParams : {};

  async function createBlogPostAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    const parsed = createBlogPostSchema.safeParse({
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
      redirect("/admin/blog/new?error=Invalid%20blog%20payload.");
    }

    const normalizedSlug = normalizeSlug(parsed.data.slug);
    if (normalizedSlug.length < 2) {
      redirect("/admin/blog/new?error=Slug%20must%20include%20letters%20or%20numbers.");
    }

    try {
      const created = await createAdminBlogPost({
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

      revalidatePath("/blog");
      revalidatePath(`/blog/${normalizedSlug}`);
      revalidatePath("/admin/blog");
      redirect(`/admin/blog/${created.id}?updated=1`);
    } catch (error) {
      redirect(`/admin/blog/new?error=${encodeURIComponent(parseErrorMessage(error))}`);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Create Blog Post"
        description="Create content with a Draft -> Review -> Publish workflow and channel-ready metadata."
        action={
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/blog">
            Back to Blog Posts
          </Link>
        }
      />

      {query.error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {query.error}
        </div>
      ) : null}

      <Card>
        <form action={createBlogPostAction} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">Title</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="title" name="title" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="slug">Slug</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="slug" name="slug" placeholder="how-to-support-immunity" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="author">Author</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue="BF Suma Team" id="author" name="author" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">Status</label>
            <select className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" defaultValue="DRAFT" id="status" name="status">
              {BLOG_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="coverImageUrl">Cover Image URL</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="coverImageUrl" name="coverImageUrl" placeholder="https://..." type="url" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="excerpt">Excerpt</label>
            <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" id="excerpt" maxLength={320} name="excerpt" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="tags">Tags (comma separated)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="tags" name="tags" placeholder="nutrition, gut-health, daily-routine" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="internalTags">Internal Tags (for reuse)</label>
            <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" id="internalTags" name="internalTags" placeholder="campaign-q2, immunity-series, promo-asset" />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Channel Targets</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {BLOG_CHANNEL_TARGETS.map((target) => (
                <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700" key={target}>
                  <input defaultChecked={target === "SHOP" || target === "WHATSAPP"} name="channelTargets" type="checkbox" value={target} />
                  {target}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="content">Content</label>
            <textarea className="min-h-72 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" id="content" name="content" required />
          </div>

          <div className="md:col-span-2">
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700" type="submit">
              Create Post
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
