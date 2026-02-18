import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin-shell";
import { AdminUsersManagement } from "@/components/admin-users-management";
import { getAdminRoleFromCookieStore, getAdminUsernameFromCookieStore } from "@/lib/admin-auth";
import { canCreateUserRole, listUsers, type UserRole } from "@/lib/shop-store";

type AdminUsersPageProps = {
  searchParams: Promise<{ role?: string }>;
};

function normalizeUsersRoleFilter(value: string | undefined): UserRole | "All" {
  const safe = (value || "").trim().toLowerCase();
  if (safe === "super admin" || safe === "superadmin") return "Super Admin";
  if (safe === "admin" || safe === "admins") return "Admin";
  if (safe === "manager") return "Manager";
  if (safe === "customer" || safe === "customers") return "Customer";
  return "All";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const users = listUsers();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const currentUsername = getAdminUsernameFromCookieStore(cookieStore);
  const initialRoleFilter = normalizeUsersRoleFilter(params.role);
  const creatableRoles = (["Super Admin", "Admin", "Manager", "Customer"] as UserRole[]).filter((role) =>
    canCreateUserRole(currentRole, role),
  );

  const usersForTable = users.map((user) => ({
    id: user.id,
    name: `${user.name} ${user.surname}`.trim(),
    username: user.username,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    createdAt: user.createdAt,
    isActive: user.isActive,
    passwordResetRequired: user.passwordResetRequired,
  }));

  return (
    <AdminShell title="Users" description="Manage registered users, roles, and account data.">
      <AdminUsersManagement
        users={usersForTable}
        currentRole={currentRole}
        viewerKey={currentUsername}
        creatableRoles={creatableRoles}
        initialRoleFilter={initialRoleFilter}
      />
    </AdminShell>
  );
}
