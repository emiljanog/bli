import { NextResponse } from "next/server";
import { applyCoupon } from "@/lib/shop-store";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const code = asString(body.code).toUpperCase();
    const subtotal = asNumber(body.subtotal);

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const result = applyCoupon(code, subtotal);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      coupon: result.coupon
        ? {
            code: result.coupon.code,
            description: result.coupon.description,
            type: result.coupon.type,
            value: result.coupon.value,
            minSubtotal: result.coupon.minSubtotal,
          }
        : null,
      discount: result.discount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to apply coupon." }, { status: 500 });
  }
}

