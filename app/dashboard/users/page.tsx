import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin-shell";
import { AdminUsersManagement } from "@/components/admin-users-management";
import { getAdminRoleFromCookieStore, getAdminUsernameFromCookieStore } from "@/lib/admin-auth";
import { canCreateUserRole, listUsers, type UserRole } from "@/lib/shop-store";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const users = listUsers();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const currentUsername = getAdminUsernameFromCookieStore(cookieStore);
  const creatableRoles = (["Super Admin", "Admin", "Manager", "Customer"] as UserRole[]).filter((role) =>
    canCreateUserRole(currentRole, role),
  );

  const usersForTable = users.map((user) => ({
    id: user.id,
    name: user.name,
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
      />
    </AdminShell>
  );
}

