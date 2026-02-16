import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  ADMIN_SIDEBAR_COOKIE_NAME,
  canAccessAdmin,
  getAdminRoleFromCookieStore,
  getAdminUsernameFromCookieStore,
} from "@/lib/admin-auth";
import { logoutAdminAction } from "@/app/admin/actions";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getSiteSettings } from "@/lib/shop-store";

type AdminShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export async function AdminShell({ title, description, children }: AdminShellProps) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const defaultSidebarCollapsed = cookieStore.get(ADMIN_SIDEBAR_COOKIE_NAME)?.value === "1";
  const adminRole = getAdminRoleFromCookieStore(cookieStore);
  const adminUsername = getAdminUsernameFromCookieStore(cookieStore);
  const siteSettings = getSiteSettings();

  if (!isLoggedIn) {
    redirect("/user/login");
  }
  if (!canAccessAdmin(adminRole)) {
    redirect("/my-account");
  }

  return (
    <main className="min-h-screen bg-[#d8cfc2] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[auto_1fr]">
        <AdminSidebar
          defaultCollapsed={defaultSidebarCollapsed}
          role={adminRole}
          logoUrl={siteSettings.logoUrl}
          iconUrl={siteSettings.iconUrl}
          brandName={siteSettings.brandName}
        />

        <div className="px-4 py-5 md:px-8 md:py-7">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
              {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center rounded-xl border border-slate-200 bg-white px-3 py-2 md:flex">
                <input
                  type="text"
                  placeholder="Search stock, order, etc"
                  className="w-56 bg-transparent text-sm outline-none"
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                {adminUsername} | {adminRole}
              </div>
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                aria-label="View website"
                title="View website"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>View Web</span>
              </Link>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
                >
                  Logout
                </button>
              </form>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
