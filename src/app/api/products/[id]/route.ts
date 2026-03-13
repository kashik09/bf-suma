import { NextResponse } from "next/server";
import { listStorefrontProducts } from "@/services/products";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await listStorefrontProducts();
  const product = products.find((entry) => entry.id === id);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
