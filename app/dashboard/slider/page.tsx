import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateHomeSliderSettingsAction } from "@/app/dashboard/actions";
import { AdminShell } from "@/components/admin-shell";
import { HomeSliderEditor } from "@/components/home-slider-editor";
import { canAccessSettings, getAdminRoleFromCookieStore } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/shop-store";

export default async function AdminSliderPage() {
  const cookieStore = await cookies();
  const role = getAdminRoleFromCookieStore(cookieStore);
  if (!canAccessSettings(role)) {
    redirect("/dashboard");
  }

  const siteSettings = getSiteSettings();

  return (
    <AdminShell title="Home Slider" description="Edit home slider text, image, buttons and slide options.">
      <form action={updateHomeSliderSettingsAction} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autoplay Delay (ms)</span>
            <input
              name="sliderAutoplayMs"
              type="number"
              min={1500}
              max={20000}
              step={100}
              defaultValue={siteSettings.sliderAutoplayMs}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              name="sliderShowArrows"
              type="checkbox"
              defaultChecked={siteSettings.sliderShowArrows}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-semibold text-slate-700">Show Previous/Next arrows</span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              name="sliderShowDots"
              type="checkbox"
              defaultChecked={siteSettings.sliderShowDots}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-semibold text-slate-700">Show slide dots</span>
          </label>
        </div>

        <HomeSliderEditor initialSlides={siteSettings.homeSlides ?? []} />

        <input type="hidden" name="redirectTo" value="/dashboard/slider" />

        <div className="flex justify-start pt-2">
          <button
            type="submit"
            className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
          >
            Save Slider
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
