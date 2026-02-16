import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { canAccessSettings, getAdminRoleFromCookieStore } from "@/lib/admin-auth";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const role = getAdminRoleFromCookieStore(cookieStore);
  if (!canAccessSettings(role)) {
    redirect("/dashboard");
  }

  redirect("/dashboard/settings/general");
}
