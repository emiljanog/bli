"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  bulkPageAction,
  deletePageAction,
  restorePageAction,
  trashPageAction,
} from "@/app/dashboard/actions";
import type { PublicationStatus } from "@/lib/shop-store";

export type AdminPageRow = {
  id: string;
  name: string;
  slug: string;
  content: string;
  updatedAt: string;
  publishStatus: PublicationStatus;
  trashedAt: string | null;
};

type AdminPagesTableProps = {
  pages: AdminPageRow[];
};

const ALLOWED_PAGE_SIZES = new Set([15, 30, 50, 100]);

function safePageSize(value: unknown): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && ALLOWED_PAGE_SIZES.has(parsed)) {
    return parsed;
  }
  return 15;
}

type PageFilter = "all" | "published" | "draft" | "trash";
type BulkAction = "publish" | "draft" | "trash" | "restore" | "delete_permanently";

export function AdminPagesTable({ pages }: AdminPagesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageFilter, setPageFilter] = useState<PageFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>("publish");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    const published = pages.filter((page) => !page.trashedAt && page.publishStatus === "Published").length;
    const draft = pages.filter((page) => !page.trashedAt && page.publishStatus === "Draft").length;
    const trash = pages.filter((page) => Boolean(page.trashedAt)).length;
    return { published, draft, trash };
  }, [pages]);

  const filteredPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return pages.filter((page) => {
      if (pageFilter === "published" && (page.trashedAt || page.publishStatus !== "Published")) return false;
      if (pageFilter === "draft" && (page.trashedAt || page.publishStatus !== "Draft")) return false;
      if (pageFilter === "trash" && !page.trashedAt) return false;
      if (!query) return true;

      return (
        page.id.toLowerCase().includes(query) ||
        page.name.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query) ||
        page.content.toLowerCase().includes(query)
      );
    });
  }, [pages, pageFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPages = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, safePage, pageSize]);

  const pagedPageIds = useMemo(() => pagedPages.map((page) => page.id), [pagedPages]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allChecked = pagedPages.length > 0 && pagedPages.every((page) => selectedSet.has(page.id));
  const partiallyChecked = pagedPages.some((page) => selectedSet.has(page.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = partiallyChecked;
    }
  }, [partiallyChecked]);

  function toggleAll(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const pageId of pagedPageIds) {
        if (checked) {
          next.add(pageId);
        } else {
          next.delete(pageId);
        }
      }
      return Array.from(next);
    });
  }

  function toggleOne(pageId: string, checked: boolean) {
    setSelectedIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, pageId]));
      }
      return previous.filter((id) => id !== pageId);
    });
  }

  const showingText =
    filteredPages.length === 0
      ? "No pages found"
      : `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filteredPages.length)} of ${filteredPages.length}`;

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
          <form action={bulkPageAction} className="inline-flex items-center gap-2">
            <input type="hidden" name="selectedPageIds" value={selectedIds.join(",")} />
            <input type="hidden" name="redirectTo" value="/dashboard/pages" />
            <select
              name="bulkAction"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value as BulkAction)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
            >
              <option value="publish">Publish</option>
              <option value="draft">Set Draft</option>
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
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setPageFilter("all");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            pageFilter === "all"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All: {pages.length}
        </button>
        <button
          type="button"
          onClick={() => {
            setPageFilter("published");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            pageFilter === "published"
              ? "border-[#ff8a00] bg-[#ff8a00] text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Published: {counts.published}
        </button>
        <button
          type="button"
          onClick={() => {
            setPageFilter("draft");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            pageFilter === "draft"
              ? "border-[#ff8a00] bg-[#ff8a00] text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Drafts: {counts.draft}
        </button>
        <button
          type="button"
          onClick={() => {
            setPageFilter("trash");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            pageFilter === "trash"
              ? "border-[#ff8a00] bg-[#ff8a00] text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Trash: {counts.trash}
        </button>
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
            placeholder="Search pages..."
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
                  aria-label="Select all pages"
                />
              </th>
              <th className="pb-2 font-medium">ID</th>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">URL</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Updated</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedPages.map((page) => {
              const isSelected = selectedSet.has(page.id);
              const isTrashed = Boolean(page.trashedAt);
              const statusLabel = isTrashed ? "Trash" : page.publishStatus;
              return (
                <tr
                  key={page.id}
                  className={`border-b border-slate-100 align-top ${isSelected ? "bg-slate-50" : ""}`}
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleOne(page.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`Select page ${page.name}`}
                    />
                  </td>
                  <td className="py-3 font-semibold">
                    <Link href={`/dashboard/pages/${page.id}`} className="hover:underline">
                      {page.id}
                    </Link>
                  </td>
                  <td className="py-3">{page.name}</td>
                  <td className="py-3 text-xs text-slate-600">/{page.slug}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        isTrashed
                          ? "bg-amber-100 text-amber-700"
                          : page.publishStatus === "Draft"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-slate-600">{page.updatedAt}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/pages/${page.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        View
                      </Link>
                      {!isTrashed ? (
                        <form action={trashPageAction}>
                          <input type="hidden" name="pageId" value={page.id} />
                          <input type="hidden" name="redirectTo" value="/dashboard/pages" />
                          <button
                            type="submit"
                            className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                          >
                            Move to Trash
                          </button>
                        </form>
                      ) : (
                        <>
                          <form action={restorePageAction}>
                            <input type="hidden" name="pageId" value={page.id} />
                            <input type="hidden" name="redirectTo" value="/dashboard/pages" />
                            <button
                              type="submit"
                              className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200"
                            >
                              Restore
                            </button>
                          </form>
                          <form action={deletePageAction}>
                            <input type="hidden" name="pageId" value={page.id} />
                            <input type="hidden" name="redirectTo" value="/dashboard/pages" />
                            <button
                              type="submit"
                              className="rounded-lg border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-200"
                            >
                              Delete Permanently
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renderControls("bottom")}
    </div>
  );
}
