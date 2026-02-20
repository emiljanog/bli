"use client";

import { useEffect, useState, type ReactNode } from "react";

type AdminPersistentCollapsibleProps = {
  storageKey: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AdminPersistentCollapsible({
  storageKey,
  title,
  children,
  defaultOpen = true,
}: AdminPersistentCollapsibleProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === "1") return true;
      if (raw === "0") return false;
    } catch {
      // Ignore browser storage errors.
    }
    return defaultOpen;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, open ? "1" : "0");
    } catch {
      // Ignore browser storage errors.
    }
  }, [open, storageKey]);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-3 text-left"
        aria-expanded={open}
      >
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <span className={`text-sm text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}>v</span>
      </button>

      {open ? <div className="border-t border-slate-200">{children}</div> : null}
    </article>
  );
}
