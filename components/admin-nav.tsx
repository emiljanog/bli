"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { SETTINGS_TABS } from "@/app/admin/settings/settings-tabs";
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
    label: "Customers",
    href: "/dashboard/customers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8a4 4 0 1 1 0 8" />
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

const settingsItems: NavLinkItem[] = SETTINGS_TABS.map((tab) => ({
  label: tab.label,
  href: `/dashboard/settings/${tab.slug}`,
}));

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
    label: "Users",
    href: "/dashboard/users",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M17 11h6M20 8v6" />
      </svg>
    ),
  },
];

function isLinkActive(pathname: string, item: NavLinkItem): boolean {
  if (item.external) return false;
  if (item.href === "/dashboard") return pathname === "/dashboard";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  collapsed,
  pathname,
  className,
}: {
  item: NavLinkItem;
  collapsed: boolean;
  pathname: string;
  className?: string;
}) {
  const isActive = isLinkActive(pathname, item);

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        collapsed ? "justify-center" : ""
      } ${isActive ? "bg-[#ff8a00] text-white" : "text-slate-600 hover:bg-slate-200/70"} ${className ?? ""}`}
      title={collapsed ? item.label : undefined}
    >
      {item.icon ? <span className={collapsed ? "mx-auto" : ""}>{item.icon}</span> : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
          {item.label}
        </span>
      ) : (
        <span className={item.icon ? "ml-3" : ""}>{item.label}</span>
      )}
    </Link>
  );
}

function CollapsedGroup({
  label,
  icon,
  items,
  pathname,
  active,
}: {
  label: string;
  icon: ReactNode;
  items: NavLinkItem[];
  pathname: string;
  active: boolean;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={`group relative flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          active ? "bg-[#ff8a00] text-white" : "text-slate-600 hover:bg-slate-200/70"
        }`}
        title={label}
      >
        {icon}
        <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
          {label}
        </span>
      </button>

      <div className="pointer-events-none absolute left-full top-0 z-40 ml-2 w-56 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100">
        {items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={false} pathname={pathname} className="text-sm" />
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
  active,
  expanded,
  onToggle,
}: {
  label: string;
  icon: ReactNode;
  items: NavLinkItem[];
  pathname: string;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200/70 bg-white/60 p-1">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center rounded-lg px-2 py-2 text-sm font-semibold transition ${
          active ? "text-[#ff8a00]" : "text-slate-600 hover:bg-slate-200/70"
        }`}
      >
        {icon}
        <span className="ml-2">{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`ml-auto h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-[460px] opacity-100" : "max-h-0 opacity-0 group-hover:max-h-[460px] group-hover:opacity-100"
        }`}
      >
        <div className="space-y-1 px-1 pb-1 pt-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} collapsed={false} pathname={pathname} className="pl-6" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminNav({ collapsed = false, role }: AdminNavProps) {
  const pathname = usePathname();
  const isStoreActive = storeItems.some((item) => isLinkActive(pathname, item));
  const isSettingsActive = settingsItems.some((item) => isLinkActive(pathname, item));
  const [storeExpanded, setStoreExpanded] = useState(isStoreActive);
  const [settingsExpanded, setSettingsExpanded] = useState(isSettingsActive);
  const isManager = role === "Manager";
  const showSettingsGroup = canAccessSettings(role) && !isManager;
  const visibleMainItems = mainItems.filter((item) => (isManager ? item.href === "/dashboard" : true));

  if (collapsed) {
    return (
      <nav className="space-y-1">
        {visibleMainItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed pathname={pathname} />
        ))}

        <CollapsedGroup
          label="Store"
          icon={storeIcon}
          items={storeItems}
          pathname={pathname}
          active={isStoreActive}
        />

        {showSettingsGroup ? (
          <CollapsedGroup
            label="Settings"
            icon={settingsIcon}
            items={settingsItems}
            pathname={pathname}
            active={isSettingsActive}
          />
        ) : null}
      </nav>
    );
  }

  return (
    <nav className="space-y-1">
      {visibleMainItems.map((item) => (
        <NavLink key={item.href} item={item} collapsed={false} pathname={pathname} />
      ))}

      <ExpandedGroup
        label="Store"
        icon={storeIcon}
        items={storeItems}
        pathname={pathname}
        active={isStoreActive}
        expanded={storeExpanded}
        onToggle={() => setStoreExpanded((previous) => !previous)}
      />

      {showSettingsGroup ? (
        <ExpandedGroup
          label="Settings"
          icon={settingsIcon}
          items={settingsItems}
          pathname={pathname}
          active={isSettingsActive}
          expanded={settingsExpanded}
          onToggle={() => setSettingsExpanded((previous) => !previous)}
        />
      ) : null}
    </nav>
  );
}
