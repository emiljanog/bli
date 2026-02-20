import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { BrandColorField } from "@/components/brand-color-field";
import { SettingsMenuEditor } from "@/components/settings-menu-editor";
import { UploadField } from "@/components/upload-field";
import {
  updateBrandingSettingsAction,
  updateBrandThemeSettingsAction,
  updateCheckoutPaymentSettingsAction,
  updateCheckoutShippingSettingsAction,
  updateEmailSettingsAction,
  updateMenuSettingsAction,
} from "@/app/dashboard/actions";
import { canAccessSettings, getAdminRoleFromCookieStore, getAdminUsernameFromCookieStore } from "@/lib/admin-auth";
import { SETTINGS_TABS, getSettingsTab, type SettingsTabSlug } from "@/app/dashboard/settings/settings-tabs";
import { getSiteSettings, listMedia } from "@/lib/shop-store";

type AdminSettingsTabPageProps = {
  params: Promise<{ tab: string }>;
};

function tabHref(slug: SettingsTabSlug): string {
  return `/dashboard/settings/${slug}`;
}

function renderTabContent() {
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
  const currentUsername = getAdminUsernameFromCookieStore(cookieStore);
  if (!canAccessSettings(role)) {
    redirect("/dashboard");
  }

  const { tab } = await params;
  const normalizedTab = tab.trim().toLowerCase();
  if (normalizedTab === "branding") {
    redirect("/dashboard/settings/general");
  }
  if (normalizedTab === "notifications") {
    redirect("/dashboard/settings/emails");
  }

  const active = getSettingsTab(normalizedTab);
  if (!active) {
    redirect("/dashboard/settings/general");
  }
  const siteSettings = getSiteSettings();
  const mediaImages = listMedia().map((item) => ({
    id: item.id,
    url: item.url,
    label: item.alt || item.url,
    uploadedBy: item.uploadedBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

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
                    ? "site-primary-border site-primary-bg text-white"
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

        {active.slug === "general" ? (
          <form action={updateBrandingSettingsAction} className="mt-5 space-y-5">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Defaults are <code>/logo.svg</code> and <code>/favicon.ico</code> from the root web path.
            </p>

            <div className="space-y-4">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site Title</span>
                <input
                  name="siteTitle"
                  defaultValue={siteSettings.siteTitle}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tagline</span>
                <input
                  name="brandName"
                  defaultValue={siteSettings.brandName}
                  placeholder="Shop"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <span className="block text-xs text-slate-500">
                  In a few words, explain what this site is about.
                </span>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Site Max Width (px)
                </span>
                <input
                  name="layoutMaxWidthPx"
                  type="number"
                  min={960}
                  max={2400}
                  step={10}
                  defaultValue={siteSettings.layoutMaxWidthPx}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <span className="block text-xs text-slate-500">
                  This width is used by all public pages for main content containers.
                </span>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Media Upload Max Size (MB)
                </span>
                <input
                  name="mediaUploadMaxMb"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  defaultValue={siteSettings.mediaUploadMaxMb}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <span className="block text-xs text-slate-500">
                  Set maximum size per image file for uploads. Example: 25 means 25 MB.
                </span>
              </label>
            </div>

            <p className="text-sm font-semibold text-slate-900">Logo</p>
            <div className="grid gap-4 md:grid-cols-2">
              <UploadField
                title="Upload Logo"
                mediaItems={mediaImages}
                fileInputName="logoFile"
                valueInputName="logoSourceUrl"
                defaultValue={siteSettings.logoUrl}
                triggerLabel="Upload"
                currentUsername={currentUsername}
              />
              <div />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logo SVG/HTML</span>
                <textarea
                  name="logoMarkup"
                  placeholder="<svg ...>...</svg>"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logo URL (optional)</span>
                <input
                  name="logoUrl"
                  defaultValue={siteSettings.logoUrl}
                  placeholder="/logo.svg or https://..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <p className="text-sm font-semibold text-slate-900">Site Icon</p>
            <div className="grid gap-4 md:grid-cols-2">
              <UploadField
                title="Upload Favicon"
                mediaItems={mediaImages}
                fileInputName="iconFile"
                valueInputName="iconSourceUrl"
                defaultValue={siteSettings.iconUrl}
                triggerLabel="Upload"
                currentUsername={currentUsername}
              />
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Favicon SVG/HTML</span>
                <textarea
                  name="iconMarkup"
                  placeholder="<svg ...>...</svg>"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Favicon URL (optional)</span>
              <input
                name="iconUrl"
                defaultValue={siteSettings.iconUrl}
                placeholder="/favicon.ico or https://..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <input type="hidden" name="redirectTo" value={tabHref(active.slug)} />

            <div className="flex justify-start py-2">
              <button
                type="submit"
                className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Save General Settings
              </button>
            </div>
          </form>
        ) : active.slug === "brand" ? (
          <form action={updateBrandThemeSettingsAction} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title Font</span>
                <input
                  name="titleFont"
                  defaultValue={siteSettings.titleFont}
                  placeholder={'"Poppins", sans-serif'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Text Font</span>
                <input
                  name="textFont"
                  defaultValue={siteSettings.textFont}
                  placeholder={'"Inter", sans-serif'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Button Font</span>
                <input
                  name="buttonFont"
                  defaultValue={siteSettings.buttonFont}
                  placeholder={'"Montserrat", sans-serif'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">UI Font</span>
                <input
                  name="uiFont"
                  defaultValue={siteSettings.uiFont}
                  placeholder={'"Manrope", sans-serif'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <BrandColorField
                name="primaryColor"
                label="Primary Color"
                defaultValue={siteSettings.primaryColor}
              />
              <BrandColorField
                name="secondaryColor"
                label="Secondary Color"
                defaultValue={siteSettings.secondaryColor}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <BrandColorField name="accentColor" label="Accent Color" defaultValue={siteSettings.accentColor} />
              <BrandColorField
                name="backgroundColor"
                label="Background Color"
                defaultValue={siteSettings.backgroundColor}
              />
            </div>

            <input type="hidden" name="redirectTo" value={tabHref(active.slug)} />

            <div className="flex justify-start py-2">
              <button
                type="submit"
                className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Save Brand Settings
              </button>
            </div>
          </form>
        ) : active.slug === "payments" ? (
          <form action={updateCheckoutPaymentSettingsAction} className="mt-5 space-y-5">
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800">CAD (Cash on Delivery)</span>
                <input
                  name="paymentCadEnabled"
                  type="checkbox"
                  defaultChecked={siteSettings.paymentCadEnabled}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800">Bank transfer</span>
                <input
                  name="paymentBankTransferEnabled"
                  type="checkbox"
                  defaultChecked={siteSettings.paymentBankTransferEnabled}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800">Stripe demo</span>
                <input
                  name="paymentStripeDemoEnabled"
                  type="checkbox"
                  defaultChecked={siteSettings.paymentStripeDemoEnabled}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bank transfer instructions
              </span>
              <textarea
                name="paymentBankTransferInstructions"
                rows={4}
                defaultValue={siteSettings.paymentBankTransferInstructions}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <input type="hidden" name="redirectTo" value={tabHref(active.slug)} />

            <div className="flex justify-start py-2">
              <button
                type="submit"
                className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Save Payment Settings
              </button>
            </div>
          </form>
        ) : active.slug === "shipping" ? (
          <form action={updateCheckoutShippingSettingsAction} className="mt-5 space-y-5">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Shipping Method 1</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</span>
                  <input
                    name="shippingStandardLabel"
                    defaultValue={siteSettings.shippingStandardLabel}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ETA</span>
                  <input
                    name="shippingStandardEta"
                    defaultValue={siteSettings.shippingStandardEta}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</span>
                  <input
                    name="shippingStandardPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={siteSettings.shippingStandardPrice}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>
                <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <input
                    name="shippingStandardEnabled"
                    type="checkbox"
                    defaultChecked={siteSettings.shippingStandardEnabled}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Enabled
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Shipping Method 2</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</span>
                  <input
                    name="shippingExpressLabel"
                    defaultValue={siteSettings.shippingExpressLabel}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ETA</span>
                  <input
                    name="shippingExpressEta"
                    defaultValue={siteSettings.shippingExpressEta}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</span>
                  <input
                    name="shippingExpressPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={siteSettings.shippingExpressPrice}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>
                <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <input
                    name="shippingExpressEnabled"
                    type="checkbox"
                    defaultChecked={siteSettings.shippingExpressEnabled}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Enabled
                </label>
              </div>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Free shipping threshold (0 = disabled)
              </span>
              <input
                name="shippingFreeThreshold"
                type="number"
                min={0}
                step={0.01}
                defaultValue={siteSettings.shippingFreeThreshold}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <input type="hidden" name="redirectTo" value={tabHref(active.slug)} />

            <div className="flex justify-start py-2">
              <button
                type="submit"
                className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Save Shipping Settings
              </button>
            </div>
          </form>
        ) : active.slug === "emails" ? (
          <form action={updateEmailSettingsAction} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</span>
                <select
                  name="emailProvider"
                  defaultValue={siteSettings.emailProvider}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="smtp">SMTP Mail Server</option>
                  <option value="phpmailer">PHPMailer</option>
                  <option value="react-email">React Email API</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">From Name</span>
                <input
                  name="emailFromName"
                  defaultValue={siteSettings.emailFromName}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">From Email</span>
                <input
                  name="emailFromAddress"
                  type="email"
                  defaultValue={siteSettings.emailFromAddress}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mail Host</span>
                <input
                  name="mailHost"
                  defaultValue={siteSettings.mailHost}
                  placeholder="smtp.mailserver.local"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mail Port</span>
                <input
                  name="mailPort"
                  type="number"
                  min={1}
                  max={65535}
                  defaultValue={siteSettings.mailPort}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</span>
                <input
                  name="mailUsername"
                  defaultValue={siteSettings.mailUsername}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
                <input
                  name="mailPassword"
                  type="password"
                  defaultValue={siteSettings.mailPassword}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  PHPMailer Path
                </span>
                <input
                  name="phpMailerPath"
                  defaultValue={siteSettings.phpMailerPath}
                  placeholder="/mailer/send.php"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  React Email API URL
                </span>
                <input
                  name="reactEmailApiUrl"
                  defaultValue={siteSettings.reactEmailApiUrl}
                  placeholder="https://api.yoursite.com/email"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  React Email API Key
                </span>
                <input
                  name="reactEmailApiKey"
                  defaultValue={siteSettings.reactEmailApiKey}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                name="mailSecure"
                type="checkbox"
                defaultChecked={siteSettings.mailSecure}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Use SSL/TLS secure connection</span>
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  name="notifyCustomerOrderConfirmation"
                  type="checkbox"
                  defaultChecked={siteSettings.notifyCustomerOrderConfirmation}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Send order confirmation to customer
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  name="notifyAdminPaidOrder"
                  type="checkbox"
                  defaultChecked={siteSettings.notifyAdminPaidOrder}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Send paid order notification to admin
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  name="notifyShippedOrder"
                  type="checkbox"
                  defaultChecked={siteSettings.notifyShippedOrder}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Send shipped order email
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  name="notifyLowStock"
                  type="checkbox"
                  defaultChecked={siteSettings.notifyLowStock}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Send low stock alerts
              </label>
            </div>

            <input type="hidden" name="redirectTo" value={tabHref(active.slug)} />

            <div className="flex justify-start py-2">
              <button
                type="submit"
                className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Save Email Settings
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
            <div className="mt-5">{renderTabContent()}</div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
