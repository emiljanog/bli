"use client";

import { useMemo, useState } from "react";
import { registerUserAction } from "@/app/dashboard/actions";
import { AdminUsersTable, type AdminUserRow } from "@/components/admin-users-table";
import type { UserRole } from "@/lib/shop-store";

type AdminUsersManagementProps = {
  users: AdminUserRow[];
  currentRole: UserRole;
  viewerKey: string;
  creatableRoles: UserRole[];
};

export function AdminUsersManagement({
  users,
  currentRole,
  viewerKey,
  creatableRoles,
}: AdminUsersManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");

  const roleCounts = useMemo(
    () =>
      users.reduce(
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
      ),
    [users],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold">Users</p>
        </div>

        <AdminUsersTable
          users={users}
          currentRole={currentRole}
          viewerKey={viewerKey}
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </article>

      <aside className="space-y-4 self-start lg:sticky lg:top-6">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-semibold">Search Users</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="text"
                placeholder="Search users..."
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-500"
              />
              {searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as UserRole | "All")}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-500"
            >
              <option value="All">All Users ({users.length})</option>
              <option value="Super Admin">Super Admin ({roleCounts["Super Admin"]})</option>
              <option value="Admin">Admin ({roleCounts.Admin})</option>
              <option value="Manager">Manager ({roleCounts.Manager})</option>
              <option value="Customer">Customer ({roleCounts.Customer})</option>
            </select>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-semibold">Create User</p>
          <form action={registerUserAction} className="mt-4 space-y-3">
            <input
              name="name"
              type="text"
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <input
              name="username"
              type="text"
              placeholder="Username (opsionale)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm lowercase outline-none focus:border-slate-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <input
              name="password"
              type="password"
              minLength={6}
              placeholder="Password (min 6)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <select
              name="role"
              defaultValue={creatableRoles.includes("Customer") ? "Customer" : (creatableRoles[0] ?? "Customer")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {creatableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input
              name="phone"
              type="text"
              placeholder="Phone"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input
              name="city"
              type="text"
              placeholder="City"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <textarea
              name="address"
              rows={3}
              placeholder="Address"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input type="hidden" name="redirectTo" value="/dashboard/users" />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
            >
              Save User
            </button>
          </form>
        </article>
      </aside>
    </div>
  );
}
