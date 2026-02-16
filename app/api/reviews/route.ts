import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { addReview, getProductById } from "@/lib/shop-store";

type ReviewBody = {
  productId?: string;
  author?: string;
  rating?: number;
  comment?: string;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRating(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(1, Math.min(5, Math.round(parsed)));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReviewBody;
    const productId = asString(body.productId);
    const author = asString(body.author);
    const rating = asRating(body.rating);
    const comment = asString(body.comment);

    if (!productId || !author || !comment || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Te dhenat e review nuk jane te plota." },
        { status: 400 },
      );
    }

    const review = addReview({
      productId,
      author,
      rating,
      comment,
      status: "Approved",
    });

    if (!review) {
      return NextResponse.json({ error: "Produkti nuk u gjet." }, { status: 404 });
    }

    const product = getProductById(productId, { includeTrashed: true });
    if (product) {
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/shop/${product.slug}`);
    }
    revalidatePath("/admin/reviews");
    revalidatePath("/dashboard/reviews");

    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json({ error: "Nuk u ruajt review." }, { status: 500 });
  }
}
