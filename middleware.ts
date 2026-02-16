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

function toPublicMyAccountPath(pathname: string): string {
  return pathname.replace(/^\/web\/my-account/, "/my-account");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/user/login" || pathname === "/admin/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/web/my-account" || pathname.startsWith("/web/my-account/")) {
    const myAccountUrl = request.nextUrl.clone();
    myAccountUrl.pathname = toPublicMyAccountPath(pathname);
    return NextResponse.redirect(myAccountUrl);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = toDashboardPath(pathname);
    return NextResponse.redirect(dashboardUrl);
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
