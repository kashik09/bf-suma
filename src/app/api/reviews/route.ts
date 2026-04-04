import { NextResponse } from "next/server";
import { z } from "zod";
import { submitProductReview } from "@/services/product-reviews";

const submitReviewSchema = z.object({
  product_id: z.string().uuid(),
  reviewer_name: z.string().trim().min(2).max(100),
  reviewer_email: z.string().email(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  comment: z.string().trim().min(10).max(2000)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid review data. Please check your inputs." },
        { status: 400 }
      );
    }

    const result = await submitProductReview(parsed.data);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
