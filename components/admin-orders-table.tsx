"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { bulkOrderAction, updateOrderStatusAction } from "@/app/dashboard/actions";
import type { OrderStatus } from "@/lib/shop-store";

export type AdminOrderRow = {
  id: string;
  customer: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  discount: number;
  couponCode: string | null;
  status: OrderStatus;
  createdAt: string;
};

type AdminOrdersTableProps = {
  orders: AdminOrderRow[];
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

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("Pending");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const statusCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] += 1;
        return acc;
      },
      {
        Pending: 0,
        Paid: 0,
        Shipped: 0,
        Cancelled: 0,
      } satisfies Record<OrderStatus, number>,
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "All" && order.status !== statusFilter) return false;
      if (!query) return true;

      return (
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.productName.toLowerCase().includes(query) ||
        order.productId.toLowerCase().includes(query) ||
        (order.couponCode ?? "").toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, pageSize, safePage]);

  const pagedOrderIds = useMemo(() => pagedOrders.map((order) => order.id), [pagedOrders]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allChecked = pagedOrders.length > 0 && pagedOrders.every((order) => selectedSet.has(order.id));
  const partiallyChecked = pagedOrders.some((order) => selectedSet.has(order.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = partiallyChecked;
    }
  }, [partiallyChecked]);

  function toggleAll(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const orderId of pagedOrderIds) {
        if (checked) {
          next.add(orderId);
        } else {
          next.delete(orderId);
        }
      }
      return Array.from(next);
    });
  }

  function toggleOne(orderId: string, checked: boolean) {
    setSelectedIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, orderId]));
      }
      return previous.filter((id) => id !== orderId);
    });
  }

  const showingText =
    filteredOrders.length === 0
      ? "No orders found"
      : `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filteredOrders.length)} of ${filteredOrders.length}`;

  function renderControls(position: "top" | "bottom") {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 ${
          position === "top" ? "mb-3" : "mt-4"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold text-slate-600">{showingText}</p>
          <span className="text-xs font-semibold text-slate-500">Selected: {selectedIds.length}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={bulkOrderAction} className="inline-flex items-center gap-2">
            <input type="hidden" name="selectedOrderIds" value={selectedIds.join(",")} />
            <input type="hidden" name="redirectTo" value="/dashboard/orders" />
            <select
              name="status"
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as OrderStatus)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
            >
              <option value="Pending">Set Pending</option>
              <option value="Paid">Set Paid</option>
              <option value="Shipped">Set Shipped</option>
              <option value="Cancelled">Set Cancelled</option>
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
            setStatusFilter("All");
            setCurrentPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            statusFilter === "All"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          All Orders: {orders.length}
        </button>
        {(["Pending", "Paid", "Shipped", "Cancelled"] as OrderStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              statusFilter === status
                ? "site-primary-border site-primary-bg text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {status}: {statusCounts[status]}
          </button>
        ))}
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
            placeholder="Search orders..."
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
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2 pr-3 font-medium">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={(event) => toggleAll(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                  aria-label="Select all orders"
                />
              </th>
              <th className="pb-2 font-medium">Order</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Discount</th>
              <th className="pb-2 font-medium">Coupon</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((order) => {
              const isSelected = selectedSet.has(order.id);
              return (
                <tr
                  key={order.id}
                  className={`border-b border-slate-100 align-top ${isSelected ? "bg-slate-50" : ""}`}
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleOne(order.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`Select order ${order.id}`}
                    />
                  </td>
                  <td className="py-3 font-semibold">
                    <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-3 text-xs text-slate-600">{order.createdAt}</td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">
                    <div>{order.productName}</div>
                    <div className="text-xs text-slate-500">{order.productId}</div>
                  </td>
                  <td className="py-3">{order.quantity}</td>
                  <td className="py-3">{formatCurrency(order.total)}</td>
                  <td className="py-3">{order.discount > 0 ? formatCurrency(order.discount) : "-"}</td>
                  <td className="py-3">{order.couponCode ?? "-"}</td>
                  <td className="py-3">
                    <form action={updateOrderStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Shipped</option>
                        <option>Cancelled</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
                      >
                        Update
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit
                    </Link>
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
