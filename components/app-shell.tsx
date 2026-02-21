"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useMemo } from "react";
import { ReactNode } from "react";
import { ActionFeedbackToast } from "@/components/action-feedback-toast";
import { AdminBlackToolbar } from "@/components/admin-black-toolbar";
import type { AdminNotificationItem } from "@/components/admin-notifications-menu";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { SiteSettings } from "@/lib/shop-store";

type AppShellProps = {
  children: ReactNode;
  siteSettings: SiteSettings;
  adminToolbar?: {
    username: string;
    displayName: string;
    avatarUrl: string;
    profileHref: string;
    initialNotifications: AdminNotificationItem[];
    initialUnreadCount: number;
  } | null;
  accountUser?: {
    username: string;
    displayName: string;
    avatarUrl: string;
  } | null;
};

function withAssetVersion(url: string, version: number): string {
  const safeUrl = url.trim();
  if (!safeUrl) return "";
  const sep = safeUrl.includes("?") ? "&" : "?";
  return `${safeUrl}${sep}v=${Math.max(1, Math.floor(version || 1))}`;
}

function toPathSegments(pathname: string): string[] {
  return pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function getQuickEditHref(pathname: string): string | null {
  const segments = toPathSegments(pathname);
  if (segments.length === 0) return null;

  if ((segments[0] === "product" || segments[0] === "shop") && segments.length >= 2) {
    return `/dashboard/products/by-slug/${encodeURIComponent(segments[1])}`;
  }

  if (segments.length === 1) {
    const slug = segments[0].toLowerCase();
    const blockedSlugs = new Set([
      "shop",
      "product",
      "collections",
      "cart",
      "checkout",
      "contact",
      "my-account",
      "login",
      "dashboard",
      "user",
      "api",
    ]);
    if (!blockedSlugs.has(slug)) {
      return `/dashboard/pages/by-slug/${encodeURIComponent(segments[0])}`;
    }
  }

  return null;
}

export function AppShell({ children, siteSettings, adminToolbar = null, accountUser = null }: AppShellProps) {
  const pathname = usePathname();
  const quickEditHref = useMemo(() => getQuickEditHref(pathname), [pathname]);
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/user/login");
  const isCheckoutRoute = pathname.startsWith("/checkout");
  const logoSrc = withAssetVersion(siteSettings.logoUrl, siteSettings.brandingVersion);
  const hasLogo = siteSettings.logoUrl.trim().length > 0;
  const year = new Date().getUTCFullYear();

  if (isAdminRoute) {
    return (
      <>
        <Suspense fallback={null}>
          <ActionFeedbackToast />
        </Suspense>
        {children}
      </>
    );
  }

  if (isCheckoutRoute) {
    return (
      <>
        <Suspense fallback={null}>
          <ActionFeedbackToast />
        </Suspense>
        <div className="border-b border-slate-200 bg-white">
          <div className="site-container">
            <div className="grid grid-cols-2 items-center py-4">
              <div>
                <Link href="/" className="flex items-center gap-2">
                  {hasLogo ? (
                    <img
                      src={logoSrc}
                      alt={`${siteSettings.siteTitle} logo`}
                      className="h-[34px] w-auto max-w-[150px] object-contain"
                    />
                  ) : (
                    <span className="text-sm font-bold tracking-wide text-slate-900">{siteSettings.siteTitle}</span>
                  )}
                </Link>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {children}
        <footer className="bg-white lg:bg-[linear-gradient(to_right,#ffffff_50%,#f5f5f5_50%)]">
          <div className="site-container grid lg:grid-cols-2">
            <div className="py-4">
              <div className="w-full max-w-[640px] border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
                {siteSettings.siteTitle} Copyright (c) {year}
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden />
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ActionFeedbackToast />
      </Suspense>
      {adminToolbar ? (
        <AdminBlackToolbar
          username={adminToolbar.username}
          displayName={adminToolbar.displayName}
          avatarUrl={adminToolbar.avatarUrl}
          profileHref={adminToolbar.profileHref}
          quickEditHref={quickEditHref}
          sticky
          showAdminControls
          initialNotifications={adminToolbar.initialNotifications}
          initialUnreadCount={adminToolbar.initialUnreadCount}
        />
      ) : null}
      <SiteHeader
        siteSettings={siteSettings}
        accountUser={accountUser}
        topOffsetPx={adminToolbar ? 44 : 0}
      />
      {children}
      <SiteFooter />
    </>
  );
}
