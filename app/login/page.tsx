import { AuthAccessPanel } from "@/components/auth-access-panel";
import { ADMIN_COOKIE_NAME, ADMIN_ROLE_COOKIE_NAME, ADMIN_SESSION_VALUE, resolveAdminRole } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{ tab?: string; next?: string }>;
};

function asTab(value: string | undefined): "login" | "register" {
  const safe = (value || "").trim().toLowerCase();
  if (safe === "register") return "register";
  return "login";
}

function asNextPath(value: string | undefined): string {
  const safe = (value || "").trim();
  if (!safe.startsWith("/") || safe.startsWith("//")) return "/my-account";
  return safe;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const role = resolveAdminRole(cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  const params = (await searchParams) ?? {};

  if (isLoggedIn) {
    redirect(role === "Customer" ? "/my-account" : "/dashboard");
  }

  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <AuthAccessPanel initialTab={asTab(params.tab)} nextPath={asNextPath(params.next)} />
      </section>
    </main>
  );
}

