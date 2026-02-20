"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

type AdminUserMenuProps = {
  username: string;
  role: string;
  avatarUrl?: string;
  compact?: boolean;
  compactLarge?: boolean;
  logoutFormId?: string;
  profileHref?: string;
};

type MenuLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
};

function MenuLink({ href, label, icon }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-base font-medium text-[var(--admin-muted)] transition hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text)]"
    >
      <span className="text-[var(--admin-muted)]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function AdminUserMenu({
  username,
  role,
  avatarUrl = "",
  compact = false,
  compactLarge = false,
  logoutFormId = "admin-logout-form",
  profileHref = "/my-account",
}: AdminUserMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const safeName = username.trim() || "Admin";
  const hasAvatar = avatarUrl.trim().length > 0;
  const initial = safeName.charAt(0).toUpperCase();
  const compactButtonClass = compactLarge ? "h-[50px]" : "h-10";
  const compactAvatarClass = compactLarge ? "h-10 w-10" : "h-8 w-8";

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setOpen(true);
  }

  function closeWithDelay() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 420);
  }

  function toggleMenu() {
    clearCloseTimer();
    setOpen((prev) => !prev);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeWithDelay}
      onFocusCapture={openMenu}
      onBlurCapture={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && rootRef.current?.contains(next)) return;
        closeWithDelay();
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition ${
          compact
            ? `${compactButtonClass} rounded-full px-1 hover:bg-[var(--admin-hover-bg)]`
            : "h-10 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] px-3 hover:bg-[var(--admin-hover-bg)]"
        }`}
      >
        <span className={`inline-flex ${compactAvatarClass} items-center justify-center overflow-hidden rounded-full bg-[var(--admin-hover-bg)] text-[var(--admin-text)]`}>
          {hasAvatar ? (
            <img src={avatarUrl} alt={`${safeName} avatar`} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold">{initial}</span>
          )}
        </span>
        {!compact ? <span>{safeName}</span> : null}
      </button>

      <div
        className={`absolute right-0 top-full z-[220] pt-2 transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="w-64 overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] shadow-lg">
          <Link
            href={profileHref}
            className="flex items-center gap-3 border-b border-[var(--admin-border)] px-3 py-3 transition hover:bg-[var(--admin-hover-bg)]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--admin-hover-bg)] text-[var(--admin-text)]">
              {hasAvatar ? (
                <img src={avatarUrl} alt={`${safeName} avatar`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold">{initial}</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-[var(--admin-text)]">{safeName}</p>
              <p className="truncate text-sm font-medium text-[var(--admin-muted)]">{role}</p>
            </div>
          </Link>

          <div className="border-b border-[var(--admin-border)] px-2 py-2">
            <MenuLink
              href={profileHref}
              label="My Profile"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20a8 8 0 0 1 16 0" />
                </svg>
              }
            />
          </div>

          <div className="px-2 py-2">
            <button
              type="submit"
              form={logoutFormId}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-base font-medium text-[var(--admin-muted)] transition hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
