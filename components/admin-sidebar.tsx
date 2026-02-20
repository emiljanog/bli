"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import type { AdminRole } from "@/lib/admin-auth";
import { ADMIN_SIDEBAR_COOKIE_NAME } from "@/lib/admin-auth";

type AdminSidebarProps = {
  defaultCollapsed?: boolean;
  role: AdminRole;
  logoUrl: string;
  iconUrl: string;
  siteTitle: string;
  brandingVersion?: number;
};

function withAssetVersion(url: string, version: number): string {
  const safeUrl = url.trim();
  if (!safeUrl) return "";
  const sep = safeUrl.includes("?") ? "&" : "?";
  return `${safeUrl}${sep}v=${Math.max(1, Math.floor(version || 1))}`;
}

export function AdminSidebar({
  defaultCollapsed = false,
  role,
  logoUrl,
  siteTitle,
  brandingVersion = 1,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);

  const effectiveCollapsed = isDesktop ? collapsed : false;
  const shouldShowNav = isDesktop || mobileMenuOpen;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const desktop = "matches" in event ? event.matches : mediaQuery.matches;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileMenuOpen(false);
      }
    };

    handleViewportChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportChange);
      return () => mediaQuery.removeEventListener("change", handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (effectiveCollapsed) {
      timer = setTimeout(() => setLogoVisible(false), 0);
    } else {
      timer = setTimeout(() => setLogoVisible(true), 170);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [effectiveCollapsed]);

  function handleToggleSidebar() {
    setCollapsed((previous) => {
      const next = !previous;
      window.localStorage.setItem(ADMIN_SIDEBAR_COOKIE_NAME, next ? "1" : "0");
      document.cookie = `${ADMIN_SIDEBAR_COOKIE_NAME}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }

  const logoSrc = withAssetVersion(logoUrl, brandingVersion);
  const hasLogo = logoUrl.trim().length > 0;
  const titleFallback = siteTitle.trim() || "Site";

  return (
    <aside
      className={`overflow-x-visible overflow-y-hidden border-b border-slate-200 bg-[#f1f1f1] px-3 py-6 transition-[width] duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:overflow-visible lg:border-b-0 lg:border-r ${
        effectiveCollapsed ? "lg:w-[92px]" : "lg:w-[260px]"
      }`}
    >
      <div
        className={
          effectiveCollapsed ? "mb-3 flex justify-center lg:mb-3" : "mb-3 rounded-xl bg-white p-3 shadow-sm lg:mb-7"
        }
      >
        <div className="flex items-center justify-between gap-2">
          {!effectiveCollapsed ? (
            <Link
              href="/dashboard"
              aria-label="Open dashboard"
              className={`flex items-center transition-opacity duration-300 ${logoVisible ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex items-center gap-2">
                {hasLogo ? (
                  <img src={logoSrc} alt={`${siteTitle} logo`} className="h-[38px] w-auto max-w-[110px] object-contain" />
                ) : (
                  <span className="max-w-[140px] truncate text-sm font-bold text-slate-800">{titleFallback}</span>
                )}
              </div>
            </Link>
          ) : null}

          <div className={`flex items-center ${effectiveCollapsed ? "justify-center" : "gap-1"}`}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-nav"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                {mobileMenuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>

            <button
              type="button"
              onClick={handleToggleSidebar}
              aria-label={effectiveCollapsed ? "Open menu" : "Collapse menu"}
              className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 lg:inline-flex"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-5 w-5 transition-transform duration-300 ${effectiveCollapsed ? "rotate-180" : ""}`}
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        id="admin-mobile-nav"
        className={`${shouldShowNav ? "block" : "hidden"} lg:block ${
          effectiveCollapsed ? "overflow-visible" : "max-h-[calc(100vh-130px)] overflow-y-auto overflow-x-hidden pr-1"
        }`}
      >
        <AdminNav collapsed={effectiveCollapsed} role={role} />
      </div>
    </aside>
  );
}
