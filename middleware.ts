import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  resolveAdminRole,
} from "./lib/admin-auth";

function toDashboardPath(pathname: string): string {
  return pathname === "/admin" ? "/dashboard" : pathname.replace(/^\/admin/, "/dashboard");
}

function toAdminPath(pathname: string): string {
  return pathname.replace(/^\/dashboard/, "/admin") || "/admin";
}

function toPublicMyAccountPath(pathname: string): string {
  return pathname.replace(/^\/web\/my-account/, "/my-account");
}

function toInternalMyAccountPath(pathname: string): string {
  return pathname.replace(/^\/my-account/, "/web/my-account");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const search = request.nextUrl.search;

  if (pathname === "/user/login") {
    return NextResponse.redirect(new URL(`/login${search}`, request.url));
  }

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL(`/login${search}`, request.url));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL(`${toDashboardPath(pathname)}${search}`, request.url));
  }

  if (pathname === "/web/my-account" || pathname.startsWith("/web/my-account/")) {
    return NextResponse.redirect(new URL(`${toPublicMyAccountPath(pathname)}${search}`, request.url));
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
    const rewriteTarget = new URL(`http://127.0.0.1:3001${internalPath}${search}`);
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
