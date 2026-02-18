import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/shop-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!identifier || !token || newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, message: "Username/email, token and valid password are required." },
      { status: 400 },
    );
  }

  const ok = resetPasswordWithToken({ identifier, token, newPassword });
  if (!ok) {
    return NextResponse.json(
      { ok: false, message: "Invalid or expired token. Please request a new token." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
