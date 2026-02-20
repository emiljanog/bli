"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ThemeMode = "light" | "dark" | "system";
type AdminThemeToggleProps = {
  size?: "default" | "large";
};

const THEME_STORAGE_KEY = "bli-theme-mode";

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
    return;
  }
  root.setAttribute("data-theme", mode);
}

export function AdminThemeToggle({ size = "default" }: AdminThemeToggleProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const storedMode: ThemeMode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    applyTheme(storedMode);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    const rafId = window.requestAnimationFrame(() => {
      setMode(storedMode);
      setSystemTheme(media.matches ? "dark" : "light");
      setReady(true);
    });
    return () => {
      window.cancelAnimationFrame(rafId);
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !ready) return;
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);
  }, [mode, ready]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const effectiveTheme = useMemo(() => (mode === "system" ? systemTheme : mode), [mode, systemTheme]);
  const buttonSizeClass = size === "large" ? "h-[45px] w-[45px]" : "h-9 w-9";
  const iconSizeClass = size === "large" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Theme"
        title="Theme"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex ${buttonSizeClass} items-center justify-center rounded-full transition hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text)]`}
      >
        <span className={`relative block ${iconSizeClass}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`absolute inset-0 ${iconSizeClass} transition ${effectiveTheme === "dark" ? "opacity-100" : "opacity-0"}`}
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`absolute inset-0 ${iconSizeClass} transition ${effectiveTheme === "dark" ? "opacity-0" : "opacity-100"}`}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </span>
      </button>

      <div
        className={`absolute right-0 top-full z-[210] mt-2 w-44 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] p-2 shadow-lg transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {(["light", "dark", "system"] as ThemeMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-semibold text-[var(--admin-text)] transition hover:bg-[var(--admin-hover-bg)]"
          >
            <span>{item === "light" ? "Light" : item === "dark" ? "Dark" : "System"}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-4 w-4 transition ${mode === item ? "opacity-100" : "opacity-0"}`}
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
