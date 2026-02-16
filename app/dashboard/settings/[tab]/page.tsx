import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { SettingsMenuEditor } from "@/components/settings-menu-editor";
import { updateBrandingSettingsAction, updateMenuSettingsAction } from "@/app/dashboard/actions";
import { canAccessSettings, getAdminRoleFromCookieStore } from "@/lib/admin-auth";
import { SETTINGS_TABS, getSettingsTab, type SettingsTabSlug } from "@/app/dashboard/settings/settings-tabs";
import { getSiteSettings } from "@/lib/shop-store";

type AdminSettingsTabPageProps = {
  params: Promise<{ tab: string }>;
};

function tabHref(slug: SettingsTabSlug): string {
  return `/dashboard/settings/${slug}`;
}

function renderTabContent(tab: SettingsTabSlug) {
  if (tab === "general") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store Name</span>
          <input
            defaultValue="BLI Store"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Support Email</span>
          <input
            defaultValue="support@bli.local"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Currency</span>
          <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
            <option>EUR</option>
            <option>USD</option>
            <option>GBP</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</span>
          <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
            <option>Europe/Tirane</option>
            <option>Europe/Rome</option>
            <option>UTC</option>
          </select>
        </label>
      </div>
    );
  }

  if (tab === "payments") {
    return (
      <div className="space-y-3">
        {["Cash on Delivery", "Bank Transfer", "Stripe Card Payments", "PayPal"].map((method) => (
          <label
            key={method}
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
          >
            <span className="text-sm font-semibold text-slate-800">{method}</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
          </label>
        ))}
      </div>
    );
  }

  if (tab === "shipping") {
    return (
      <div className="space-y-3">
        {[
          "Albania - Standard (2-4 days)",
          "Kosovo - Express (1-2 days)",
          "EU - Economy (4-7 days)",
        ].map((zone) => (
          <div
            key={zone}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            {zone}
          </div>
        ))}
        <p className="text-xs font-medium text-slate-500">Tip: set free shipping threshold by zone.</p>
      </div>
    );
  }

  if (tab === "notifications") {
    return (
      <div className="space-y-3">
        {[
          "Send order confirmation to customer",
          "Send paid order notification to admin",
          "Send shipped order email",
          "Send low stock alerts",
        ].map((setting) => (
          <label
            key={setting}
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
            {setting}
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session Timeout</span>
        <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
          <option>8 hours</option>
          <option>24 hours</option>
          <option>7 days</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Password Minimum Length
        </span>
        <input
          type="number"
          defaultValue={8}
          min={6}
          max={32}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>
    </div>
  );
}

export default async function AdminSettingsTabPage({ params }: AdminSettingsTabPageProps) {
  const cookieStore = await cookies();
  const role = getAdminRoleFromCookieStore(cookieStore);
  if (!canAccessSettings(role)) {
    redirect("/dashboard");
  }

  const { tab } = await params;
  const active = getSettingsTab(tab);
  if (!active) {
    redirect("/dashboard/settings/general");
  }
  const siteSettings = getSiteSettings();

  return (
    <AdminShell title="Settings" description="Configure your store, website and system preferences.">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {SETTINGS_TABS.map((item) => {
            const isActive = item.slug === active.slug;
            return (
              <Link
                key={item.slug}
                href={tabHref(item.slug)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  isActive
                    ? "border-[#ff8a00] bg-[#ff8a00] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <h2 className="text-2xl font-semibold text-slate-900">{active.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{active.description}</p>

        {active.slug === "branding" ? (
          <form action={updateBrandingSettingsAction} encType="multipart/form-data" className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Website Title</span>
                <input
                  name="siteTitle"
                  defaultValue={siteSettings.siteTitle}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand Name</span>
                <input
                  name="brandName"
                  defaultValue={siteSettings.brandName}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                name="useLogoOnly"
                type="checkbox"
                defaultChecked={siteSettings.useLogoOnly}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>
                <span className="text-sm font-semibold text-slate-800">Use only logo</span>
                <span className="block text-sm text-slate-600">
                  Hide the brand text in the website header and keep only the logo visible.
                </span>
              </span>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logo URL</span>
                <input
                  name="logoUrl"
                  defaultValue={siteSettings.logoUrl}
                  placeholder="/logo.svg or https://..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload Logo</span>
                <input
                  name="logoFile"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Icon URL</span>
                <input
                  name="iconUrl"
                  defaultValue={siteSettings.iconUrl}
                  placeholder="/icon.png or https://..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload Icon</span>
                <input
                  name="iconFile"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold"
                />
              </label>
            </div>

            <input type="hidden" name="redirectTo" value={tabHref(active.slug)} />

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
              >
                Save Branding
              </button>
            </div>
          </form>
        ) : active.slug === "menu" ? (
          <SettingsMenuEditor
            initialItems={siteSettings.headerMenu}
            redirectTo={tabHref(active.slug)}
            action={updateMenuSettingsAction}
          />
        ) : (
          <>
            <div className="mt-5">{renderTabContent(active.slug)}</div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
