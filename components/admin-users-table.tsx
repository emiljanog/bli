"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { bulkUserAction, deleteUserAction } from "@/app/admin/actions";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import type { UserRole } from "@/lib/shop-store";

export type AdminUserRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  phone: string;
  city: string;
  createdAt: string;
  isActive: boolean;
  passwordResetRequired: boolean;
};

type AdminUsersTableProps = {
  users: AdminUserRow[];
  currentRole: UserRole;
  viewerKey: string;
  searchQuery?: string;
  roleFilter?: UserRole | "All";
  onRoleFilterChange?: (value: UserRole | "All") => void;
};

const ALLOWED_PAGE_SIZES = new Set([15, 30, 50, 100]);

function normalizeRole(value: unknown): UserRole {
  const role = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (role === "super admin" || role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  return "Customer";
}

function canDeleteUser(actorRole: UserRole, targetRole: UserRole): boolean {
  const normalizedActor = normalizeRole(actorRole);
  const normalizedTarget = normalizeRole(targetRole);

  if (normalizedActor === "Customer") return false;
  if (normalizedActor === "Super Admin") return true;
  if (normalizedTarget === "Super Admin") return false;
  return normalizedActor === "Admin" || normalizedActor === "Manager";
}

function safePageSize(value: unknown): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && ALLOWED_PAGE_SIZES.has(parsed)) {
    return parsed;
  }
  return 15;
}

export function AdminUsersTable({
  users,
  currentRole,
  viewerKey,
  searchQuery,
  roleFilter,
  onRoleFilterChange,
}: AdminUsersTableProps) {
  const pageSizeStorageKey = `bli-admin-users-page-size:${viewerKey}`;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === "undefined") return 15;
    return safePageSize(window.localStorage.getItem(pageSizeStorageKey));
  });
  const [internalRoleFilter, setInternalRoleFilter] = useState<UserRole | "All">("All");
  const [showInactiveUsers, setShowInactiveUsers] = useState(true);
  const [bulkAction, setBulkAction] = useState<"send_password_reset" | "delete" | "deactivate">(
    "send_password_reset",
  );
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const effectiveSearchQuery = searchQuery ?? "";
  const effectiveRoleFilter = roleFilter ?? internalRoleFilter;
  const setRoleFilter = onRoleFilterChange ?? setInternalRoleFilter;
  const activeUsersCount = useMemo(() => users.filter((user) => user.isActive).length, [users]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc[user.role] += 1;
        return acc;
      },
      {
        "Super Admin": 0,
        Admin: 0,
        Manager: 0,
        Customer: 0,
      } satisfies Record<UserRole, number>,
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = effectiveSearchQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (!showInactiveUsers && !user.isActive) {
        return false;
      }

      if (effectiveRoleFilter !== "All" && user.role !== effectiveRoleFilter) {
        return false;
      }

      if (!query) return true;

      return (
        user.id.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.city.toLowerCase().includes(query)
      );
    });
  }, [users, effectiveRoleFilter, effectiveSearchQuery, showInactiveUsers]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, pageSize, safePage]);

  const pagedUserIds = useMemo(() => pagedUsers.map((user) => user.id), [pagedUsers]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allChecked =
    pagedUsers.length > 0 && pagedUsers.every((user) => selectedSet.has(user.id));
  const partiallyChecked =
    pagedUsers.some((user) => selectedSet.has(user.id)) && !allChecked;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = partiallyChecked;
    }
  }, [partiallyChecked]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(pageSizeStorageKey, String(pageSize));
  }, [pageSize, pageSizeStorageKey]);

  function toggleAll(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const userId of pagedUserIds) {
        if (checked) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
      }
      return Array.from(next);
    });
  }

  function toggleOne(userId: string, checked: boolean) {
    setSelectedIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, userId]));
      }
      return previous.filter((id) => id !== userId);
    });
  }

  const showingText =
    filteredUsers.length === 0
      ? "No users found"
      : `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filteredUsers.length)} of ${filteredUsers.length}`;

  function renderListControls(position: "top" | "bottom") {
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
          <form action={bulkUserAction} className="inline-flex items-center gap-2">
            <input type="hidden" name="selectedUserIds" value={selectedIds.join(",")} />
            <input type="hidden" name="redirectTo" value="/dashboard/users" />
            <select
              name="bulkAction"
              value={bulkAction}
              onChange={(event) =>
                setBulkAction(event.target.value as "send_password_reset" | "delete" | "deactivate")
              }
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700"
            >
              <option value="send_password_reset">Send password reset</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Roles
          </span>
          <button
            type="button"
            onClick={() => {
              setRoleFilter("All");
              setCurrentPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              effectiveRoleFilter === "All"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All Users: {users.length}
          </button>
          {(["Super Admin", "Admin", "Manager", "Customer"] as UserRole[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setRoleFilter(role);
                setCurrentPage(1);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                effectiveRoleFilter === role
                  ? "border-[#ff8a00] bg-[#ff8a00] text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
              title={`Filter by ${role}`}
            >
              {role}: {roleCounts[role]}
            </button>
          ))}
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          Active Users: {activeUsersCount}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-end">
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={showInactiveUsers}
            onChange={(event) => {
              setShowInactiveUsers(event.target.checked);
              setCurrentPage(1);
            }}
            className="h-4 w-4 rounded border-slate-300"
          />
          Show also inactive user
        </label>
      </div>

      {renderListControls("top")}

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
                  aria-label="Select all users"
                />
              </th>
              <th className="pb-2 font-medium">ID</th>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Username</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Phone</th>
              <th className="pb-2 font-medium">City</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Created</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((user) => {
              const allowDelete = canDeleteUser(currentRole, user.role);
              const isSelected = selectedSet.has(user.id);

              return (
                <tr
                  key={user.id}
                  className={`border-b border-slate-100 align-top ${isSelected ? "bg-slate-50" : ""}`}
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => toggleOne(user.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`Select user ${user.name}`}
                    />
                  </td>
                  <td className="py-3 font-semibold">
                    <Link href={`/dashboard/users/${user.id}`} className="hover:underline">
                      {user.id}
                    </Link>
                  </td>
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">@{user.username}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.phone || "-"}</td>
                  <td className="py-3">{user.city || "-"}</td>
                  <td className="py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                      {user.passwordResetRequired ? (
                        <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Reset Pending
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3">{user.createdAt}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </Link>
                      {allowDelete ? (
                        <ConfirmActionForm
                          action={deleteUserAction}
                          hiddenFields={[
                            { name: "userId", value: user.id },
                            { name: "redirectTo", value: "/dashboard/users" },
                          ]}
                          confirmMessage="Are you sure you want to delete this user?"
                          buttonLabel="Delete"
                          confirmLabel="Yes Delete"
                          buttonClassName="inline-flex h-8 w-[96px] items-center justify-center rounded-lg border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                          confirmButtonClassName="inline-flex h-8 w-[96px] items-center justify-center rounded-lg border border-rose-400 bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                          cancelButtonClassName="inline-flex h-8 w-[96px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        />
                      ) : (
                        <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                          Protected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renderListControls("bottom")}
    </div>
  );
}
