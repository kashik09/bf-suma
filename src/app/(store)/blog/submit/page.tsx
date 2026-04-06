import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PageContainer } from "@/components/layout/page-container";
import { StoreBreadcrumbs } from "@/components/storefront/store-breadcrumbs";
import { Card, SectionHeader } from "@/components/ui";
import { submitBlogPost } from "@/services/blog-submissions";

export const metadata: Metadata = {
  title: "Submit an Article | BF Suma Blog",
  description: "Share your wellness knowledge with the BF Suma community."
};

const submitSchema = z.object({
  title: z.string().trim().min(10).max(200),
  content: z.string().trim().min(200).max(20000),
  excerpt: z.string().trim().max(500).optional(),
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  notes: z.string().trim().max(500).optional(),
  tags: z.string().optional()
});

export default async function BlogSubmitPage({
  searchParams
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const query = searchParams ? await searchParams : {};

  async function submitAction(formData: FormData) {
    "use server";

    const parsed = submitSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      excerpt: formData.get("excerpt"),
      name: formData.get("name"),
      email: formData.get("email"),
      notes: formData.get("notes"),
      tags: formData.get("tags")
    });

    if (!parsed.success) {
      redirect("/blog/submit?error=Please+fill+in+all+required+fields+correctly.");
    }

    const tags = parsed.data.tags
      ? parsed.data.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const result = await submitBlogPost({
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      submitted_by_name: parsed.data.name,
      submitted_by_email: parsed.data.email,
      submission_notes: parsed.data.notes,
      tags
    });

    if (result.success) {
      revalidatePath("/admin/blog");
      redirect("/blog/submit?success=1");
    } else {
      redirect(`/blog/submit?error=${encodeURIComponent(result.message)}`);
    }
  }

  return (
    <PageContainer className="space-y-6 py-10 sm:py-12">
      <StoreBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Submit Article" }
        ]}
      />

      <SectionHeader
        title="Submit an Article"
        description="Share your wellness knowledge, product experience, or health tips with our community. All submissions are reviewed before publishing."
      />

      {query.success === "1" && (
        <Card className="border-brand-200 bg-brand-50">
          <p className="font-medium text-brand-800">Your article has been submitted!</p>
          <p className="mt-1 text-sm text-brand-700">
            We'll review it and notify you when it's published. Thank you for contributing!
          </p>
        </Card>
      )}

      {query.error && (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-800">{query.error}</p>
        </Card>
      )}

      <Card>
        <form action={submitAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="name">
                Your Name *
              </label>
              <input
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                id="name"
                name="name"
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
                Your Email *
              </label>
              <input
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
              <p className="mt-1 text-xs text-slate-500">Not published. Used to notify you about your submission.</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="title">
              Article Title *
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="title"
              name="title"
              required
              minLength={10}
              maxLength={200}
              placeholder="e.g., My Experience with Reishi Coffee"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="excerpt">
              Short Summary (optional)
            </label>
            <textarea
              className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="excerpt"
              name="excerpt"
              maxLength={500}
              placeholder="A brief summary of your article (1-2 sentences)"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="content">
              Article Content *
            </label>
            <textarea
              className="min-h-64 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="content"
              name="content"
              required
              minLength={200}
              maxLength={20000}
              placeholder="Write your article here. You can use markdown formatting for headings, lists, and emphasis..."
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 200 characters. Markdown formatting is supported.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="tags">
              Tags (optional)
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="tags"
              name="tags"
              placeholder="wellness, coffee, immunity (comma-separated)"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="notes">
              Notes for Reviewers (optional)
            </label>
            <textarea
              className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="notes"
              name="notes"
              maxLength={500}
              placeholder="Any additional context or notes for our editorial team..."
            />
          </div>

          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700"
            type="submit"
          >
            Submit for Review
          </button>
        </form>
      </Card>
    </PageContainer>
  );
}
