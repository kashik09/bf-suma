import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * TEMPORARY: One-time cache invalidation for blog.
 * DELETE THIS FILE after using it once.
 *
 * Usage: GET /api/revalidate-blog
 */
export async function GET() {
  revalidateTag("blog");

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
    message: "Blog cache invalidated. Delete this route now."
  });
}
