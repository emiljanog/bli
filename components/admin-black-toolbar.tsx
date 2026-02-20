"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logoutAdminAction } from "@/app/dashboard/actions";

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
};

type AdminBlackToolbarProps = {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileHref: string;
  quickEditHref?: string | null;
  dashboardMode?: boolean;
  sticky?: boolean;
};

const SITE_DASHBOARD_MENU: ToolbarLinkItem[] = [
  { label: "Settings", href: "/dashboard/settings/general" },
  { label: "Store", href: "/dashboard/products" },
];

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

function ToolbarDropdown({ label, items, href, className = "", icon = null }: ToolbarDropdownProps) {
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

  return (
    <div className={`relative ${className}`} onMouseEnter={handleOpen} onMouseLeave={handleCloseWithDelay}>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-white/18 md:py-0.5">
          {icon}
          <span>{label}</span>
        </Link>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-white/18 md:py-0.5"
        >
          {icon}
          <span>{label}</span>
        </button>
      )}
      <div
        className={`absolute left-0 top-[calc(100%+6px)] z-[180] min-w-[180px] rounded-b-md border border-slate-800 bg-black p-1.5 text-white shadow-xl transition duration-150 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold transition hover:bg-white/15"
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
  quickEditHref = null,
  dashboardMode = false,
  sticky = false,
}: AdminBlackToolbarProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (accountCloseTimerRef.current) {
        clearTimeout(accountCloseTimerRef.current);
      }
    };
  }, []);

  const handleAccountOpen = () => {
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
    setAccountMenuOpen(true);
  };

  const handleAccountCloseWithDelay = () => {
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
    }
    accountCloseTimerRef.current = setTimeout(() => {
      setAccountMenuOpen(false);
      accountCloseTimerRef.current = null;
    }, 260);
  };

  const fallbackInitial = username.trim().charAt(0).toUpperCase() || "A";
  const dashboardMenu = dashboardMode ? DASHBOARD_DASHBOARD_MENU : SITE_DASHBOARD_MENU;

  return (
    <div className={`${sticky ? "sticky top-0 z-[260]" : ""} w-full bg-black text-white shadow-sm`}>
      <div className="flex min-h-[40px] w-full items-center justify-between gap-2 px-3 py-1.5 text-[12px] md:min-h-0 md:px-4 md:py-1">
        <div className="flex min-w-0 items-center gap-1.5 font-medium">
          <ToolbarDropdown label="Dashboard" href="/dashboard" items={dashboardMenu} />
          <ToolbarDropdown
            label="New"
            items={NEW_MENU}
            icon={(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-4.5 w-4.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          />
          {quickEditHref ? (
            <Link href={quickEditHref} className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-white/15 md:py-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              <span>Edit</span>
            </Link>
          ) : null}
        </div>

        <div
          className="relative shrink-0"
          onMouseEnter={handleAccountOpen}
          onMouseLeave={handleAccountCloseWithDelay}
        >
          <button type="button" className="inline-flex items-center gap-1.5 rounded px-1 py-1 text-xs font-medium transition hover:bg-white/10 md:py-0.5">
            <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt={`${username} avatar`} className="h-full w-full object-cover" />
              ) : (
                fallbackInitial
              )}
            </span>
            <span className="max-w-[130px] truncate">{displayName}</span>
          </button>
          <div
            className={`absolute right-0 top-[calc(100%+6px)] z-[190] w-44 rounded-b-md border border-slate-800 bg-black p-1.5 text-white shadow-xl transition duration-150 ${
              accountMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Link
              href={profileHref}
              className="block rounded px-2 py-1.5 text-xs font-semibold transition hover:bg-white/[0.02]"
              onClick={() => setAccountMenuOpen(false)}
            >
              Edit Profile
            </Link>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="block w-full rounded px-2 py-1.5 text-left text-xs font-semibold transition hover:bg-white/[0.02]"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
