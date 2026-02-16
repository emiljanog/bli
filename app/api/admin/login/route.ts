import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME_COOKIE_NAME,
  getAdminRole,
  getAdminUsername,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import { authenticateUser } from "@/lib/shop-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const secure = process.env.NODE_ENV === "production";

  if (!username || !password) {
    return NextResponse.json({ ok: false, message: "Username or password is invalid." }, { status: 401 });
  }

  if (validateAdminCredentials(username, password)) {
    const adminRole = getAdminRole();
    const adminUsername = getAdminUsername();
    const redirectTo = adminRole === "Customer" ? "/my-account" : "/dashboard";

    const response = NextResponse.json({ ok: true, redirectTo });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: ADMIN_SESSION_VALUE,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set({
      name: ADMIN_ROLE_COOKIE_NAME,
      value: adminRole,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set({
      name: ADMIN_USERNAME_COOKIE_NAME,
      value: adminUsername,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  }

  const matchedUser = authenticateUser(username, password);
  if (!matchedUser) {
    return NextResponse.json({ ok: false, message: "Username or password is invalid." }, { status: 401 });
  }

  const redirectTo = matchedUser.role === "Customer" ? "/my-account" : "/dashboard";
  const response = NextResponse.json({ ok: true, redirectTo });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: ADMIN_SESSION_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  response.cookies.set({
    name: ADMIN_ROLE_COOKIE_NAME,
    value: matchedUser.role,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  response.cookies.set({
    name: ADMIN_USERNAME_COOKIE_NAME,
    value: matchedUser.username,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
