"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import type { AdminRole } from "@/lib/admin-auth";
import { ADMIN_SIDEBAR_COOKIE_NAME } from "@/lib/admin-auth";

type AdminSidebarProps = {
  defaultCollapsed?: boolean;
  role: AdminRole;
  logoUrl: string;
  iconUrl: string;
  brandName: string;
};

export function AdminSidebar({
  defaultCollapsed = false,
  role,
  logoUrl,
  iconUrl,
  brandName,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function handleToggleMenu() {
    setCollapsed((previous) => {
      const next = !previous;
      window.localStorage.setItem(ADMIN_SIDEBAR_COOKIE_NAME, next ? "1" : "0");
      document.cookie = `${ADMIN_SIDEBAR_COOKIE_NAME}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }

  return (
    <aside
      className={`overflow-hidden border-b border-slate-200 bg-[#f1f1f1] px-3 py-6 transition-[width] duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r ${
        collapsed ? "lg:w-[92px]" : "lg:w-[260px]"
      }`}
    >
      <div className="mb-7 rounded-xl bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" aria-label="Open dashboard" className="flex items-center">
            {collapsed ? (
              <img src={iconUrl || logoUrl} alt={`${brandName} icon`} className="h-7 w-7 object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt={`${brandName} logo`} className="h-[38px] w-auto max-w-[110px] object-contain" />
                <span className="max-w-[96px] truncate text-sm font-bold text-slate-800">{brandName}</span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label={collapsed ? "Open menu" : "Collapse menu"}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AdminNav collapsed={collapsed} role={role} />
    </aside>
  );
}
