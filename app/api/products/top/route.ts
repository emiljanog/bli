import { NextResponse } from "next/server";
import { getEffectiveProductPricing, listProducts } from "@/lib/shop-store";

type TopProductRow = {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  price: number;
};

function asLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(1, Math.min(12, Math.floor(parsed)));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = asLimit(searchParams.get("limit"));

    const products = listProducts()
      .slice(0, limit)
      .map((product) => {
        const pricing = getEffectiveProductPricing(product);
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          category: product.category,
          price: pricing.current,
        } satisfies TopProductRow;
      });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to load top products." }, { status: 500 });
  }
}

