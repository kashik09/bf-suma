import { NextResponse } from "next/server";
import { buildCatalogResponseHeaders } from "@/lib/catalog-health";
import { getStorefrontCatalogSnapshot } from "@/services/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const snapshot = await getStorefrontCatalogSnapshot({
    search: searchParams.get("search") || undefined,
    categorySlug: category && category !== "all" ? category : undefined,
    availability: (searchParams.get("availability") as "all" | "in_stock" | "out_of_stock" | null) || "all",
    sort: (searchParams.get("sort") as "featured" | "price_asc" | "price_desc" | "name_asc" | null) || "featured"
  });

  return NextResponse.json(snapshot.products, {
    headers: buildCatalogResponseHeaders(snapshot.health)
  });
}
