import { NextResponse } from "next/server";
import { getEffectiveProductPricing, listProducts } from "@/lib/shop-store";

type SearchResultRow = {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  price: number;
  salePrice: number | null;
};

function asQuery(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function asLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 6;
  return Math.max(1, Math.min(12, Math.floor(parsed)));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = asQuery(searchParams.get("q"));
    const limit = asLimit(searchParams.get("limit"));

    if (!query) {
      return NextResponse.json({ results: [] as SearchResultRow[] });
    }

    const products = listProducts();
    const results = products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      })
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
          salePrice: pricing.salePrice,
        };
      });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
