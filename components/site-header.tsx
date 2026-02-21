"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { logoutAdminAction } from "@/app/dashboard/actions";
import type { SiteSettings } from "@/lib/shop-store";
import { getCartCount, subscribeCartUpdates } from "@/lib/cart";

type SiteHeaderProps = {
  siteSettings: SiteSettings;
  accountUser?: {
    username: string;
    displayName: string;
    avatarUrl: string;
  } | null;
  topOffsetPx?: number;
};

function withAssetVersion(url: string, version: number): string {
  const safeUrl = url.trim();
  if (!safeUrl) return "";
  const sep = safeUrl.includes("?") ? "&" : "?";
  return `${safeUrl}${sep}v=${Math.max(1, Math.floor(version || 1))}`;
}

type ProductSearchResult = {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  price: number;
};

function normalizePath(path: string): string {
  const basePath = (path.split("?")[0] || "").trim();
  if (!basePath) return "/";
  if (basePath.length > 1 && basePath.endsWith("/")) {
    return basePath.slice(0, -1);
  }
  return basePath;
}

function isMenuItemActive(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

export function SiteHeader({
  siteSettings,
  accountUser = null,
  topOffsetPx = 0,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = siteSettings.headerMenu;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [siteAccountMenuOpen, setSiteAccountMenuOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchToggleRef = useRef<HTMLButtonElement | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const siteAccountCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siteAccountRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let canceled = false;

    const syncCartCount = async () => {
      const count = await getCartCount();
      if (!canceled) {
        setCartCount(count);
      }
    };

    void syncCartCount();
    const unsubscribe = subscribeCartUpdates(() => {
      void syncCartCount();
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (siteAccountCloseTimerRef.current) {
        clearTimeout(siteAccountCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const desktop = "matches" in event ? event.matches : mediaQuery.matches;
      setIsDesktopViewport(desktop);
      if (!desktop) {
        if (siteAccountCloseTimerRef.current) {
          clearTimeout(siteAccountCloseTimerRef.current);
          siteAccountCloseTimerRef.current = null;
        }
      }
    };

    handleViewportChange(mediaQuery);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportChange);
      return () => mediaQuery.removeEventListener("change", handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  useEffect(() => {
    setSiteAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!siteAccountMenuOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (!siteAccountRootRef.current) return;
      const target = event.target;
      if (target instanceof Node && siteAccountRootRef.current.contains(target)) {
        return;
      }
      setSiteAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [siteAccountMenuOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchToggleRef.current?.contains(target)) return;
      if (searchPanelRef.current?.contains(target)) return;
      setSearchOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchLoading(false);
      setSearchError("");
      setSearchResults([]);
      return;
    }

    const query = searchValue.trim();
    if (!query) {
      setSearchLoading(false);
      setSearchError("");
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(query)}&limit=6`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const payload = (await response.json()) as { results?: ProductSearchResult[] };
        if (!controller.signal.aborted) {
          setSearchResults(Array.isArray(payload.results) ? payload.results : []);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSearchError("Search is temporarily unavailable.");
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 140);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchOpen, searchValue]);

  const handleSiteAccountOpenDesktop = () => {
    if (!isDesktopViewport) return;
    if (siteAccountCloseTimerRef.current) {
      clearTimeout(siteAccountCloseTimerRef.current);
      siteAccountCloseTimerRef.current = null;
    }
    setSiteAccountMenuOpen(true);
  };

  const handleSiteAccountCloseDesktop = () => {
    if (!isDesktopViewport) return;
    if (siteAccountCloseTimerRef.current) {
      clearTimeout(siteAccountCloseTimerRef.current);
    }
    siteAccountCloseTimerRef.current = setTimeout(() => {
      setSiteAccountMenuOpen(false);
      siteAccountCloseTimerRef.current = null;
    }, 220);
  };

  const handleSiteAccountToggleClick = () => {
    setSiteAccountMenuOpen((open) => !open);
  };

  const logoSrc = withAssetVersion(siteSettings.logoUrl, siteSettings.brandingVersion);
  const hasLogo = siteSettings.logoUrl.trim().length > 0;
  const loginAccountHref = `/login?next=${encodeURIComponent("/my-account")}`;
  const loginRegisterHref = `/login?tab=register&next=${encodeURIComponent("/my-account")}`;
  const loginOrdersHref = `/login?next=${encodeURIComponent("/my-account?tab=orders")}`;
  const loginProfileHref = `/login?next=${encodeURIComponent("/my-account?tab=profile")}`;
  const accountProfileHref = "/my-account?tab=profile";

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchValue.trim();
    const target = term ? `/shop?search=${encodeURIComponent(term)}` : "/shop";
    router.push(target);
    setSearchOpen(false);
  }

  return (
    <div className="sticky z-[110]" style={{ top: `${Math.max(0, Math.floor(topOffsetPx))}px` }}>
      <div className="site-container pt-2">
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
                const isActive = isMenuItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group relative px-1 pb-1 text-sm font-semibold transition-colors duration-150 ${
                      isActive ? "text-[var(--site-color-primary)]" : "text-slate-700 hover:text-[var(--site-color-primary)]"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 -bottom-[2px] h-0.5 rounded-full bg-[var(--site-color-primary)] transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                ref={searchToggleRef}
                type="button"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((open) => !open)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  {searchOpen ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <>
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5" />
                    </>
                  )}
                </svg>
              </button>
              <div
                ref={siteAccountRootRef}
                className="relative"
                onMouseEnter={handleSiteAccountOpenDesktop}
                onMouseLeave={handleSiteAccountCloseDesktop}
              >
                {accountUser ? (
                  <Link
                    href={accountProfileHref}
                    aria-label="Edit profile"
                    aria-haspopup="menu"
                    aria-expanded={siteAccountMenuOpen}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition duration-150 hover:bg-slate-200"
                  >
                    {accountUser.avatarUrl ? (
                      <img src={accountUser.avatarUrl} alt={`${accountUser.username} avatar`} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden
                      >
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5 19a7 7 0 0 1 14 0" />
                      </svg>
                    )}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label="Account menu"
                    aria-haspopup="menu"
                    aria-expanded={siteAccountMenuOpen}
                    onClick={handleSiteAccountToggleClick}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition duration-150 hover:bg-slate-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 19a7 7 0 0 1 14 0" />
                    </svg>
                  </button>
                )}

                <div
                  className={`absolute right-0 top-[calc(100%+8px)] z-[190] rounded-2xl border border-slate-200 text-slate-800 shadow-xl transition ${
                    accountUser ? "w-52 bg-white p-2" : "w-[270px] bg-[#efefef] p-3"
                  } ${
                    siteAccountMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {accountUser ? (
                    <>
                      <Link
                        href={accountProfileHref}
                        onClick={() => setSiteAccountMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-150 hover:translate-x-0.5 hover:bg-slate-100"
                      >
                        Edit Profile
                      </Link>
                      <form action={logoutAdminAction}>
                        <button
                          type="submit"
                          onClick={() => setSiteAccountMenuOpen(false)}
                          className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition duration-150 hover:translate-x-0.5 hover:bg-slate-100"
                        >
                          Log out
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p className="px-0.5 text-3xl font-semibold leading-none text-slate-900">Account</p>
                      <Link
                        href={loginAccountHref}
                        onClick={() => setSiteAccountMenuOpen(false)}
                        className="mt-3 block rounded-xl bg-gradient-to-r from-[#6743ef] to-[#4f46e5] px-4 py-2.5 text-center text-base font-semibold leading-none text-white transition hover:opacity-95"
                      >
                        Sign in with shop
                      </Link>
                      <Link
                        href={loginRegisterHref}
                        onClick={() => setSiteAccountMenuOpen(false)}
                        className="mt-2 block rounded-xl bg-gradient-to-r from-[#3d5af1] to-[#3756ec] px-4 py-2.5 text-center text-base font-semibold leading-none text-white transition hover:opacity-95"
                      >
                        Other Sign In Options
                      </Link>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link
                          href={loginOrdersHref}
                          onClick={() => setSiteAccountMenuOpen(false)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3756ec] bg-white px-3 py-2 text-sm font-semibold leading-none text-[#3756ec] transition hover:bg-indigo-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <rect x="4" y="3" width="16" height="18" rx="2" />
                            <path d="M8 7h8M8 11h8M8 15h5" />
                          </svg>
                          Orders
                        </Link>
                        <Link
                          href={loginProfileHref}
                          onClick={() => setSiteAccountMenuOpen(false)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3756ec] bg-white px-3 py-2 text-sm font-semibold leading-none text-[#3756ec] transition hover:bg-indigo-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <circle cx="12" cy="8" r="3.5" />
                            <path d="M5 19a7 7 0 0 1 14 0" />
                          </svg>
                          Profile
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
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

          <div
            ref={searchPanelRef}
            className={`grid transition-all duration-300 ${
              searchOpen ? "grid-rows-[1fr] border-t border-slate-200" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 p-3 md:px-6">
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  type="search"
                  autoComplete="off"
                  placeholder="Search products..."
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-500"
                />
                <button
                  type="submit"
                  className="h-9 rounded-lg site-primary-bg px-3 text-xs font-semibold text-white transition site-primary-bg-hover"
                >
                  Search
                </button>
              </form>

              {searchValue.trim() ? (
                <div className="border-t border-slate-200 px-3 pb-3 md:px-6">
                  {searchLoading ? (
                    <p className="pt-2 text-xs font-medium text-slate-500">Searching...</p>
                  ) : searchError ? (
                    <p className="pt-2 text-xs font-medium text-rose-700">{searchError}</p>
                  ) : searchResults.length > 0 ? (
                    <div className="pt-2">
                      <ul className="space-y-1">
                        {searchResults.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-50"
                            >
                              <span
                                className="h-10 w-12 shrink-0 rounded-md bg-slate-100 bg-cover bg-center"
                                style={{ backgroundImage: `url('${item.image}')` }}
                                aria-hidden
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-slate-900">{item.name}</span>
                                <span className="block truncate text-[11px] text-slate-500">
                                  {item.category} - ${item.price}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/shop?search=${encodeURIComponent(searchValue.trim())}`}
                        onClick={() => setSearchOpen(false)}
                        className="mt-2 inline-flex rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        See all results
                      </Link>
                    </div>
                  ) : (
                    <p className="pt-2 text-xs font-medium text-slate-500">No matching products.</p>
                  )}
                </div>
              ) : null}
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
                  const isActive = isMenuItemActive(pathname, item.href);
                  return (
                    <Link
                      key={`mobile-${item.label}`}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-100 text-[var(--site-color-primary)]"
                          : "text-slate-700 hover:bg-slate-100 hover:text-[var(--site-color-primary)]"
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


