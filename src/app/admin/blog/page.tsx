import Link from "next/link";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { AdminBlogUnavailableError, listAdminBlogPosts } from "@/services/admin-blog";
import type { BlogPostStatus } from "@/types";

type BlogSearchParams = Promise<{
  search?: string;
  status?: "all" | BlogPostStatus;
  deleted?: string;
}>;

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  PUBLISHED: "Published"
};

function formatDate(value: string | null) {
  if (!value) return "Not published";
  return new Date(value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default async function AdminBlogPage({
  searchParams
}: {
  searchParams?: BlogSearchParams;
}) {
  const session = await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const canManageBlog = session.role === "SUPER_ADMIN" || session.role === "OPERATIONS";

  const query = searchParams ? await searchParams : {};
  const searchTerm = typeof query.search === "string" ? query.search : "";
  const statusFilter =
    query.status === "DRAFT" || query.status === "REVIEW" || query.status === "PUBLISHED" ? query.status : "all";

  let posts: Awaited<ReturnType<typeof listAdminBlogPosts>> = [];
  let loadError: string | null = null;

  try {
    posts = await listAdminBlogPosts({
      search: searchTerm,
      status: statusFilter
    });
  } catch (error) {
    loadError =
      error instanceof AdminBlogUnavailableError
        ? error.message
        : "Could not load blog posts right now. Please retry shortly.";
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Blog Posts"
        description={
          loadError
            ? "Blog management is degraded right now. Resolve the warning below to restore content operations."
            : "Create, draft, publish, and manage storefront blog content."
        }
      />

      {query.deleted === "1" ? (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Blog post deleted successfully.
        </div>
      ) : null}

      {loadError ? (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Blog data is degraded</p>
          <p className="mt-1 text-sm text-amber-800">{loadError}</p>
        </Card>
      ) : null}

      <Card>
        <form action="/admin/blog" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search">
              Search
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={searchTerm}
              id="search"
              name="search"
              placeholder="Search title, slug, or author"
              type="search"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
              Status
            </label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={statusFilter}
              id="status"
              name="status"
            >
              <option value="all">All</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Review</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Filter
            </button>
            {canManageBlog ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
                href="/admin/blog/new"
              >
                + New Post
              </Link>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Author</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Published</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {posts.map((post) => (
              <tr className="text-sm text-slate-700" key={post.id}>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{post.title}</p>
                    <p className="text-xs text-slate-500">/{post.slug}</p>
                    {post.tags.length > 0 ? (
                      <p className="text-xs text-slate-500">{post.tags.slice(0, 4).map((tag) => `#${tag}`).join(" ")}</p>
                    ) : null}
                    {post.internal_tags.length > 0 ? (
                      <p className="text-xs text-sky-700">{post.internal_tags.slice(0, 3).map((tag) => `@${tag}`).join(" ")}</p>
                    ) : null}
                    {post.channel_targets.length > 0 ? (
                      <p className="text-xs text-slate-500">Channels: {post.channel_targets.join(", ")}</p>
                    ) : (
                      <p className="text-xs text-amber-700">Channels: none selected</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={post.status === "PUBLISHED" ? "success" : post.status === "REVIEW" ? "info" : "warning"}>
                    {STATUS_LABELS[post.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">{post.author}</td>
                <td className="px-4 py-3">{formatDate(post.published_at)}</td>
                <td className="px-4 py-3 text-right">
                  {canManageBlog ? (
                    <Link
                      className="font-semibold text-brand-700 hover:text-brand-800"
                      href={`/admin/blog/${post.id}`}
                    >
                      Edit
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">Read-only</span>
                  )}
                </td>
              </tr>
            ))}

            {posts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                  No blog posts found. Create your first post to start publishing.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
