"use client";

import { useState } from "react";
import type { SiteMenuItem } from "@/lib/shop-store";

type MenuRow = {
  id: string;
  label: string;
  href: string;
};

type SettingsMenuEditorProps = {
  initialItems: SiteMenuItem[];
  redirectTo: string;
  action: (formData: FormData) => void | Promise<void>;
};

function toRows(items: SiteMenuItem[]): MenuRow[] {
  if (items.length === 0) {
    return [{ id: "menu-row-1", label: "", href: "/" }];
  }

  return items.map((item, index) => ({
    id: `menu-row-${index + 1}`,
    label: item.label,
    href: item.href,
  }));
}

function moveRow(items: MenuRow[], fromIndex: number, toIndex: number): MenuRow[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function SettingsMenuEditor({ initialItems, redirectTo, action }: SettingsMenuEditorProps) {
  const [items, setItems] = useState<MenuRow[]>(() => toRows(initialItems));
  const [nextId, setNextId] = useState(items.length + 1);
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);

  function addItem() {
    setItems((previous) => [...previous, { id: `menu-row-${nextId}`, label: "", href: "/" }]);
    setNextId((value) => value + 1);
  }

  function removeItem(rowId: string) {
    setItems((previous) => {
      const next = previous.filter((item) => item.id !== rowId);
      return next.length > 0 ? next : [{ id: `menu-row-${nextId}`, label: "", href: "/" }];
    });
    setNextId((value) => value + 1);
  }

  function updateItem(rowId: string, key: "label" | "href", value: string) {
    setItems((previous) =>
      previous.map((item) => (item.id === rowId ? { ...item, [key]: value } : item)),
    );
  }

  function handleDrop(targetRowId: string) {
    if (!draggingRowId || draggingRowId === targetRowId) return;
    setItems((previous) => {
      const fromIndex = previous.findIndex((item) => item.id === draggingRowId);
      const toIndex = previous.findIndex((item) => item.id === targetRowId);
      if (fromIndex === -1 || toIndex === -1) return previous;
      return moveRow(previous, fromIndex, toIndex);
    });
    setDraggingRowId(null);
  }

  return (
    <form action={action} className="mt-5 space-y-4">
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggingRowId(item.id)}
            onDragEnd={() => setDraggingRowId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(item.id)}
            className={`grid gap-3 rounded-2xl border bg-slate-50 p-3 md:grid-cols-[auto_1fr_1fr_auto] ${
              draggingRowId === item.id ? "site-primary-border" : "border-slate-200"
            }`}
          >
            <div className="flex items-center">
              <span
                className="inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 active:cursor-grabbing"
                title="Drag to reorder"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <circle cx="9" cy="7" r="1" />
                  <circle cx="15" cy="7" r="1" />
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="9" cy="17" r="1" />
                  <circle cx="15" cy="17" r="1" />
                </svg>
              </span>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Label
              </span>
              <input
                name="menuLabel"
                value={item.label}
                onChange={(event) => updateItem(item.id, "label", event.target.value)}
                placeholder={index === 0 ? "Home" : "Menu label"}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                URL
              </span>
              <input
                name="menuHref"
                value={item.href}
                onChange={(event) => updateItem(item.id, "href", event.target.value)}
                placeholder="/shop"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 md:w-auto"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">Drag and drop rows to change menu order.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Add Menu Item
        </button>
        <button
          type="submit"
          className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
        >
          Save Menu
        </button>
      </div>
    </form>
  );
}
