import Link from "next/link";
import { cookies } from "next/headers";
import { canAccessAdmin, getAdminRoleFromCookieStore, getAdminUsernameFromCookieStore } from "@/lib/admin-auth";

export default async function MyAccountPage() {
  const cookieStore = await cookies();
  const role = getAdminRoleFromCookieStore(cookieStore);
  const username = getAdminUsernameFromCookieStore(cookieStore);
  const hasAdminAccess = canAccessAdmin(role);

  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[980px] py-10 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">My Account</p>
          <h1 className="mt-2 text-4xl font-bold">Paneli i Llogarise</h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Kjo eshte faqja personale e user-it (<span className="font-semibold">{username}</span>). Roli aktual:{" "}
            <span className="font-semibold text-slate-900">{role}</span>.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">My Orders</p>
              <p className="mt-1 text-sm text-slate-600">
                Ketu mund te shfaqen porosite e user-it dhe statuset e tyre.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Profile Details</p>
              <p className="mt-1 text-sm text-slate-600">
                Emri, email, telefoni, adresa dhe ndryshimi i password.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Shko te Shop
            </Link>
            {hasAdminAccess ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Open Admin
              </Link>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
