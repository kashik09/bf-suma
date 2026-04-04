import { Star } from "lucide-react";
import type { ProductReview } from "@/services/product-reviews";

interface ProductReviewsListProps {
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
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

export function ProductReviewsList({ reviews, averageRating, reviewCount }: ProductReviewsListProps) {
  if (reviewCount === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-900">{averageRating}</p>
          <StarRating rating={Math.round(averageRating)} />
          <p className="mt-1 text-sm text-slate-500">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  {review.is_verified_purchase && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="mt-1 font-medium text-slate-900">{review.title}</p>
                )}
              </div>
              <p className="text-xs text-slate-500">{formatDate(review.created_at)}</p>
            </div>

            <p className="mt-2 text-sm text-slate-600">{review.comment}</p>

            <p className="mt-3 text-xs font-medium text-slate-500">— {review.reviewer_name}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
