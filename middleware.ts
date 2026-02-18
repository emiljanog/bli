import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  resolveAdminRole,
} from "./lib/admin-auth";

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function normalizeForwardedHost(value: string | null): string | null {
  const first = firstHeaderValue(value);
  if (!first) return null;
  const withoutProtocol = first.replace(/^https?:\/\//i, "");
  const host = withoutProtocol.split("/")[0]?.trim();
  return host || null;
}

function toDashboardPath(pathname: string): string {
  return pathname === "/admin" ? "/dashboard" : pathname.replace(/^\/admin/, "/dashboard");
}

function toPublicMyAccountPath(pathname: string): string {
  return pathname.replace(/^\/web\/my-account/, "/my-account");
}

function withNoStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sanitizedHeaders = new Headers(request.headers);

  const normalizedOrigin = firstHeaderValue(request.headers.get("origin"));
  if (normalizedOrigin) {
    sanitizedHeaders.set("origin", normalizedOrigin);
  }

  const normalizedForwardedHost = normalizeForwardedHost(request.headers.get("x-forwarded-host"));
  if (normalizedForwardedHost) {
    sanitizedHeaders.set("x-forwarded-host", normalizedForwardedHost);
  }

  const normalizedForwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  if (normalizedForwardedProto) {
    sanitizedHeaders.set("x-forwarded-proto", normalizedForwardedProto);
  }

  if (pathname === "/user/login" || pathname === "/admin/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return withNoStore(NextResponse.redirect(loginUrl));
  }

  if (pathname === "/web/my-account" || pathname.startsWith("/web/my-account/")) {
    const myAccountUrl = request.nextUrl.clone();
    myAccountUrl.pathname = toPublicMyAccountPath(pathname);
    return withNoStore(NextResponse.redirect(myAccountUrl));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = toDashboardPath(pathname);
    return withNoStore(NextResponse.redirect(dashboardUrl));
  }

  const isLoggedIn =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const currentRole = resolveAdminRole(request.cookies.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  const isCustomer = currentRole === "Customer";
  const isManager = currentRole === "Manager";

  const managerAllowedPrefixes = [
    "/dashboard",
    "/dashboard/products",
    "/dashboard/orders",
    "/dashboard/categories",
    "/dashboard/tags",
    "/dashboard/sales",
    "/dashboard/customers",
    "/dashboard/coupons",
    "/dashboard/reviews",
  ];

  const isManagerAllowedPath = managerAllowedPrefixes.some((prefix) =>
    prefix === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(prefix),
  );

  if (pathname === "/login" && isLoggedIn) {
    return withNoStore(
      NextResponse.redirect(new URL(isCustomer ? "/my-account" : "/dashboard", request.url)),
    );
  }

  if (pathname === "/register" && isLoggedIn) {
    return withNoStore(
      NextResponse.redirect(new URL(isCustomer ? "/my-account" : "/dashboard", request.url)),
    );
  }

  if (pathname === "/my-account" || pathname.startsWith("/my-account/")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return withNoStore(NextResponse.redirect(loginUrl));
    }
  }

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withNoStore(NextResponse.redirect(loginUrl));
  }

  if (pathname.startsWith("/dashboard") && isLoggedIn && isCustomer) {
    return withNoStore(NextResponse.redirect(new URL("/my-account", request.url)));
  }

  if (
    pathname.startsWith("/dashboard") &&
    isLoggedIn &&
    isManager &&
    !isManagerAllowedPath
  ) {
    return withNoStore(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return withNoStore(
    NextResponse.next({
      request: {
        headers: sanitizedHeaders,
      },
    }),
  );
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/my-account/:path*",
    "/web/my-account/:path*",
    "/login",
    "/register",
    "/user/login",
  ],
};
