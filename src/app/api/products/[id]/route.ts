import { NextResponse } from "next/server";
import { buildCatalogResponseHeaders } from "@/lib/catalog-health";
import { getStorefrontCatalogSnapshot } from "@/services/products";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getStorefrontCatalogSnapshot();
  const product = snapshot.products.find((entry) => entry.id === id);
  const headers = buildCatalogResponseHeaders(snapshot.health);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, {
      status: 404,
      headers
    });
  }

  return NextResponse.json(product, { headers });
}
