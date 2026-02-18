import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME_COOKIE_NAME,
} from "@/lib/admin-auth";
import { addAdminNotification, addUser } from "@/lib/shop-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const surname = typeof body?.surname === "string" ? body.surname.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { ok: false, message: "Please fill valid name, email and password." },
      { status: 400 },
    );
  }

  const createdUser = addUser({
    name,
    surname,
    email,
    password,
    role: "Customer",
    source: "Checkout",
  });

  if (!createdUser) {
    return NextResponse.json(
      { ok: false, message: "Registration failed. Email may already exist." },
      { status: 400 },
    );
  }

  addAdminNotification({
    type: "User",
    title: "New user register",
    message: `${createdUser.name} ${createdUser.surname}`.trim() || createdUser.username,
    href: `/dashboard/users/${createdUser.id}`,
  });

  const secure = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true, redirectTo: "/my-account" });
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
    value: "Customer",
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  response.cookies.set({
    name: ADMIN_USERNAME_COOKIE_NAME,
    value: createdUser.username,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
