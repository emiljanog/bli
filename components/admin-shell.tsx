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
import { AdminGlobalSearch } from "@/components/admin-global-search";
import { AdminNotificationsMenu } from "@/components/admin-notifications-menu";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminThemeToggle } from "@/components/admin-theme-toggle";
import { AdminUserMenu } from "@/components/admin-user-menu";
import {
  countUnreadAdminNotifications,
  findUserByUsername,
  getSiteSettings,
  listAdminNotifications,
} from "@/lib/shop-store";

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
  const currentUser = findUserByUsername(adminUsername);
  const adminNotifications = listAdminNotifications(14);
  const unreadNotifications = countUnreadAdminNotifications();
  const adminAvatarUrl = currentUser?.avatarUrl || "";
  const profileHref = currentUser ? `/dashboard/users/${currentUser.id}` : "/my-account";

  if (!isLoggedIn) {
    redirect("/login");
  }
  if (!canAccessAdmin(adminRole)) {
    redirect("/my-account");
  }

  return (
    <main className="admin-theme min-h-screen bg-[var(--admin-app-bg)] text-[var(--admin-text)]">
      <div className="grid min-h-screen lg:grid-cols-[auto_1fr]">
        <AdminSidebar
          defaultCollapsed={defaultSidebarCollapsed}
          role={adminRole}
          logoUrl={siteSettings.logoUrl}
          iconUrl={siteSettings.iconUrl}
          siteTitle={siteSettings.siteTitle}
          brandingVersion={siteSettings.brandingVersion}
        />

        <div className="px-4 py-5 md:px-8 md:py-7">
          <header className="mb-6 overflow-visible rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-header-bg)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3 md:px-6">
              <AdminGlobalSearch />
              <div className="flex items-center gap-2 text-[var(--admin-muted)]">
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open web"
                  title="Open web"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                  </svg>
                </Link>
                <AdminThemeToggle />
                <AdminNotificationsMenu
                  initialNotifications={adminNotifications}
                  initialUnreadCount={unreadNotifications}
                />
                <AdminUserMenu
                  username={adminUsername || "Admin"}
                  role={adminRole}
                  avatarUrl={adminAvatarUrl}
                  profileHref={profileHref}
                  compact
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                <span className="font-normal text-[var(--admin-muted)]">Dashboard / </span>
                <span>{title}</span>
              </h1>
              {description ? <p className="w-full text-sm text-[var(--admin-muted)]">{description}</p> : null}
            </div>
          </header>

          <form id="admin-logout-form" action={logoutAdminAction} className="hidden" />

          {children}
        </div>
      </div>
    </main>
  );
}
