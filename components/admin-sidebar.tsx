"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AdminNav } from "@/components/admin-nav";
import type { AdminRole } from "@/lib/admin-auth";
import {
  ADMIN_SIDEBAR_COOKIE_NAME,
  ADMIN_SIDEBAR_STATE_EVENT,
  ADMIN_SIDEBAR_TOGGLE_REQUEST_EVENT,
} from "@/lib/admin-auth";

type AdminSidebarProps = {
  defaultCollapsed?: boolean;
  role: AdminRole;
  logoUrl: string;
  iconUrl: string;
  siteTitle: string;
  brandingVersion?: number;
  topOffsetPx?: number;
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
  iconUrl,
  siteTitle,
  brandingVersion = 1,
  topOffsetPx = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectiveCollapsed = (isDesktop ?? true) ? collapsed : false;

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

  const handleToggleSidebar = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      window.localStorage.setItem(ADMIN_SIDEBAR_COOKIE_NAME, next ? "1" : "0");
      document.cookie = `${ADMIN_SIDEBAR_COOKIE_NAME}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  useEffect(() => {
    if (isDesktop !== true) return;
    window.dispatchEvent(
      new CustomEvent(ADMIN_SIDEBAR_STATE_EVENT, {
        detail: { collapsed },
      }),
    );
  }, [collapsed, isDesktop]);

  useEffect(() => {
    if (isDesktop === null) return;
    const handleExternalToggle = () => {
      if (isDesktop) {
        handleToggleSidebar();
        return;
      }
      setMobileMenuOpen((previous) => !previous);
    };
    window.addEventListener(ADMIN_SIDEBAR_TOGGLE_REQUEST_EVENT, handleExternalToggle);
    return () => window.removeEventListener(ADMIN_SIDEBAR_TOGGLE_REQUEST_EVENT, handleExternalToggle);
  }, [handleToggleSidebar, isDesktop]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setMobileMenuOpen(false);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  const logoSrc = withAssetVersion(logoUrl, brandingVersion);
  const iconSrc = withAssetVersion(iconUrl, brandingVersion);
  const hasLogo = logoUrl.trim().length > 0;
  const hasIcon = iconUrl.trim().length > 0;
  const titleFallback = siteTitle.trim() || "Site";
  const sidebarTop = Math.max(0, Math.floor(topOffsetPx));
  const desktopSidebarStyle = {
    top: `${sidebarTop}px`,
    "--admin-sidebar-top": `${sidebarTop}px`,
  } as CSSProperties;

  return (
    <>
      <div
        aria-hidden
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-x-0 bottom-0 z-[245] bg-black/35 transition duration-300 lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: `${sidebarTop}px` }}
      />

      <aside
        className={`fixed left-0 z-[250] w-[285px] border-r border-slate-200 bg-[#f1f1f1] shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          top: `${sidebarTop}px`,
          height: `calc(100dvh - ${sidebarTop}px)`,
        }}
      >
        <div className="h-full overflow-y-auto px-3 py-4">
          <AdminNav collapsed={false} role={role} />
        </div>
      </aside>

      <aside
        className={`hidden overflow-x-visible overflow-y-hidden border-b border-slate-200 bg-[#f1f1f1] px-3 py-6 transition-[width] duration-300 ease-in-out lg:sticky lg:z-30 lg:h-[calc(100vh-var(--admin-sidebar-top))] lg:overflow-visible lg:border-b-0 lg:border-r ${
          effectiveCollapsed ? "lg:w-[92px]" : "lg:w-max"
        } lg:block`}
        style={desktopSidebarStyle}
      >
        <div
          className={
            effectiveCollapsed ? "mb-3 flex justify-center lg:mb-3" : "mb-3 rounded-xl bg-white p-3 shadow-sm lg:mb-7"
          }
        >
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard" aria-label="Open dashboard" className="flex items-center">
              <div className="flex items-center gap-2">
                {effectiveCollapsed ? (
                  hasIcon ? (
                    <img src={iconSrc} alt={`${siteTitle} icon`} className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                      {(titleFallback.charAt(0) || "S").toUpperCase()}
                    </span>
                  )
                ) : hasLogo ? (
                  <img src={logoSrc} alt={`${siteTitle} logo`} className="h-[38px] w-auto max-w-[120px] object-contain" />
                ) : (
                  <span className="max-w-[160px] truncate text-sm font-bold text-slate-800">{titleFallback}</span>
                )}
              </div>
            </Link>
          </div>
        </div>

        <div
          className={`lg:block ${
            effectiveCollapsed ? "overflow-visible" : "max-h-[calc(100vh-130px)] overflow-y-auto overflow-x-hidden pr-1"
          }`}
        >
          <AdminNav collapsed={effectiveCollapsed} role={role} />
        </div>
      </aside>
    </>
  );
}
