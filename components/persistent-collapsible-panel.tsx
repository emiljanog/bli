"use client";

import { useEffect, useState, type ReactNode } from "react";

type PersistentCollapsiblePanelProps = {
  storageKey: string;
  title: string;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
};

function join(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function PersistentCollapsiblePanel({
  storageKey,
  title,
  defaultOpen = true,
  className,
  summaryClassName,
  titleClassName,
  bodyClassName,
  children,
}: PersistentCollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "0" || saved === "1") {
        setOpen(saved === "1");
      }
    } catch {
      // Ignore storage errors and keep default behavior.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  return (
    <details
      open={hydrated ? open : defaultOpen}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        try {
          window.localStorage.setItem(storageKey, next ? "1" : "0");
        } catch {
          // Ignore storage errors.
        }
      }}
      className={join("overflow-hidden rounded-3xl border border-slate-200 bg-white", className)}
    >
      <summary
        className={join(
          "flex cursor-pointer list-none items-center justify-between px-5 py-3 select-none",
          summaryClassName,
        )}
      >
        <p className={join("text-base font-semibold text-slate-900", titleClassName)}>{title}</p>
        <svg
          viewBox="0 0 12 12"
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M2.5 4.25L6 7.75L9.5 4.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </summary>
      <div className={join("border-t border-slate-200", bodyClassName)}>{children}</div>
    </details>
  );
}
