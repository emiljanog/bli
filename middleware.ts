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

function firstHeaderValue(value: string | null): string {
  if (!value) return "";
  return value.split(",")[0].trim();
}

function isLocalHost(value: string): boolean {
  const host = value.toLowerCase();
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

function buildRewriteUrl(request: NextRequest, targetPath: string): URL {
  const rewriteUrl = new URL(request.url);
  rewriteUrl.pathname = targetPath;
  rewriteUrl.search = request.nextUrl.search;

  const host = firstHeaderValue(request.headers.get("host"));
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));

  if (forwardedHost && !isLocalHost(forwardedHost)) {
    rewriteUrl.host = forwardedHost;
    if (forwardedProto === "http" || forwardedProto === "https") {
      rewriteUrl.protocol = `${forwardedProto}:`;
    }
    return rewriteUrl;
  }

  if (isLocalHost(host) || isLocalHost(rewriteUrl.host)) {
    rewriteUrl.protocol = "http:";
  }

  return rewriteUrl;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/user/login" || pathname === "/admin/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const internalPath =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      ? toAdminPath(pathname)
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

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL(isCustomer ? "/my-account" : "/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashboard") && isLoggedIn && isCustomer) {
    return NextResponse.redirect(new URL("/my-account", request.url));
  }

  if (
    pathname.startsWith("/dashboard") &&
    isLoggedIn &&
    isManager &&
    !isManagerAllowedPath
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (internalPath !== pathname) {
    return NextResponse.rewrite(buildRewriteUrl(request, internalPath));
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
