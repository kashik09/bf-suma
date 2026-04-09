import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export interface ProductReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface CreateReviewInput {
  product_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title?: string;
  comment: string;
}

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminReview extends ProductReview {
  reviewer_email: string;
  status: ReviewStatus;
  admin_notes: string | null;
  product_name?: string;
}

export interface AdminReviewListFilters {
  status?: ReviewStatus;
  page?: number;
  pageSize?: number;
}

export interface AdminReviewListResult {
  reviews: AdminReview[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

function clampPage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value as number));
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(1, Math.min(100, Math.floor(value as number)));
}

export async function getApprovedReviewsForProduct(productId: string): Promise<ProductReview[]> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, reviewer_name, rating, title, comment, is_verified_purchase, created_at")
    .eq("product_id", productId)
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }

  return data ?? [];
}

export async function getProductAverageRating(productId: string): Promise<{ average: number; count: number }> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "APPROVED");

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / data.length) * 10) / 10,
    count: data.length
  };
}

export async function submitProductReview(input: CreateReviewInput): Promise<{ success: boolean; message: string }> {
  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: input.product_id,
      reviewer_name: input.reviewer_name.trim(),
      reviewer_email: input.reviewer_email.trim().toLowerCase(),
      rating: input.rating,
      title: input.title?.trim() || null,
      comment: input.comment.trim(),
      status: "PENDING"
    });

  if (error) {
    console.error("Failed to submit review:", error);
    return { success: false, message: "Could not submit review. Please try again." };
  }

  return { success: true, message: "Thank you! Your review has been submitted and will be published after moderation." };
}

// Admin functions
export async function getAdminReviews(filters: AdminReviewListFilters = {}): Promise<AdminReviewListResult> {
  const supabase = createServiceRoleSupabaseClient();
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  let query = supabase
    .from("product_reviews")
    .select(`
      id, product_id, reviewer_name, reviewer_email, rating, title, comment,
      is_verified_purchase, status, admin_notes, created_at
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch admin reviews:", error);
    return {
      reviews: [],
      totalCount: 0,
      page,
      pageSize,
      error: "We couldn't load reviews right now. Please try again."
    };
  }

  // Fetch product names
  const productIds = [...new Set((data ?? []).map(r => r.product_id))];
  const productNameById = new Map<string, string>();

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    for (const p of products ?? []) {
      productNameById.set(p.id, p.name);
    }
  }

  return {
    reviews: (data ?? []).map(r => ({
      ...r,
      status: r.status as ReviewStatus,
      product_name: productNameById.get(r.product_id)
    })),
    totalCount: count ?? 0,
    page,
    pageSize,
    error: null
  };
}

export async function updateReviewStatus(
  reviewId: string,
  status: "APPROVED" | "REJECTED",
  adminNotes?: string
): Promise<{ success: boolean }> {
  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("product_reviews")
    .update({
      status,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", reviewId);

  if (error) {
    console.error("Failed to update review status:", error);
    return { success: false };
  }

  return { success: true };
}

export async function getPendingReviewCount(): Promise<number> {
  const supabase = createServiceRoleSupabaseClient();

  const { count, error } = await supabase
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING");

  if (error) return 0;
  return count ?? 0;
}
