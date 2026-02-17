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
import { logoutAdminAction } from "@/app/dashboard/actions";
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
    redirect("/login");
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
              <button
                type="button"
                aria-label="Notifications"
                title="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                  <path d="M10 17a2 2 0 0 0 4 0" />
                </svg>
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff8a00] px-1 text-[10px] font-semibold leading-none text-white">
                  4
                </span>
              </button>
              <div className="group relative">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20a8 8 0 0 1 16 0" />
                    </svg>
                  </span>
                  <span>{adminUsername || "Admin"}</span>
                </button>
                <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{adminRole}</p>
                  <Link
                    href="/my-account"
                    className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Account
                  </Link>
                </div>
              </div>
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                aria-label="Open web"
                title="Open web"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Web</span>
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
