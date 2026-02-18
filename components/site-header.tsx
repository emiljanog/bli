"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { logoutAdminAction } from "@/app/dashboard/actions";
import type { SiteSettings } from "@/lib/shop-store";
import { getCartCount, subscribeCartUpdates } from "@/lib/cart";

type SiteHeaderProps = {
  siteSettings: SiteSettings;
  adminToolbar?: {
    username: string;
    displayName: string;
    avatarUrl: string;
    profileHref: string;
  } | null;
};

function withAssetVersion(url: string, version: number): string {
  const safeUrl = url.trim();
  if (!safeUrl) return "";
  const sep = safeUrl.includes("?") ? "&" : "?";
  return `${safeUrl}${sep}v=${Math.max(1, Math.floor(version || 1))}`;
}

type ToolbarLinkItem = {
  label: string;
  href: string;
};

type ToolbarDropdownProps = {
  label: string;
  items: ToolbarLinkItem[];
  href?: string;
  className?: string;
  icon?: ReactNode;
};

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
        <Link href={href} className="inline-flex items-center gap-1 rounded px-2 py-0.5 transition hover:bg-white/18">
          {icon}
          <span>{label}</span>
        </Link>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 transition hover:bg-white/18"
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
            className="block rounded px-2 py-1.5 text-xs font-semibold transition hover:bg-white/15"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

const DASHBOARD_MENU: ToolbarLinkItem[] = [
  { label: "Settings", href: "/dashboard/settings/general" },
  { label: "Store", href: "/dashboard/products" },
];

const NEW_MENU: ToolbarLinkItem[] = [
  { label: "New Product", href: "/dashboard/products/new" },
  { label: "New Page", href: "/dashboard/pages/new" },
  { label: "New User", href: "/dashboard/users" },
  { label: "New Media", href: "/dashboard/media/new" },
  { label: "New Order", href: "/dashboard/orders" },
];

function toPathSegments(pathname: string): string[] {
  return pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function getQuickEditHref(pathname: string): string | null {
  const segments = toPathSegments(pathname);
  if (segments.length === 0) return null;

  if ((segments[0] === "product" || segments[0] === "shop") && segments.length >= 2) {
    return `/dashboard/products/by-slug/${encodeURIComponent(segments[1])}`;
  }

  if (segments.length === 1) {
    const slug = segments[0].toLowerCase();
    const blockedSlugs = new Set([
      "shop",
      "product",
      "collections",
      "cart",
      "checkout",
      "contact",
      "my-account",
      "login",
      "dashboard",
      "user",
      "api",
    ]);
    if (!blockedSlugs.has(slug)) {
      return `/dashboard/pages/by-slug/${encodeURIComponent(segments[0])}`;
    }
  }

  return null;
}

export function SiteHeader({ siteSettings, adminToolbar = null }: SiteHeaderProps) {
  const pathname = usePathname();
  const menuItems = siteSettings.headerMenu;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickEditHref = useMemo(() => getQuickEditHref(pathname), [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartCount());
    syncCartCount();
    return subscribeCartUpdates(syncCartCount);
  }, []);

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

  const logoSrc = withAssetVersion(siteSettings.logoUrl, siteSettings.brandingVersion);
  const hasLogo = siteSettings.logoUrl.trim().length > 0;

  return (
    <div className="sticky top-0 z-[110]">
      {adminToolbar ? (
        <div className="w-full bg-black text-white shadow-sm">
          <div className="flex w-full items-center justify-between gap-2 px-3 py-1 text-[12px] md:px-4">
            <div className="flex min-w-0 items-center gap-1.5 font-medium">
              <ToolbarDropdown label="Dashboard" href="/dashboard" items={DASHBOARD_MENU} />
              <ToolbarDropdown
                label="New"
                items={NEW_MENU}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-4.5 w-4.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                }
              />
              {quickEditHref ? (
                <Link href={quickEditHref} className="inline-flex items-center gap-1 rounded px-2 py-0.5 transition hover:bg-white/15">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                  <span>Edit</span>
                </Link>
              ) : null}
            </div>

            <div className="relative shrink-0" onMouseEnter={handleAccountOpen} onMouseLeave={handleAccountCloseWithDelay}>
              <button type="button" className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-xs font-medium transition hover:bg-white/10">
                <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                  {adminToolbar.avatarUrl ? (
                    <img src={adminToolbar.avatarUrl} alt={`${adminToolbar.username} avatar`} className="h-full w-full object-cover" />
                  ) : (
                    adminToolbar.username.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="max-w-[130px] truncate">{adminToolbar.displayName}</span>
              </button>
              <div
                className={`absolute right-0 top-[calc(100%+6px)] z-[190] w-44 rounded-b-md border border-slate-800 bg-black p-1.5 text-white shadow-xl transition duration-150 ${
                  accountMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Link
                  href={adminToolbar.profileHref}
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
      ) : null}

      <div className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] pt-2">
        <header
          className={`rounded-2xl border transition-all duration-300 ${
            isScrolled
              ? "border-white/40 bg-white/55 shadow-lg shadow-slate-300/35 backdrop-blur-xl"
              : "border-slate-200/90 bg-white/95 shadow-sm backdrop-blur"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              {hasLogo ? (
                <img
                  src={logoSrc}
                  alt={`${siteSettings.siteTitle} logo`}
                  className="h-[34px] w-auto max-w-[140px] object-contain"
                />
              ) : (
                <span className="text-sm font-bold tracking-wide text-slate-800 md:text-base">
                  {siteSettings.siteTitle}
                </span>
              )}
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-semibold transition ${
                      isActive ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Search"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </button>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="17" cy="20" r="1.5" />
                  <path d="M3 4h2l2.5 11h10.5l2-8H7" />
                </svg>
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-slate-900 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <nav
            className={`grid transition-all duration-300 md:hidden ${
              mobileMenuOpen ? "grid-rows-[1fr] border-t border-slate-200" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-1 p-3">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={`mobile-${item.label}`}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </header>
      </div>
    </div>
  );
}

