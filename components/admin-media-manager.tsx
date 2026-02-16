"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  bulkMediaAction,
  deleteMediaPermanentlyAction,
  restoreMediaAction,
} from "@/app/dashboard/actions";
import { AdminMediaTrashAction } from "@/components/admin-media-trash-action";

export type AdminMediaRow = {
  id: string;
  url: string;
  assignedTo: "Unassigned" | "Product" | "Page" | "User";
  assignedToId: string | null;
  alt: string;
  description: string;
  updatedAt: string;
  trashedAt: string | null;
  usageCount: number;
};

type AdminMediaManagerProps = {
  media: AdminMediaRow[];
};

const ALLOWED_PAGE_SIZES = new Set([15, 30, 50, 100]);

function safePageSize(value: unknown): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && ALLOWED_PAGE_SIZES.has(parsed)) {
    return parsed;
  }
  return 15;
}

type MediaFilter = "all" | "active" | "trash";
type MediaBulkAction = "trash" | "restore" | "delete_permanently";
type MediaView = "grid" | "list";

export function AdminMediaManager({ media }: AdminMediaManagerProps) {
  const [view, setView] = useState<MediaView>("list");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<MediaBulkAction>("trash");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    const active = media.filter((item) => !item.trashedAt).length;
    const trash = media.filter((item) => Boolean(item.trashedAt)).length;
    return { active, trash };
  }, [media]);

  function assignmentHref(item: AdminMediaRow): string | null {
    const assignedId = (item.assignedToId ?? "").trim();
    if (!assignedId) return null;
    if (item.assignedTo === "Product") return `/dashboard/products/${assignedId}`;
    if (item.assignedTo === "Page") return `/dashboard/pages/${assignedId}`;
    if (item.assignedTo === "User") return `/dashboard/users/${assignedId}`;
    return null;
  }

  function renderAssigned(item: AdminMediaRow) {
    const assignedId = (item.assignedToId ?? "").trim();
    const href = assignmentHref(item);
    if (!assignedId) {
      return <span>{item.assignedTo}</span>;
    }
    if (!href) {
      return (
        <span>
          {item.assignedTo} ({assignedId})
        </span>
      );
    }
    return (
      <span>
        {item.assignedTo} (
        <Link href={href} className="font-semibold text-[#2ea2cc] hover:underline">
          {assignedId}
        </Link>
        )
      </span>
    );
  }

  const filteredMedia = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return media.filter((item) => {
      if (filter === "active" && item.trashedAt) return false;
      if (filter === "trash" && !item.trashedAt) return false;
      if (!query) return true;

      return (
        item.id.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        item.assignedTo.toLowerCase().includes(query) ||
        (item.assignedToId ?? "").toLowerCase().includes(query) ||
        item.alt.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [media, filter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedMedia = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredMedia.slice(start, start + pageSize);
  }, [filteredMedia, safePage, pageSize]);

  const pagedIds = useMemo(() => pagedMedia.map((item) => item.id), [pagedMedia]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allChecked = pagedMedia.length > 0 && pagedMedia.every((item) => selectedSet.has(item.id));
  const partiallyChecked = pagedMedia.some((item) => selectedSet.has(item.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = partiallyChecked;
    }
  }, [partiallyChecked]);

  function toggleAll(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const mediaId of pagedIds) {
        if (checked) {
          next.add(mediaId);
        } else {
          next.delete(mediaId);
        }
      }
      return Array.from(next);
    });
  }

  function toggleOne(mediaId: string, checked: boolean) {
    setSelectedIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, mediaId]));
      }
      return previous.filter((id) => id !== mediaId);
    });
  }

  function toggleOneByClick(mediaId: string) {
    const checked = !selectedSet.has(mediaId);
    toggleOne(mediaId, checked);
  }

  const showingText =
    filteredMedia.length === 0
      ? "No media found"
      : `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filteredMedia.length)} of ${filteredMedia.length}`;

  function renderControls(position: "top" | "bottom") {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 ${
          position === "top" ? "mb-3" : "mt-4"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold text-slate-600">{showingText}</p>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(event) => toggleAll(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Select all on page
          </label>
          <span className="text-xs font-semibold text-slate-500">Selected: {selectedIds.length}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={bulkMediaAction} className="inline-flex items-center gap-2">
            <input type="hidden" name="selectedMediaIds" value={selectedIds.join(",")} />
            <input type="hidden" name="redirectTo" value="/dashboard/media" />
            <select
              name="bulkAction"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value as MediaBulkAction)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
            >
              <option value="trash">Move to Trash</option>
              <option value="restore">Restore</option>
              <option value="delete_permanently">Delete Permanently</option>
            </select>
            <button
              type="submit"
              disabled={selectedIds.length === 0}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update
            </button>
          </form>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            Per page
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(safePageSize(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-600">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All: {media.length}
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("active");
              setCurrentPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === "active"
                ? "border-[#ff8a00] bg-[#ff8a00] text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Active: {counts.active}
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("trash");
              setCurrentPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              filter === "trash"
                ? "border-[#ff8a00] bg-[#ff8a00] text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Trash: {counts.trash}
          </button>
        </div>

        <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              view === "list" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M8 6h13M8 12h13M8 18h13" />
                <circle cx="4" cy="6" r="1" />
                <circle cx="4" cy="12" r="1" />
                <circle cx="4" cy="18" r="1" />
              </svg>
              List
            </span>
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              view === "grid" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Grid
            </span>
          </button>
        </div>
      </div>

      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            type="text"
            placeholder="Search media..."
            className="h-9 w-60 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-500"
          />
          {searchQuery.trim() ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {renderControls("top")}

      {view === "grid" ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pagedMedia.map((item) => {
            const isSelected = selectedSet.has(item.id);
            const isTrashed = Boolean(item.trashedAt);

            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-3 shadow-sm ${
                  isSelected ? "border-slate-500" : "border-slate-200"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(event) => toggleOne(item.id, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`Select media ${item.id}`}
                  />
                  <span className="text-[11px] font-semibold text-slate-500">{item.id}</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleOneByClick(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleOneByClick(item.id);
                    }
                  }}
                  className={`h-36 rounded-xl border bg-slate-100 bg-cover bg-center transition ${
                    isSelected ? "border-slate-500" : "border-slate-200"
                  } cursor-pointer hover:border-slate-400`}
                  style={{ backgroundImage: `url('${item.url}')` }}
                  aria-label={item.alt || item.id}
                />
                <div className="mt-3 space-y-1">
                  <p className="line-clamp-1 text-xs font-semibold text-slate-800">{item.alt || "No alt text"}</p>
                  <p className="line-clamp-1 text-[11px] text-slate-600">{item.description || "No description"}</p>
                  <p className="text-[11px] text-slate-500">Used in products: {item.usageCount}</p>
                  <p className="text-[11px] text-slate-500">
                    Assigned: {renderAssigned(item)}
                  </p>
                  {isTrashed ? (
                    <p className="text-[11px] font-semibold text-amber-700">In Trash</p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/media/${item.id}`}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                  <Link
                    href={item.url}
                    target="_blank"
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    View
                  </Link>
                  {!isTrashed ? (
                    <AdminMediaTrashAction
                      mediaId={item.id}
                      redirectTo="/dashboard/media"
                      buttonLabel="Trash"
                      confirmText={`Are you sure you want to move media "${item.id}" to trash?`}
                    />
                  ) : (
                    <>
                      <form action={restoreMediaAction}>
                        <input type="hidden" name="mediaId" value={item.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/media" />
                        <button
                          type="submit"
                          className="rounded-md border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200"
                        >
                          Restore
                        </button>
                      </form>
                      <form action={deleteMediaPermanentlyAction}>
                        <input type="hidden" name="mediaId" value={item.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/media" />
                        <button
                          type="submit"
                          className="rounded-md border border-rose-300 bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800 transition hover:bg-rose-200"
                        >
                          Delete
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-3 font-medium">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allChecked}
                    onChange={(event) => toggleAll(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label="Select all media"
                  />
                </th>
                <th className="pb-2 font-medium">Preview</th>
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Alt</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Used</th>
                <th className="pb-2 font-medium">Assigned</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Updated</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedMedia.map((item) => {
                const isSelected = selectedSet.has(item.id);
                const isTrashed = Boolean(item.trashedAt);
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-100 align-top ${isSelected ? "bg-slate-50" : ""}`}
                  >
                    <td className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => toggleOne(item.id, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label={`Select media ${item.id}`}
                      />
                    </td>
                    <td className="py-3">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleOneByClick(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleOneByClick(item.id);
                          }
                        }}
                        className={`h-10 w-14 rounded-md border bg-slate-100 bg-cover bg-center transition ${
                          isSelected ? "border-slate-500" : "border-slate-200"
                        } cursor-pointer hover:border-slate-400`}
                        style={{ backgroundImage: `url('${item.url}')` }}
                        aria-label={item.alt || item.id}
                      />
                    </td>
                    <td className="py-3 font-semibold">{item.id}</td>
                    <td className="py-3">{item.alt || "-"}</td>
                    <td className="py-3 text-xs text-slate-600">{item.description || "-"}</td>
                    <td className="py-3">{item.usageCount}</td>
                    <td className="py-3 text-xs text-slate-600">
                      {renderAssigned(item)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          isTrashed ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isTrashed ? "Trash" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-600">{item.updatedAt}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/media/${item.id}`}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </Link>
                        <Link
                          href={item.url}
                          target="_blank"
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {renderControls("bottom")}
    </div>
  );
}
