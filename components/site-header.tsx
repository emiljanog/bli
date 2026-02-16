"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/shop-store";
import { getCartCount, subscribeCartUpdates } from "@/lib/cart";

type SiteHeaderProps = {
  siteSettings: SiteSettings;
};

export function SiteHeader({ siteSettings }: SiteHeaderProps) {
  const pathname = usePathname();
  const menuItems = siteSettings.headerMenu;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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

  return (
    <div className="sticky top-3 z-50">
      <div className="mx-auto w-[90%] max-w-[1440px]">
        <header
          className={`rounded-2xl border transition-all duration-300 ${
            isScrolled
              ? "border-white/40 bg-white/55 shadow-lg shadow-slate-300/35 backdrop-blur-xl"
              : "border-slate-200/90 bg-white/95 shadow-sm backdrop-blur"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src={siteSettings.logoUrl}
                alt={`${siteSettings.brandName} logo`}
                className="h-[34px] w-auto max-w-[140px] object-contain"
              />
              {siteSettings.useLogoOnly ? null : (
                <span className="hidden text-sm font-bold tracking-wide text-slate-800 md:inline">
                  {siteSettings.brandName}
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
