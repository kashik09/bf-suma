import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export interface SubmitBlogPostInput {
  title: string;
  content: string;
  excerpt?: string;
  submitted_by_name: string;
  submitted_by_email: string;
  submission_notes?: string;
  tags?: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function submitBlogPost(input: SubmitBlogPostInput): Promise<{ success: boolean; message: string }> {
  const supabase = createServiceRoleSupabaseClient();

  const baseSlug = slugify(input.title);
  const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

  const { error } = await supabase
    .from("blog_posts")
    .insert({
      title: input.title.trim(),
      slug: uniqueSlug,
      content: input.content.trim(),
      excerpt: input.excerpt?.trim() || input.content.slice(0, 200).trim(),
      status: "DRAFT",
      author: input.submitted_by_name.trim(),
      tags: input.tags || [],
      submitted_by_name: input.submitted_by_name.trim(),
      submitted_by_email: input.submitted_by_email.trim().toLowerCase(),
      submission_notes: input.submission_notes?.trim() || null
    });

  if (error) {
    console.error("Blog submission error:", error);
    return { success: false, message: "Could not submit your article. Please try again." };
  }

  return {
    success: true,
    message: "Thank you! Your article has been submitted for review. We'll notify you when it's published."
  };
}

export async function getPendingBlogSubmissions() {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, author, submitted_by_email, submission_notes, created_at")
    .eq("status", "DRAFT")
    .not("submitted_by_email", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch pending submissions:", error);
    return [];
  }

  return data ?? [];
}

export async function approveSubmission(id: string, reviewerName: string): Promise<{ success: boolean }> {
  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: "REVIEW",
      published_at: null,
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to approve submission:", error);
    return { success: false };
  }

  return { success: true };
}

export async function rejectSubmission(id: string, reviewerName: string): Promise<{ success: boolean }> {
  const supabase = createServiceRoleSupabaseClient();

  // We don't delete - just keep as draft with a flag
  const { error } = await supabase
    .from("blog_posts")
    .update({
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString(),
      submission_notes: "REJECTED"
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to reject submission:", error);
    return { success: false };
  }

  return { success: true };
}
