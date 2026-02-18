"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  bulkProductAction,
  deleteProductPermanentlyAction,
  restoreProductAction,
  setProductPublishStatusAction,
  trashProductAction,
} from "@/app/dashboard/actions";
import type { PublicationStatus } from "@/lib/shop-store";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  price: number;
  stock: number;
  reviews: number;
  publishStatus: PublicationStatus;
  trashedAt: string | null;
};

type AdminProductsTableProps = {
  products: AdminProductRow[];
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ALLOWED_PAGE_SIZES = new Set([15, 30, 50, 100]);

function safePageSize(value: unknown): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && ALLOWED_PAGE_SIZES.has(parsed)) {
    return parsed;
  }
  return 15;
}

type ProductFilter = "all" | "published" | "draft" | "trash";
type ProductBulkAction = "publish" | "draft" | "trash" | "restore" | "delete_permanently";

export function AdminProductsTable({ products }: AdminProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<ProductBulkAction>("publish");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const tags = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.tags))).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const counts = useMemo(() => {
    const published = products.filter(
      (product) => !product.trashedAt && product.publishStatus === "Published",
    ).length;
    const draft = products.filter((product) => !product.trashedAt && product.publishStatus === "Draft").length;
    const trash = products.filter((product) => Boolean(product.trashedAt)).length;
    return { published, draft, trash };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const isTrashed = Boolean(product.trashedAt);
      if (statusFilter === "published" && (isTrashed || product.publishStatus !== "Published")) return false;
      if (statusFilter === "draft" && (isTrashed || product.publishStatus !== "Draft")) return false;
      if (statusFilter === "trash" && !isTrashed) return false;
      if (categoryFilter !== "All" && product.category !== categoryFilter) return false;
      if (tagFilter !== "All" && !product.tags.includes(tagFilter)) return false;
      if (!query) return true;

      return (
        product.id.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tags.join(", ").toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery, statusFilter, categoryFilter, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, pageSize, safePage]);

  const pagedProductIds = useMemo(() => pagedProducts.map((product) => product.id), [pagedProducts]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allChecked = pagedProducts.length > 0 && pagedProducts.every((product) => selectedSet.has(product.id));
  const partiallyChecked = pagedProducts.some((product) => selectedSet.has(product.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = partiallyChecked;
    }
  }, [partiallyChecked]);

  function toggleAll(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const productId of pagedProductIds) {
        if (checked) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
      }
      return Array.from(next);
    });
  }

  function toggleOne(productId: string, checked: boolean) {
    setSelectedIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, productId]));
      }
      return previous.filter((id) => id !== productId);
    });
  }

  const showingText =
    filteredProducts.length === 0
      ? "No products found"
      : `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filteredProducts.length)} of ${filteredProducts.length}`;

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
          <form action={bulkProductAction} className="inline-flex items-center gap-2">
            <input type="hidden" name="selectedProductIds" value={selectedIds.join(",")} />
            <input type="hidden" name="redirectTo" value="/dashboard/products" />
            <select
              name="bulkAction"
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value as ProductBulkAction)}
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
            setStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            statusFilter === "all"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All Products: {products.length}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("published");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            statusFilter === "published"
              ? "site-primary-border site-primary-bg text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Published: {counts.published}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("draft");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            statusFilter === "draft"
              ? "site-primary-border site-primary-bg text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Drafts: {counts.draft}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("trash");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            statusFilter === "trash"
              ? "site-primary-border site-primary-bg text-white"
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
            placeholder="Search products..."
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
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={(event) => {
              setTagFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
          >
            <option value="All">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
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
                  aria-label="Select all products"
                />
              </th>
              <th className="pb-2 font-medium">ID</th>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">URL</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Tags</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Stock</th>
              <th className="pb-2 font-medium">Reviews</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((product) => {
              const isSelected = selectedSet.has(product.id);
              const isTrashed = Boolean(product.trashedAt);
              const statusLabel = isTrashed ? "Trash" : product.publishStatus;
              return (
                <tr
                  key={product.id}
                  className={`border-b border-slate-100 align-top ${isSelected ? "bg-slate-50" : ""}`}
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleOne(product.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`Select product ${product.name}`}
                    />
                  </td>
                  <td className="py-3 font-semibold">
                    <Link href={`/dashboard/products/${product.id}`} className="hover:underline">
                      {product.id}
                    </Link>
                  </td>
                  <td className="py-3">{product.name}</td>
                  <td className="py-3 text-xs text-slate-600">/product/{product.slug}</td>
                  <td className="py-3">{product.category}</td>
                  <td className="py-3 text-xs text-slate-600">
                    {product.tags.length > 0 ? product.tags.join(", ") : "-"}
                  </td>
                  <td className="py-3">{formatCurrency(product.price)}</td>
                  <td className="py-3">{product.stock}</td>
                  <td className="py-3">{product.reviews}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        isTrashed
                          ? "bg-amber-100 text-amber-700"
                          : product.publishStatus === "Draft"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      {!isTrashed ? (
                        <>
                          <form action={setProductPublishStatusAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="redirectTo" value="/dashboard/products" />
                            <input
                              type="hidden"
                              name="publishStatus"
                              value={product.publishStatus === "Published" ? "Draft" : "Published"}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              {product.publishStatus === "Published" ? "Set Draft" : "Publish"}
                            </button>
                          </form>
                          <form action={trashProductAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="redirectTo" value="/dashboard/products" />
                            <button
                              type="submit"
                              className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                            >
                              Move to Trash
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <form action={restoreProductAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="redirectTo" value="/dashboard/products" />
                            <button
                              type="submit"
                              className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200"
                            >
                              Restore
                            </button>
                          </form>
                          <form action={deleteProductPermanentlyAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="redirectTo" value="/dashboard/products" />
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
