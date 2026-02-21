"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { logoutAdminAction } from "@/app/dashboard/actions";
import { AdminNotificationsMenu, type AdminNotificationItem } from "@/components/admin-notifications-menu";
import { AdminThemeToggle } from "@/components/admin-theme-toggle";
import {
  canAccessSettings,
  type AdminRole,
  ADMIN_SIDEBAR_COOKIE_NAME,
  ADMIN_SIDEBAR_STATE_EVENT,
  ADMIN_SIDEBAR_TOGGLE_REQUEST_EVENT,
} from "@/lib/admin-auth";

type ToolbarLinkItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

type ToolbarDropdownProps = {
  label: string;
  items: ToolbarLinkItem[];
  href?: string;
  className?: string;
  icon?: ReactNode;
  hideLabelOnMobile?: boolean;
};

type AdminBlackToolbarProps = {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileHref: string;
  role?: AdminRole;
  quickEditHref?: string | null;
  dashboardMode?: boolean;
  sticky?: boolean;
  showAdminControls?: boolean;
  initialNotifications?: AdminNotificationItem[];
  initialUnreadCount?: number;
};

const DASHBOARD_DASHBOARD_MENU: ToolbarLinkItem[] = [
  {
    label: "View Web",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: "View Shop",
    href: "/shop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
        <path d="M3 7h18l-2 12H5L3 7z" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  },
];

const NEW_MENU: ToolbarLinkItem[] = [
  { label: "New Product", href: "/dashboard/products/new" },
  { label: "New Page", href: "/dashboard/pages/new" },
  { label: "New User", href: "/dashboard/users" },
  { label: "New Media", href: "/dashboard/media?upload=1" },
  { label: "New Order", href: "/dashboard/orders" },
];

function getHomeDashboardMenu(role: AdminRole): ToolbarLinkItem[] {
  const isManager = role === "Manager";
  const items: ToolbarLinkItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <rect x="3" y="3" width="8" height="8" rx="1" />
          <rect x="13" y="3" width="8" height="6" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
          <rect x="13" y="11" width="8" height="10" rx="1" />
        </svg>
      ),
    },
  ];

  if (!isManager) {
    items.push(
      {
        label: "Pages",
        href: "/dashboard/pages",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M6 3h9l3 3v15H6z" />
            <path d="M15 3v3h3" />
          </svg>
        ),
      },
      {
        label: "Slider",
        href: "/dashboard/slider",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 12h10" />
          </svg>
        ),
      },
      {
        label: "Media",
        href: "/dashboard/media",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        ),
      },
      {
        label: "Tickets",
        href: "/dashboard/help-tickets",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
    );
  }

  items.push({
    label: "Store",
    href: "/dashboard/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
        <path d="M3 7h18l-2 12H5L3 7z" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  });

  if (canAccessSettings(role) && !isManager) {
    items.push({
      label: "Settings",
      href: "/dashboard/settings/general",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.01a1.65 1.65 0 0 0 1.51.99H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    });
  }

  if (!isManager) {
    items.push({
      label: "Users",
      href: "/dashboard/users",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M17 11h6M20 8v6" />
        </svg>
      ),
    });
  }

  return items;
}

function ToolbarDropdown({
  label,
  items,
  href,
  className = "",
  icon = null,
  hideLabelOnMobile = false,
}: ToolbarDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  const handleCloseWithDelay = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 260);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: globalThis.MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const handleTriggerClick = (event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!isMobileViewport()) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`} onMouseEnter={handleOpen} onMouseLeave={handleCloseWithDelay}>
      {href ? (
        <Link
          href={href}
          aria-label={label}
          onClick={handleTriggerClick}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition duration-150 hover:bg-[var(--admin-toolbar-hover-bg)] md:py-1"
        >
          {icon}
          <span className={hideLabelOnMobile ? "hidden md:inline" : ""}>{label}</span>
        </Link>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-label={label}
          onClick={handleTriggerClick}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold transition duration-150 hover:bg-[var(--admin-toolbar-hover-bg)] md:py-1"
        >
          {icon}
          <span className={hideLabelOnMobile ? "hidden md:inline" : ""}>{label}</span>
        </button>
      )}
      <div
        className={`absolute left-0 top-[calc(100%+8px)] z-[180] min-w-[210px] rounded-xl border border-[var(--admin-toolbar-menu-border)] bg-[var(--admin-toolbar-menu-bg)] p-2 text-[var(--admin-toolbar-menu-text)] shadow-xl backdrop-blur-sm transition duration-150 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[var(--admin-toolbar-menu-text)] transition duration-150 hover:translate-x-0.5 hover:bg-[var(--admin-toolbar-menu-hover)]"
            onClick={() => setOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AdminBlackToolbar({
  username,
  displayName,
  avatarUrl,
  profileHref,
  role = "Super Admin",
  quickEditHref = null,
  dashboardMode = false,
  sticky = false,
  showAdminControls = false,
  initialNotifications = [],
  initialUnreadCount = 0,
}: AdminBlackToolbarProps) {
  const accountRootRef = useRef<HTMLDivElement | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const accountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (accountCloseTimerRef.current) {
        clearTimeout(accountCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleOutside = (event: globalThis.MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (accountRootRef.current?.contains(target)) return;
      setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!dashboardMode) return;
    const stored = window.localStorage.getItem(ADMIN_SIDEBAR_COOKIE_NAME);
    const rafId = window.requestAnimationFrame(() => {
      setSidebarCollapsed(stored === "1");
    });

    const handleSidebarState = (event: Event) => {
      const detail = (event as CustomEvent<{ collapsed?: boolean }>).detail;
      if (typeof detail?.collapsed === "boolean") {
        setSidebarCollapsed(detail.collapsed);
      }
    };

    window.addEventListener(ADMIN_SIDEBAR_STATE_EVENT, handleSidebarState);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener(ADMIN_SIDEBAR_STATE_EVENT, handleSidebarState);
    };
  }, [dashboardMode]);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const handleAccountOpen = () => {
    if (isMobileViewport()) return;
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
    setAccountMenuOpen(true);
  };

  const handleAccountCloseWithDelay = () => {
    if (isMobileViewport()) return;
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
    }
    accountCloseTimerRef.current = setTimeout(() => {
      setAccountMenuOpen(false);
      accountCloseTimerRef.current = null;
    }, 260);
  };

  const handleAccountTriggerClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!isMobileViewport()) return;
    event.preventDefault();
    event.stopPropagation();
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
    setAccountMenuOpen((prev) => !prev);
  };

  const handleSidebarToggle = () => {
    if (!dashboardMode) return;
    window.dispatchEvent(new Event(ADMIN_SIDEBAR_TOGGLE_REQUEST_EVENT));
  };

  const fallbackInitial = username.trim().charAt(0).toUpperCase() || "A";
  const safeDisplayName = displayName.trim() || username || "Admin";
  const welcomeLabel = `Welcome, ${safeDisplayName}`;
  const homeDashboardMenu = getHomeDashboardMenu(role);
  const dashboardMenu = dashboardMode ? DASHBOARD_DASHBOARD_MENU : homeDashboardMenu;
  const dashboardHref = dashboardMode ? "/" : "/dashboard";

  return (
    <div
      className={`${sticky ? "sticky top-0 z-[260]" : ""} w-full border-b border-[var(--admin-toolbar-border)] bg-[var(--admin-toolbar-bg)] text-[var(--admin-toolbar-text)] shadow-sm`}
    >
      <div className="flex min-h-[40px] w-full items-center justify-between gap-2 px-3 py-1.5 text-[12px] md:min-h-0 md:px-4 md:py-1">
        <div className="flex min-w-0 items-center gap-1.5 font-medium">
          {dashboardMode ? (
            <button
              type="button"
              onClick={handleSidebarToggle}
              aria-label="Toggle menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md transition duration-150 hover:bg-[var(--admin-toolbar-hover-bg)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className="h-4.5 w-4.5 lg:hidden">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
              {sidebarCollapsed ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="hidden h-4.5 w-4.5 lg:block"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  className="hidden h-4.5 w-4.5 lg:block"
                >
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          ) : null}

          <ToolbarDropdown
            label="Dashboard"
            href={dashboardHref}
            items={dashboardMenu}
            hideLabelOnMobile
            icon={(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.7" className="h-4 w-4">
                <rect x="2" y="2" width="7" height="8" rx="1.2" />
                <rect x="15" y="3" width="7" height="6" rx="1.2" />
                <rect x="2" y="14" width="7" height="6" rx="1.2" />
                <rect x="15" y="13" width="7" height="8" rx="1.2" />
              </svg>
            )}
          />
          <ToolbarDropdown
            label="New"
            items={NEW_MENU}
            hideLabelOnMobile
            icon={(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" className="h-5 w-5">
                <path d="M12 6v12M6 12h12" />
              </svg>
            )}
          />
          {quickEditHref ? (
            <Link href={quickEditHref} aria-label="Edit" className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-[var(--admin-toolbar-hover-bg)] md:py-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              <span className="hidden md:inline">Edit</span>
            </Link>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {showAdminControls ? <AdminThemeToggle /> : null}
          {showAdminControls ? (
            <AdminNotificationsMenu
              initialNotifications={initialNotifications}
              initialUnreadCount={initialUnreadCount}
            />
          ) : null}

          <div
            ref={accountRootRef}
            className="relative"
            onMouseEnter={handleAccountOpen}
            onMouseLeave={handleAccountCloseWithDelay}
          >
            <Link
              href={profileHref}
              onClick={handleAccountTriggerClick}
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition duration-150 hover:bg-[var(--admin-toolbar-hover-bg)]"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`${username} avatar`} className="h-full w-full object-cover" />
                ) : (
                  fallbackInitial
                )}
              </span>
              <span className="hidden max-w-[240px] truncate md:inline">{welcomeLabel}</span>
            </Link>
            <div
              className={`absolute right-0 top-[calc(100%+8px)] z-[190] w-52 rounded-xl border border-[var(--admin-toolbar-menu-border)] bg-[var(--admin-toolbar-menu-bg)] p-2 text-[var(--admin-toolbar-menu-text)] shadow-xl backdrop-blur-sm transition duration-150 ${
                accountMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Link
                href={profileHref}
                className="block rounded-md px-3 py-2 text-sm font-semibold transition duration-150 hover:translate-x-0.5 hover:bg-[var(--admin-toolbar-menu-hover)]"
                onClick={() => setAccountMenuOpen(false)}
              >
                Edit Profile
              </Link>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  onClick={() => setAccountMenuOpen(false)}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-semibold transition duration-150 hover:translate-x-0.5 hover:bg-[var(--admin-toolbar-menu-hover)]"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
