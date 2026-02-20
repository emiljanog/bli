"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SETTINGS_TABS } from "@/app/dashboard/settings/settings-tabs";
import { canAccessSettings, type AdminRole } from "@/lib/admin-auth";

type NavLinkItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
};

type AdminNavProps = {
  collapsed?: boolean;
  role: AdminRole;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

const FLYOUT_VIEWPORT_MARGIN = 8;

function getFlyoutTop(anchorTop: number, panelHeight: number): number {
  if (typeof window === "undefined") return anchorTop;
  const viewportHeight = window.innerHeight;
  const maxTop = Math.max(FLYOUT_VIEWPORT_MARGIN, viewportHeight - panelHeight - FLYOUT_VIEWPORT_MARGIN);
  return Math.max(FLYOUT_VIEWPORT_MARGIN, Math.min(anchorTop, maxTop));
}

function useDesktopNav(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop("matches" in event ? event.matches : mediaQuery.matches);
    };

    handleViewportChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportChange);
      return () => mediaQuery.removeEventListener("change", handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  return isDesktop;
}

const storeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path d="M3 7h18l-1.5 4.5a2 2 0 0 1-1.9 1.5H6.4a2 2 0 0 1-1.9-1.5z" />
    <path d="M5 13h14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
  </svg>
);

const settingsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.01a1.65 1.65 0 0 0 1.51.99H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const usersIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M17 11h6M20 8v6" />
  </svg>
);

const storeItems: NavLinkItem[] = [
  {
    label: "Products",
    href: "/dashboard/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M21 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1" />
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M7 12h4" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    label: "Tags",
    href: "/dashboard/tags",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z" />
        <circle cx="7.5" cy="7.5" r=".5" />
      </svg>
    ),
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M3 3v18h18" />
        <path d="m7 14 3-3 3 2 4-5" />
      </svg>
    ),
  },
  {
    label: "Coupons",
    href: "/dashboard/coupons",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" />
        <path d="M9 9h.01M15 15h.01M10 14l4-4" />
      </svg>
    ),
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 7h8" />
      </svg>
    ),
  },
];

const settingsItems: NavLinkItem[] = SETTINGS_TABS.map((tab) => {
  const iconBySlug: Record<string, ReactNode> = {
    general: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M4 12h16" />
        <path d="M4 6h16" />
        <path d="M4 18h16" />
      </svg>
    ),
    brand: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M12 3v18" />
        <path d="M7 7h7a4 4 0 1 1 0 8H7z" />
      </svg>
    ),
    payments: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    shipping: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M3 7h13v10H3z" />
        <path d="M16 10h3l2 2v5h-5z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="18.5" cy="17.5" r="1.5" />
      </svg>
    ),
    emails: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
    menu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    ),
    security: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M12 3 4 7v6c0 5 3.5 7.5 8 8 4.5-.5 8-3 8-8V7z" />
        <path d="M9.5 12.5 11 14l3.5-3.5" />
      </svg>
    ),
  };

  return {
    label: tab.label,
    href: `/dashboard/settings/${tab.slug}`,
    icon: iconBySlug[tab.slug],
  };
});

const mainItems: NavLinkItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M3 13h8V3H3zM13 21h8v-6h-8zM13 11h8V3h-8zM3 21h8v-6H3z" />
      </svg>
    ),
  },
  {
    label: "Pages",
    href: "/dashboard/pages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M4 3h11l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        <path d="M15 3v5h5" />
        <path d="M8 13h8M8 17h8M8 9h3" />
      </svg>
    ),
  },
  {
    label: "Slider",
    href: "/dashboard/slider",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 12h10" />
        <path d="M7 9h4M7 15h6" />
      </svg>
    ),
  },
  {
    label: "Media",
    href: "/dashboard/media",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M9 9h6M9 13h3" />
      </svg>
    ),
  },
];

const usersItem: NavLinkItem = {
  label: "Users",
  href: "/dashboard/users",
  icon: usersIcon,
};

function isLinkActive(pathname: string, item: NavLinkItem, searchParams?: SearchParamsLike): boolean {
  if (item.external) return false;
  const [hrefWithPath, hrefQuery = ""] = item.href.split("?");
  const hrefPath = hrefWithPath.split("#")[0];
  if (hrefPath === "/dashboard") return pathname === "/dashboard";
  const pathMatches = pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  if (!pathMatches) return false;

  if (!hrefQuery) return true;
  if (!searchParams) return false;

  const targetParams = new URLSearchParams(hrefQuery);
  for (const [key, value] of targetParams.entries()) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }
  return true;
}

function NavLink({
  item,
  collapsed,
  pathname,
  searchParams,
  className,
}: {
  item: NavLinkItem;
  collapsed: boolean;
  pathname: string;
  searchParams: SearchParamsLike;
  className?: string;
}) {
  const isActive = isLinkActive(pathname, item, searchParams);

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className={`group relative flex items-center rounded-xl py-2.5 text-sm font-semibold transition ${
        collapsed ? "justify-center px-3" : "px-[19px]"
      } ${isActive ? "site-primary-bg text-white" : "text-slate-600 hover:bg-slate-200/70"} ${className ?? ""}`}
      title={collapsed ? item.label : undefined}
    >
      {item.icon ? <span className={collapsed ? "mx-auto" : ""}>{item.icon}</span> : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
          {item.label}
        </span>
      ) : (
        <span className={`${item.icon ? "ml-3" : ""} whitespace-nowrap`}>{item.label}</span>
      )}
    </Link>
  );
}

function CollapsedGroup({
  label,
  icon,
  items,
  pathname,
  searchParams,
  active,
}: {
  label: string;
  icon: ReactNode;
  items: NavLinkItem[];
  pathname: string;
  searchParams: SearchParamsLike;
  active: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [flyoutStyle, setFlyoutStyle] = useState<{ top: number; left: number; maxHeight: number }>({
    top: 0,
    left: 0,
    maxHeight: 420,
  });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFlyoutPosition() {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const panelHeight = flyoutRef.current?.offsetHeight ?? 360;
    const top = getFlyoutTop(rect.top, panelHeight);
    const maxHeight =
      typeof window === "undefined" ? 420 : Math.max(220, window.innerHeight - FLYOUT_VIEWPORT_MARGIN * 2);
    setFlyoutStyle({
      top,
      left: rect.right + 6,
      maxHeight,
    });
  }

  function handleOpen() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updateFlyoutPosition();
    setTimeout(() => updateFlyoutPosition(), 0);
    setOpen(true);
  }

  function handleCloseWithDelay() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 260);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updateFlyoutPosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative" onMouseEnter={handleOpen} onMouseLeave={handleCloseWithDelay}>
      <button
        type="button"
        className={`group relative flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          active || open ? "site-primary-bg text-white" : "text-slate-600 hover:bg-slate-200/70"
        }`}
        title={label}
      >
        {icon}
        <span
          className={`pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow transition ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </button>

      <div
        ref={flyoutRef}
        style={flyoutStyle}
        className={`fixed z-40 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={false}
            pathname={pathname}
            searchParams={searchParams}
            className="text-sm"
          />
        ))}
      </div>
    </div>
  );
}

function ExpandedGroup({
  label,
  icon,
  items,
  pathname,
  searchParams,
  active,
  mobileMode,
}: {
  label: string;
  icon: ReactNode;
  items: NavLinkItem[];
  pathname: string;
  searchParams: SearchParamsLike;
  active: boolean;
  mobileMode: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [flyoutStyle, setFlyoutStyle] = useState<{ top: number; left: number; maxHeight: number }>({
    top: 0,
    left: 0,
    maxHeight: 420,
  });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFlyoutPosition() {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const panelHeight = flyoutRef.current?.offsetHeight ?? 360;
    const top = getFlyoutTop(rect.top, panelHeight);
    const maxHeight =
      typeof window === "undefined" ? 420 : Math.max(220, window.innerHeight - FLYOUT_VIEWPORT_MARGIN * 2);
    setFlyoutStyle({
      top,
      left: rect.right + 8,
      maxHeight,
    });
  }

  function handleOpen() {
    if (mobileMode) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updateFlyoutPosition();
    setTimeout(() => updateFlyoutPosition(), 0);
    setOpen(true);
  }

  function handleCloseWithDelay() {
    if (mobileMode) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 260);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open || active || mobileMode) return;
    const onReposition = () => updateFlyoutPosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [active, mobileMode, open]);

  const showInline = active || (mobileMode && open);
  const showFlyout = !mobileMode && !active && open;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={mobileMode ? undefined : handleOpen}
      onMouseLeave={mobileMode ? undefined : handleCloseWithDelay}
    >
      <button
        type="button"
        onClick={mobileMode ? () => setOpen((previous) => !previous) : undefined}
        className={`flex w-full items-center rounded-xl px-[19px] py-2 text-sm font-semibold transition ${
          active ? "site-primary-text" : "text-slate-600 hover:bg-slate-200/70"
        }`}
      >
        {icon}
        <span className="ml-3 whitespace-nowrap">{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`ml-auto h-4 w-4 transition-transform ${showInline || showFlyout ? "rotate-90" : ""}`}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {showInline ? (
        <div className="mt-1 space-y-1 px-1 pb-1 pt-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={false}
              pathname={pathname}
              searchParams={searchParams}
              className="pl-6"
            />
          ))}
        </div>
      ) : (
        <div
          ref={flyoutRef}
          style={flyoutStyle}
          className={`fixed z-50 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg transition ${
            showFlyout ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={false}
              pathname={pathname}
              searchParams={searchParams}
              className="text-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminNav({ collapsed = false, role }: AdminNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useDesktopNav();
  const isStoreActive = storeItems.some((item) => isLinkActive(pathname, item, searchParams));
  const isSettingsActive = settingsItems.some((item) => isLinkActive(pathname, item, searchParams));
  const isManager = role === "Manager";
  const showSettingsGroup = canAccessSettings(role) && !isManager;
  const showUsersLink = !isManager;
  const visibleMainItems = [
    ...mainItems.filter((item) => (isManager ? item.href === "/dashboard" : true)),
    ...(showUsersLink ? [usersItem] : []),
  ];

  if (collapsed) {
    return (
      <nav className="space-y-1 lg:w-max">
        {visibleMainItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed pathname={pathname} searchParams={searchParams} />
        ))}

        <CollapsedGroup
          label="Store"
          icon={storeIcon}
          items={storeItems}
          pathname={pathname}
          searchParams={searchParams}
          active={isStoreActive}
        />

        {showSettingsGroup ? (
          <CollapsedGroup
            label="Settings"
            icon={settingsIcon}
            items={settingsItems}
            pathname={pathname}
            searchParams={searchParams}
            active={isSettingsActive}
          />
        ) : null}
      </nav>
    );
  }

  return (
    <nav className="space-y-1 lg:w-max">
      {visibleMainItems.map((item) => (
        <NavLink key={item.href} item={item} collapsed={false} pathname={pathname} searchParams={searchParams} />
      ))}

      <ExpandedGroup
        label="Store"
        icon={storeIcon}
        items={storeItems}
        pathname={pathname}
        searchParams={searchParams}
        active={isStoreActive}
        mobileMode={!isDesktop}
      />

      {showSettingsGroup ? (
        <ExpandedGroup
          label="Settings"
          icon={settingsIcon}
          items={settingsItems}
          pathname={pathname}
          searchParams={searchParams}
          active={isSettingsActive}
          mobileMode={!isDesktop}
        />
      ) : null}
    </nav>
  );
}
