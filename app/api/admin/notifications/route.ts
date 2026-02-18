import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  canAccessAdmin,
  resolveAdminRole,
} from "@/lib/admin-auth";
import {
  countUnreadAdminNotifications,
  listAdminNotifications,
  markAllAdminNotificationsAsRead,
} from "@/lib/shop-store";

function asLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 14;
  return Math.min(50, Math.max(1, Math.floor(parsed)));
}

async function ensureAdminAuth() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  if (!isLoggedIn) return false;
  const role = resolveAdminRole(cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  return canAccessAdmin(role);
}

export async function GET(request: NextRequest) {
  const authorized = await ensureAdminAuth();
  if (!authorized) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const limit = asLimit(request.nextUrl.searchParams.get("limit"));
  return NextResponse.json({
    ok: true,
    unreadCount: countUnreadAdminNotifications(),
    notifications: listAdminNotifications(limit),
  });
}

export async function POST() {
  const authorized = await ensureAdminAuth();
  if (!authorized) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const updated = markAllAdminNotificationsAsRead();
  return NextResponse.json({
    ok: true,
    updated,
    unreadCount: countUnreadAdminNotifications(),
    notifications: listAdminNotifications(14),
  });
}
