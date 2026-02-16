export const ADMIN_COOKIE_NAME = "bli_admin_session";
export const ADMIN_SIDEBAR_COOKIE_NAME = "bli_admin_sidebar_collapsed";
export const ADMIN_ROLE_COOKIE_NAME = "bli_admin_role";
export const ADMIN_USERNAME_COOKIE_NAME = "bli_admin_username";

const FALLBACK_ADMIN_USERNAME = "admin";
const FALLBACK_ADMIN_PASSWORD = "bli12345";
const FALLBACK_ADMIN_SESSION_VALUE = "bli-admin-authenticated";
const FALLBACK_ADMIN_ROLE = "Super Admin";

export const ADMIN_SESSION_VALUE =
  process.env.ADMIN_SESSION_VALUE ?? FALLBACK_ADMIN_SESSION_VALUE;

export type AdminRole = "Super Admin" | "Admin" | "Manager" | "Customer";

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME ?? FALLBACK_ADMIN_USERNAME;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? FALLBACK_ADMIN_PASSWORD;
}

export function getAdminRole(): AdminRole {
  return resolveAdminRole(process.env.ADMIN_ROLE ?? FALLBACK_ADMIN_ROLE);
}

export function resolveAdminRole(value: string): AdminRole {
  const role = value.trim().toLowerCase();
  if (role === "super admin" || role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  return "Customer";
}

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

export function getAdminRoleFromCookieStore(cookieStore: CookieStoreLike): AdminRole {
  const fromCookie = cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value;
  if (fromCookie) return resolveAdminRole(fromCookie);
  return getAdminRole();
}

export function getAdminUsernameFromCookieStore(cookieStore: CookieStoreLike): string {
  return cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value || getAdminUsername();
}

export function canAccessAdmin(role: AdminRole): boolean {
  return role !== "Customer";
}

export function canAccessSettings(role: AdminRole): boolean {
  return role === "Super Admin" || role === "Admin";
}

export function validateAdminCredentials(
  username: string,
  password: string,
): boolean {
  return username === getAdminUsername() && password === getAdminPassword();
}
