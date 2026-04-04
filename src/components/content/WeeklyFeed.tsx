import Link from "next/link";
import { listPublishedBlogPosts } from "@/services/blog";

export async function WeeklyFeed() {
  const posts = await listPublishedBlogPosts();
  const recentPosts = posts.slice(0, 4);

  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Latest Articles</p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">Fresh wellness insights from our blog</h2>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible lg:grid-cols-4">
        {recentPosts.map((post) => (
          <Link
            className="min-w-[250px] snap-start rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:border-brand-200 hover:shadow-card md:min-w-0"
            href={`/blog/${post.slug}`}
            key={post.id}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {post.tags[0] || "Wellness"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-800">{post.title}</p>
          </Link>
        ))}
      </div>

      <div className="pt-2">
        <Link
          className="inline-flex text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          href="/blog"
        >
          View all articles →
        </Link>
      </div>
    </section>
  );
}
