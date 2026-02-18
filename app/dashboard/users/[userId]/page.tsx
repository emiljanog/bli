import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ConfirmActionForm } from "@/components/confirm-action-form";
import { UploadField } from "@/components/upload-field";
import { deactivateUserAction, deleteUserAction, updateUserAction } from "@/app/dashboard/actions";
import { getAdminRoleFromCookieStore, getAdminUsernameFromCookieStore } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { canCreateUserRole, canDeleteUser, getUserById, listMedia, type UserRole } from "@/lib/shop-store";

type AdminUserEditPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  const cookieStore = await cookies();
  const { userId } = await params;
  const user = getUserById(userId);
  if (!user) {
    notFound();
  }

  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const allowDelete = canDeleteUser(currentRole, user.role);
  const isSuperAdminLocked = user.role === "Super Admin" && currentRole !== "Super Admin";
  const editableRoles = (["Super Admin", "Admin", "Manager", "Customer"] as UserRole[]).filter((role) =>
    canCreateUserRole(currentRole, role),
  );
  const roleOptions = isSuperAdminLocked ? (["Super Admin"] as UserRole[]) : editableRoles;
  const currentUsername = getAdminUsernameFromCookieStore(cookieStore);
  const mediaImages = listMedia().map((item) => ({
    id: item.id,
    url: item.url,
    label: item.alt || item.url,
    uploadedBy: item.uploadedBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <AdminShell title="Edit User" description="Full user edit panel with role and credentials.">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <form action={updateUserAction} className="rounded-2xl border border-slate-200 bg-white p-5">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="redirectTo" value={`/dashboard/users/${user.id}`} />

          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold">User Details</p>
            <Link
              href="/dashboard/users"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to Users
            </Link>
          </div>

          {isSuperAdminLocked ? (
            <p className="mb-4 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
              Super Admin fields are locked for your role.
            </p>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </label>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Surname
              </label>
              <input
                name="surname"
                type="text"
                defaultValue={user.surname}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Username
              </label>
              <input
                name="username"
                type="text"
                defaultValue={user.username}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm lowercase outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </label>
              <select
                name="role"
                defaultValue={user.role}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue={user.email}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avatar URL
              </label>
              <input
                name="avatarUrl"
                type="url"
                defaultValue={user.avatarUrl}
                disabled={isSuperAdminLocked}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avatar Upload
              </span>
              <UploadField
                title="Upload Avatar"
                mediaItems={mediaImages}
                fileInputName="avatarFile"
                valueInputName="avatarSourceUrl"
                defaultValue={user.avatarUrl}
                triggerLabel="Upload avatar"
                currentUsername={currentUsername}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                name="password"
                type="password"
                minLength={6}
                placeholder="Leave empty to keep current password"
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </label>
              <input
                name="phone"
                type="text"
                defaultValue={user.phone}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                City
              </label>
              <input
                name="city"
                type="text"
                defaultValue={user.city}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Address
              </label>
              <textarea
                name="address"
                rows={3}
                defaultValue={user.address}
                disabled={isSuperAdminLocked}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSuperAdminLocked}
            className="mt-4 rounded-xl bg-[#2ea2cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Update User
          </button>
        </form>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">User ID</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{user.id}</p>
            <p className="mt-3 text-sm text-slate-600">Created: {user.createdAt}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Danger Zone</p>
            <div className="mt-3 space-y-3">
              {allowDelete && user.isActive ? (
                <ConfirmActionForm
                  action={deactivateUserAction}
                  hiddenFields={[
                    { name: "userId", value: user.id },
                    { name: "redirectTo", value: `/dashboard/users/${user.id}` },
                  ]}
                  confirmMessage="Are you sure you want to set this user inactive?"
                  buttonLabel="Set Inactive"
                  confirmLabel="Yes Inactive"
                  buttonClassName="w-full rounded-xl border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
                  confirmButtonClassName="inline-flex h-9 w-[120px] items-center justify-center rounded-xl border border-amber-400 bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                  cancelButtonClassName="inline-flex h-9 w-[120px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                />
              ) : null}

              {allowDelete && !user.isActive ? (
                <p className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  This user is already inactive.
                </p>
              ) : null}

              {allowDelete ? (
                <ConfirmActionForm
                  action={deleteUserAction}
                  hiddenFields={[
                    { name: "userId", value: user.id },
                    { name: "redirectTo", value: "/dashboard/users" },
                  ]}
                  confirmMessage="Are you sure you want to delete this user?"
                  buttonLabel="Delete User"
                  confirmLabel="Yes Delete"
                  buttonClassName="w-full rounded-xl border border-rose-300 bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                  confirmButtonClassName="inline-flex h-9 w-[120px] items-center justify-center rounded-xl border border-rose-400 bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  cancelButtonClassName="inline-flex h-9 w-[120px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                />
              ) : isSuperAdminLocked ? (
                <p className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  Super Admin actions are locked for your role.
                </p>
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  Ky user nuk mund te fshihet me rolin aktual.
                </p>
              )}
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
