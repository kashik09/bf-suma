import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ message: `Order ${params.id} endpoint scaffold` });
}
