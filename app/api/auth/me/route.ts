import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME_COOKIE_NAME,
  resolveAdminRole,
} from "@/lib/admin-auth";
import { findUserByUsername } from "@/lib/shop-store";

export async function GET() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  if (!isLoggedIn) {
    return NextResponse.json({ authenticated: false });
  }

  const username = cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value?.trim() ?? "";
  const role = resolveAdminRole(cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  const user = findUserByUsername(username);
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    role,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
    },
  });
}
