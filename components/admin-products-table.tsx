"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  bulkProductAction,
  deleteProductPermanentlyAction,
  restoreProductAction,
  setProductPublishStatusAction,
  trashProductAction,
  updateProductPricingInlineAction,
  updateProductStockInlineAction,
} from "@/app/dashboard/actions";
import type { PublicationStatus } from "@/lib/shop-store";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  price: number;
  salePrice: number | null;
  stock: number;
  reviews: number;
  publishStatus: PublicationStatus;
  trashedAt: string | null;
};

type AdminProductsTableProps = {
  products: AdminProductRow[];
  trashNotice?: {
    productId: string;
    undoUntil: number;
    message: string;
  };
  summary?: {
    publishedCount: number;
    draftCount: number;
    trashedCount: number;
  };
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

export function AdminProductsTable({ products, trashNotice, summary }: AdminProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<ProductBulkAction>("publish");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [stockInput, setStockInput] = useState("");
  const [showTrashNotice, setShowTrashNotice] = useState(false);
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
    if (summary) {
      return {
        published: summary.publishedCount,
        draft: summary.draftCount,
        trash: summary.trashedCount,
      };
    }
    const published = products.filter(
      (product) => !product.trashedAt && product.publishStatus === "Published",
    ).length;
    const draft = products.filter((product) => !product.trashedAt && product.publishStatus === "Draft").length;
    const trash = products.filter((product) => Boolean(product.trashedAt)).length;
    return { published, draft, trash };
  }, [products, summary]);

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

  useEffect(() => {
    const syncTimer = setTimeout(() => {
      setShowTrashNotice(Boolean(trashNotice));
    }, 0);

    if (!trashNotice) {
      return () => clearTimeout(syncTimer);
    }

    const remainingMs = trashNotice.undoUntil - Date.now();
    if (remainingMs <= 0) {
      const hideNowTimer = setTimeout(() => setShowTrashNotice(false), 0);
      return () => {
        clearTimeout(syncTimer);
        clearTimeout(hideNowTimer);
      };
    }

    const hideTimer = setTimeout(() => {
      setShowTrashNotice(false);
    }, remainingMs);
    return () => {
      clearTimeout(syncTimer);
      clearTimeout(hideTimer);
    };
  }, [trashNotice?.productId, trashNotice?.undoUntil]);

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
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`font-semibold transition ${
            statusFilter === "all"
              ? "text-slate-900"
              : "text-[#2271b1] hover:text-[#1a5a8f]"
          }`}
        >
          All ({products.length})
        </button>
        <span className="text-slate-400">|</span>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("published");
            setCurrentPage(1);
          }}
          className={`font-semibold transition ${
            statusFilter === "published"
              ? "text-slate-900"
              : "text-[#2271b1] hover:text-[#1a5a8f]"
          }`}
        >
          Published ({counts.published})
        </button>
        <span className="text-slate-400">|</span>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("draft");
            setCurrentPage(1);
          }}
          className={`font-semibold transition ${
            statusFilter === "draft"
              ? "text-slate-900"
              : "text-[#2271b1] hover:text-[#1a5a8f]"
          }`}
        >
          Draft ({counts.draft})
        </button>
        <span className="text-slate-400">|</span>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("trash");
            setCurrentPage(1);
          }}
          className={`font-semibold transition ${
            statusFilter === "trash"
              ? "text-slate-900"
              : "text-[#2271b1] hover:text-[#1a5a8f]"
          }`}
        >
          Trash ({counts.trash})
        </button>
        <span className="text-slate-400">|</span>
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          className="font-semibold text-[#2271b1] transition hover:text-[#1a5a8f]"
        >
          Sorting
        </button>
        </div>

        {showTrashNotice && trashNotice ? (
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
            <span>{trashNotice.message}</span>
            <form action={restoreProductAction}>
              <input type="hidden" name="productId" value={trashNotice.productId} />
              <input type="hidden" name="redirectTo" value="/dashboard/products" />
              <button
                type="submit"
                className="cursor-pointer text-sm font-semibold text-slate-900 underline underline-offset-2 transition hover:text-slate-700"
              >
                Undo
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-300 bg-[#f3f3f3] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <form action={bulkProductAction} className="inline-flex items-center gap-2">
              <input type="hidden" name="selectedProductIds" value={selectedIds.join(",")} />
              <input type="hidden" name="redirectTo" value="/dashboard/products" />
              <select
                name="bulkAction"
                value={bulkAction}
                onChange={(event) => setBulkAction(event.target.value as ProductBulkAction)}
                className="h-10 min-w-[130px] rounded-md border border-slate-400 bg-white px-2 text-sm text-slate-800"
              >
                <option value="publish">Bulk actions</option>
                <option value="draft">Set Draft</option>
                <option value="trash">Move to Trash</option>
                <option value="restore">Restore</option>
                <option value="delete_permanently">Delete Permanently</option>
              </select>
              <button
                type="submit"
                disabled={selectedIds.length === 0}
                className="h-10 rounded-md border border-[#2271b1] bg-white px-4 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply
              </button>
            </form>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-[220px] rounded-md border border-slate-400 bg-white px-2 text-sm text-slate-800"
            >
              <option value="All">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ProductFilter);
                setCurrentPage(1);
              }}
              className="h-10 min-w-[190px] rounded-md border border-slate-400 bg-white px-2 text-sm text-slate-800"
            >
              <option value="all">Filter by stock status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="trash">Trash</option>
            </select>

            <select
              value={tagFilter}
              onChange={(event) => {
                setTagFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-[170px] rounded-md border border-slate-400 bg-white px-2 text-sm text-slate-800"
            >
              <option value="All">Filter by brand</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="h-10 rounded-md border border-[#2271b1] bg-white px-4 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
            >
              Filter
            </button>
          </div>

          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              type="text"
              placeholder="Search products"
              className="h-10 w-64 rounded-md border border-slate-400 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#2271b1]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-3">
          <span>Selected: {selectedIds.length}</span>
          <label className="inline-flex items-center gap-2">
            Per page
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(safePageSize(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-slate-400 bg-white px-2 py-1 text-xs text-slate-800"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          </label>
          <span>{showingText}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">{filteredProducts.length} items</span>
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={!canPrev}
            className="h-8 w-8 rounded border border-slate-400 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={!canPrev}
            className="h-8 w-8 rounded border border-slate-400 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="inline-flex h-8 min-w-[86px] items-center justify-center rounded border border-slate-400 bg-white px-2 text-sm text-slate-800">
            {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={!canNext}
            className="h-8 w-8 rounded border border-[#2271b1] bg-white text-sm text-[#2271b1] transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={!canNext}
            className="h-8 w-8 rounded border border-[#2271b1] bg-white text-sm text-[#2271b1] transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-300 bg-white text-left text-sm">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-50 text-slate-600">
              <th className="px-3 py-2 pr-3 font-medium">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={(event) => toggleAll(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                  aria-label="Select all products"
                />
              </th>
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">URL</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Tags</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Reviews</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
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
                  className={`border-b border-slate-200 align-top ${isSelected ? "bg-slate-50" : ""}`}
                >
                  <td className="px-3 py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleOne(product.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`Select product ${product.name}`}
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    <Link href={`/dashboard/products/${product.id}`} className="hover:underline">
                      {product.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{product.name}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">/product/{product.slug}</td>
                  <td className="px-3 py-3">{product.category}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {product.tags.length > 0 ? product.tags.join(", ") : "-"}
                  </td>
                  <td className="px-3 py-3">
                    {editingPriceId === product.id ? (
                      <form action={updateProductPricingInlineAction} className="space-y-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/products" />
                        <input
                          name="price"
                          type="number"
                          min="0"
                          value={priceInput}
                          onChange={(event) => setPriceInput(event.target.value)}
                          className="h-8 w-24 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-[#2271b1]"
                        />
                        <input
                          name="salePrice"
                          type="number"
                          min="0"
                          value={salePriceInput}
                          onChange={(event) => setSalePriceInput(event.target.value)}
                          placeholder="sale"
                          className="h-8 w-24 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-[#2271b1]"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="submit"
                            className="rounded border border-[#2271b1] bg-white px-2 py-1 text-[11px] font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPriceId(null)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</p>
                        {product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? (
                          <p className="text-xs font-semibold text-emerald-700">Sale: {formatCurrency(product.salePrice)}</p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(product.id);
                            setPriceInput(String(product.price));
                            setSalePriceInput(product.salePrice ? String(product.salePrice) : "");
                          }}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {editingStockId === product.id ? (
                      <form action={updateProductStockInlineAction} className="space-y-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/products" />
                        <input
                          name="stock"
                          type="number"
                          min="0"
                          value={stockInput}
                          onChange={(event) => setStockInput(event.target.value)}
                          className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-[#2271b1]"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="submit"
                            className="rounded border border-[#2271b1] bg-white px-2 py-1 text-[11px] font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStockId(null)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{product.stock}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStockId(product.id);
                            setStockInput(String(product.stock));
                          }}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">{product.reviews}</td>
                  <td className="px-3 py-3">
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
                  <td className="px-3 py-3">
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
            {pagedProducts.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-500">
                  No products match the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
