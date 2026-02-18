import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/shop-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : "";

  if (!identifier) {
    return NextResponse.json(
      { ok: false, message: "Username or email is required." },
      { status: 400 },
    );
  }

  const result = requestPasswordReset(identifier);

  // Always return success-style response to avoid exposing valid accounts.
  if (!result.sent || !result.token) {
    return NextResponse.json({
      ok: true,
      message: "If account exists, reset token has been sent to your email.",
    });
  }

  const payload: {
    ok: true;
    message: string;
    previewToken?: string;
  } = {
    ok: true,
    message: "Reset token has been sent to your email.",
  };

  // Local/dev convenience until SMTP sender is fully wired.
  if (process.env.NODE_ENV !== "production") {
    payload.previewToken = result.token.token;
  }

  return NextResponse.json(payload);
}
