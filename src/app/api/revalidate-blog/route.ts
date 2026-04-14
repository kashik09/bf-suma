import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY: One-time cache invalidation for blog.
 * DELETE THIS FILE after using it once.
 *
 * Usage: GET /api/revalidate-blog
 */
export async function GET() {
  // Invalidate the unstable_cache data
  revalidateTag("blog");

  // Invalidate the ISR page cache
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
    message: "Blog data + page caches invalidated. Delete this route after verifying."
  });
}
