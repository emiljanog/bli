"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type SearchTarget = {
  label: string;
  href: string;
  keywords: string[];
};

const SEARCH_TARGETS: SearchTarget[] = [
  { label: "Dashboard", href: "/dashboard", keywords: ["dashboard", "home", "stats"] },
  { label: "Products", href: "/dashboard/products", keywords: ["product", "catalog", "items"] },
  { label: "Orders", href: "/dashboard/orders", keywords: ["order", "checkout", "payment"] },
  { label: "Customers", href: "/dashboard/customers", keywords: ["customer", "client"] },
  { label: "Users", href: "/dashboard/users", keywords: ["users", "admin", "account"] },
  { label: "Media", href: "/dashboard/media", keywords: ["media", "images", "gallery", "upload"] },
  { label: "Pages", href: "/dashboard/pages", keywords: ["pages", "content"] },
  { label: "Slider", href: "/dashboard/slider", keywords: ["slider", "hero", "home banner"] },
  { label: "Help Tickets", href: "/dashboard/help-tickets", keywords: ["help", "ticket", "support"] },
  { label: "Coupons", href: "/dashboard/coupons", keywords: ["coupon", "discount"] },
  { label: "Reviews", href: "/dashboard/reviews", keywords: ["reviews", "ratings"] },
  { label: "Settings", href: "/dashboard/settings/general", keywords: ["settings", "general", "brand", "layout"] },
  { label: "Page Layout", href: "/dashboard/settings/layout", keywords: ["layout", "width", "full width", "boxed"] },
];

function scoreTarget(target: SearchTarget, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const label = target.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (target.keywords.some((keyword) => keyword.includes(q))) return 40;
  return 0;
}

function isTypingContext(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const tag = element.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || element.isContentEditable;
}

export function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const matches = useMemo(() => {
    const scored = SEARCH_TARGETS.map((target) => ({
      target,
      score: scoreTarget(target, query),
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((item) => item.target);
  }, [query]);

  function openTarget(href: string) {
    router.push(href);
    setFocused(false);
    setQuery("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches.length > 0) {
      openTarget(matches[0].href);
      return;
    }
    if (query.trim()) {
      router.push(`/dashboard/products?search=${encodeURIComponent(query.trim())}`);
      setFocused(false);
      setQuery("");
    }
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (!event.ctrlKey && !event.metaKey && !event.altKey && key === "/" && !isTypingContext(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <div className="relative hidden md:block">
      <form
        onSubmit={handleSubmit}
        className="flex h-10 items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] px-3 text-[var(--admin-muted)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Search (Ctrl+K or /)"
          className="w-56 bg-transparent text-sm text-[var(--admin-text)] outline-none lg:w-72"
        />
      </form>

      {focused && query.trim() ? (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] p-2 shadow-lg">
          {matches.length === 0 ? (
            <p className="px-2 py-2 text-xs text-[var(--admin-muted)]">No result found.</p>
          ) : (
            <div className="space-y-1">
              {matches.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onMouseDown={() => openTarget(item.href)}
                  className="w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-[var(--admin-text)] transition hover:bg-[var(--admin-hover-bg)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
