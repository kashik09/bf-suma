import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { getAdminReviews, updateReviewStatus } from "@/services/product-reviews";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

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

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; updated?: string }>;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const query = searchParams ? await searchParams : {};
  const statusFilter = (query.status as ReviewStatus) || undefined;
  const reviews = await getAdminReviews(statusFilter);

  async function approveAction(formData: FormData) {
    "use server";
    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
    const reviewId = formData.get("reviewId") as string;
    await updateReviewStatus(reviewId, "APPROVED");
    revalidatePath("/admin/reviews");
    redirect("/admin/reviews?updated=1");
  }

  async function rejectAction(formData: FormData) {
    "use server";
    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);
    const reviewId = formData.get("reviewId") as string;
    const notes = formData.get("notes") as string;
    await updateReviewStatus(reviewId, "REJECTED", notes);
    revalidatePath("/admin/reviews");
    redirect("/admin/reviews?updated=1");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Product Reviews"
        description="Moderate customer reviews before they appear on product pages."
      />

      {query.updated === "1" && (
        <Card className="border-brand-200 bg-brand-50">
          <p className="text-sm text-brand-800">Review updated successfully.</p>
        </Card>
      )}

      <Card>
        <form className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              name="status"
              defaultValue={statusFilter || ""}
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
        {reviews.length === 0 ? (
          <Card>
            <p className="text-center text-slate-600">No reviews found.</p>
          </Card>
        ) : (
          reviews.map((review) => (
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
    </div>
  );
}
