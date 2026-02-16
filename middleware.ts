import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  resolveAdminRole,
} from "./lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const currentRole = resolveAdminRole(request.cookies.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  const isCustomer = currentRole === "Customer";
  const isManager = currentRole === "Manager";

  if (pathname === "/user/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = pathname.replace(/^\/dashboard/, "/admin") || "/admin";
    return NextResponse.redirect(adminUrl);
  }

  if (pathname === "/my-account" || pathname.startsWith("/my-account/")) {
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = pathname.replace(/^\/my-account/, "/web/my-account");
    return NextResponse.redirect(accountUrl);
  }

  const managerAllowedPrefixes = [
    "/admin",
    "/admin/products",
    "/admin/orders",
    "/admin/categories",
    "/admin/tags",
    "/admin/sales",
    "/admin/customers",
    "/admin/coupons",
    "/admin/reviews",
  ];

  const isManagerAllowedPath = managerAllowedPrefixes.some((prefix) =>
    prefix === "/admin" ? pathname === "/admin" : pathname.startsWith(prefix),
  );

  if (pathname === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL(isCustomer ? "/web/my-account" : "/admin", request.url));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && isLoggedIn && isCustomer) {
    return NextResponse.redirect(new URL("/web/my-account", request.url));
  }

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    isLoggedIn &&
    isManager &&
    !isManagerAllowedPath
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/my-account/:path*", "/web/my-account/:path*", "/user/login"],
};
