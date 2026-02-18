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
  const [logoVisible, setLogoVisible] = useState(!defaultCollapsed);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (collapsed) {
      timer = setTimeout(() => setLogoVisible(false), 0);
    } else {
      timer = setTimeout(() => setLogoVisible(true), 170);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [collapsed]);

  function handleToggleMenu() {
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
        collapsed ? "lg:w-[92px]" : "lg:w-[260px]"
      }`}
    >
      <div className={collapsed ? "mb-3 flex justify-center" : "mb-7 rounded-xl bg-white p-3 shadow-sm"}>
        <div className="flex items-center justify-between gap-2">
          {!collapsed ? (
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

          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-1"}`}>
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label={collapsed ? "Open menu" : "Collapse menu"}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${
          collapsed ? "overflow-visible" : "max-h-[calc(100vh-130px)] overflow-y-auto overflow-x-hidden pr-1"
        }`}
      >
        <AdminNav collapsed={collapsed} role={role} />
      </div>
    </aside>
  );
}
