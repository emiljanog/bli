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

  if (pathname === "/web/my-account" || pathname.startsWith("/web/my-account/")) {
    return NextResponse.redirect(new URL(pathname.replace(/^\/web/, ""), request.url));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  const internalPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      ? pathname.replace(/^\/dashboard/, "/admin") || "/admin"
      : pathname === "/my-account" || pathname.startsWith("/my-account/")
        ? pathname.replace(/^\/my-account/, "/web/my-account")
        : pathname === "/user/login"
          ? "/admin/login"
          : pathname;
  const isLoggedIn =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const currentRole = resolveAdminRole(request.cookies.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  const isCustomer = currentRole === "Customer";
  const isManager = currentRole === "Manager";
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
    prefix === "/admin" ? internalPath === "/admin" : internalPath.startsWith(prefix),
  );

  if (internalPath === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL(isCustomer ? "/my-account" : "/dashboard", request.url));
  }

  if (internalPath.startsWith("/admin") && internalPath !== "/admin/login" && !isLoggedIn) {
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (internalPath.startsWith("/admin") && internalPath !== "/admin/login" && isLoggedIn && isCustomer) {
    return NextResponse.redirect(new URL("/my-account", request.url));
  }

  if (
    internalPath.startsWith("/admin") &&
    internalPath !== "/admin/login" &&
    isLoggedIn &&
    isManager &&
    !isManagerAllowedPath
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname === "/my-account" || pathname.startsWith("/my-account/")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname === "/user/login") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/admin/login";
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/my-account/:path*", "/web/my-account/:path*", "/user/login"],
};
