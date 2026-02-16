import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  resolveAdminRole,
} from "./lib/admin-auth";

function toAdminPath(pathname: string): string {
  return pathname.replace(/^\/dashboard/, "/admin") || "/admin";
}

function toInternalMyAccountPath(pathname: string): string {
  return pathname.replace(/^\/my-account/, "/web/my-account");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/user/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const internalPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      ? toAdminPath(pathname)
      : pathname === "/my-account" || pathname.startsWith("/my-account/")
        ? toInternalMyAccountPath(pathname)
        : pathname === "/login"
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
    const loginUrl = new URL("/login", request.url);
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

  if (internalPath !== pathname) {
    const rewriteTarget = request.nextUrl.clone();
    rewriteTarget.pathname = internalPath;
    return NextResponse.rewrite(rewriteTarget);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/my-account/:path*",
    "/web/my-account/:path*",
    "/login",
    "/user/login",
  ],
};
