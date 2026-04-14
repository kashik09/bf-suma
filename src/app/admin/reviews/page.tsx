import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { getAdminReviews, updateReviewStatus } from "@/services/product-reviews";

export const dynamic = "force-dynamic";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
type ReviewStatusFilter = ReviewStatus | "all";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

function isReviewStatus(value: string): value is ReviewStatus {
  return value === "PENDING" || value === "APPROVED" || value === "REJECTED";
}

function getSafePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

function buildReturnUrl(page: number, statusFilter: ReviewStatusFilter, extra?: "updated" | "error"): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (statusFilter !== "all") {
    params.set("status", statusFilter);
  }
  if (extra) {
    params.set(extra, "1");
  }
  return `/admin/reviews?${params.toString()}`;
}

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; updated?: string; error?: string; page?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const query = searchParams ? await searchParams : {};
  const statusFilter: ReviewStatusFilter =
    typeof query.status === "string" && isReviewStatus(query.status) ? query.status : "all";
  const page = getSafePage(query.page);
  const reviewsResult = await getAdminReviews({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    pageSize: 20
  });
  const totalPages = Math.max(1, Math.ceil(reviewsResult.totalCount / reviewsResult.pageSize));
  const hasPrev = reviewsResult.page > 1;
  const hasNext = reviewsResult.page < totalPages;

  async function approveAction(formData: FormData) {
    "use server";
    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
    const reviewId = String(formData.get("reviewId") || "").trim();
    const returnPage = getSafePage(String(formData.get("page") || "1"));
    const returnStatusRaw = String(formData.get("statusFilter") || "all");
    const returnStatus: ReviewStatusFilter = isReviewStatus(returnStatusRaw) ? returnStatusRaw : "all";
    if (!reviewId) {
      redirect(buildReturnUrl(returnPage, returnStatus, "error"));
    }
    const result = await updateReviewStatus(reviewId, "APPROVED");
    revalidatePath("/admin/reviews");
    if (!result.success) {
      redirect(buildReturnUrl(returnPage, returnStatus, "error"));
    }
    redirect(buildReturnUrl(returnPage, returnStatus, "updated"));
  }

  async function rejectAction(formData: FormData) {
    "use server";
    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
    const reviewId = String(formData.get("reviewId") || "").trim();
    const notes = String(formData.get("notes") || "");
    const returnPage = getSafePage(String(formData.get("page") || "1"));
    const returnStatusRaw = String(formData.get("statusFilter") || "all");
    const returnStatus: ReviewStatusFilter = isReviewStatus(returnStatusRaw) ? returnStatusRaw : "all";
    if (!reviewId) {
      redirect(buildReturnUrl(returnPage, returnStatus, "error"));
    }
    const result = await updateReviewStatus(reviewId, "REJECTED", notes);
    revalidatePath("/admin/reviews");
    if (!result.success) {
      redirect(buildReturnUrl(returnPage, returnStatus, "error"));
    }
    redirect(buildReturnUrl(returnPage, returnStatus, "updated"));
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Product Reviews"
        description={`Moderate customer reviews before they appear on product pages. Showing ${reviewsResult.reviews.length} of ${reviewsResult.totalCount} review(s).`}
      />

      {query.updated === "1" && (
        <Card className="border-brand-200 bg-brand-50">
          <p className="text-sm text-brand-800">Review updated successfully.</p>
        </Card>
      )}

      {query.error === "1" && (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-800">We couldn't update this review. Please try again.</p>
        </Card>
      )}

      {reviewsResult.error ? (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-semibold text-rose-900">Reviews are temporarily unavailable</p>
          <p className="mt-1 text-sm text-rose-800">{reviewsResult.error}</p>
        </Card>
      ) : null}

      <Card>
        <form action="/admin/reviews" className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              name="status"
              defaultValue={statusFilter === "all" ? "" : statusFilter}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <button
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="submit"
          >
            Filter
          </button>
        </form>
      </Card>

      <div className="space-y-4">
        {!reviewsResult.error && reviewsResult.reviews.length === 0 ? (
          <Card>
            <p className="text-center text-slate-600">No reviews found.</p>
          </Card>
        ) : (
          reviewsResult.reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <Badge
                      variant={
                        review.status === "APPROVED"
                          ? "success"
                          : review.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>

                  {review.title && (
                    <p className="mt-2 font-semibold text-slate-900">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-600">{review.comment}</p>

                  <div className="mt-3 text-xs text-slate-500">
                    <p>
                      <strong>Product:</strong> {review.product_name || "Unknown"}
                    </p>
                    <p>
                      <strong>Reviewer:</strong> {review.reviewer_name} ({review.reviewer_email})
                    </p>
                    <p>
                      <strong>Submitted:</strong> {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>

                {review.status === "PENDING" && (
                  <div className="flex shrink-0 flex-col gap-2">
                    <form action={approveAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="page" value={String(reviewsResult.page)} />
                      <input type="hidden" name="statusFilter" value={statusFilter} />
                      <button
                        className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                        type="submit"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="notes" value="Rejected by admin" />
                      <input type="hidden" name="page" value={String(reviewsResult.page)} />
                      <input type="hidden" name="statusFilter" value={statusFilter} />
                      <button
                        className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                        type="submit"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {!reviewsResult.error ? (
        <Card className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Page {reviewsResult.page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {hasPrev ? (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                href={buildReturnUrl(reviewsResult.page - 1, statusFilter)}
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
                Previous
              </span>
            )}

            {hasNext ? (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                href={buildReturnUrl(reviewsResult.page + 1, statusFilter)}
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
                Next
              </span>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
