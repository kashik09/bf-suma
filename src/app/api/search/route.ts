import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: { name: string } | null;
}

interface ProductImageRow {
  product_id: string;
  url: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  // Early return for short queries
  if (query.length <= 1) {
    return NextResponse.json({ products: [] });
  }

  const supabase = createServiceRoleSupabaseClient();
  const pattern = `%${query}%`;

  // Search name and description with ILIKE
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      currency,
      category:categories(name)
    `)
    .eq("status", "ACTIVE")
    .or(`name.ilike.${pattern},description.ilike.${pattern}`)
    .order("name")
    .limit(8);

  if (error) {
    return NextResponse.json({ products: [], error: error.message }, { status: 500 });
  }

  const productRows = (data || []) as ProductRow[];
  const productIds = productRows.map((p) => p.id);

  // Fetch first image for each product
  const { data: imageData } = await supabase
    .from("product_images")
    .select("product_id, url")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  const imagesByProductId = new Map<string, string>();
  for (const img of (imageData || []) as ProductImageRow[]) {
    if (!imagesByProductId.has(img.product_id)) {
      imagesByProductId.set(img.product_id, img.url);
    }
  }

  // Sort: name matches first, then description matches
  const lowerQuery = query.toLowerCase();
  const sorted = productRows.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(lowerQuery);
    const bNameMatch = b.name.toLowerCase().includes(lowerQuery);
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    return a.name.localeCompare(b.name);
  });

  const products = sorted.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    currency: p.currency,
    image_url: imagesByProductId.get(p.id) || null,
    category_name: p.category?.name || "Uncategorized"
  }));

  return NextResponse.json({ products });
}
