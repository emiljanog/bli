import { AdminLoginForm } from "@/components/admin-login-form";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_VALUE } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/shop-store";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const siteSettings = getSiteSettings();
  const isLoggedIn =
    cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;

  if (isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <main className="relative h-screen overflow-hidden bg-[linear-gradient(180deg,#9fd8ff_0%,#cfeeff_52%,#edf6ff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-x-[-20%] bottom-[-42%] h-[75%] rounded-[100%] border border-white/40" />
      <div className="pointer-events-none absolute inset-x-[-12%] bottom-[-46%] h-[78%] rounded-[100%] border border-white/30" />
      <div className="pointer-events-none absolute -bottom-28 left-[-8%] h-64 w-80 rounded-[50%] bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-32 right-[-6%] h-72 w-96 rounded-[50%] bg-white/65 blur-xl" />
      <div className="pointer-events-none absolute -bottom-20 left-[24%] h-56 w-80 rounded-[50%] bg-white/45 blur-xl" />

      <header className="relative z-10 px-6 pt-6 md:px-10 md:pt-8">
        <img
          src={siteSettings.logoUrl}
          alt={`${siteSettings.brandName} logo`}
          className="h-12 w-auto max-w-[170px] object-contain"
        />
      </header>

      <section className="relative z-10 mx-auto flex h-[calc(100%-88px)] w-[92%] max-w-[1440px] items-center justify-center pb-6 pt-4 md:h-[calc(100%-100px)] md:pb-8 md:pt-4">
        <AdminLoginForm />
      </section>
    </main>
  );
}
