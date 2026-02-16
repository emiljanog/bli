import { addMediaAction } from "@/app/admin/actions";
import { AdminMediaImageEditor } from "@/components/admin-media-image-editor";
import { AdminShell } from "@/components/admin-shell";

export default function AdminNewMediaPage() {
  return (
    <AdminShell title="Add New Media" description="Upload media, set alt text and description.">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <form action={addMediaAction} encType="multipart/form-data" className="space-y-4">
            <input type="hidden" name="redirectTo" value="/dashboard/media" />

            <AdminMediaImageEditor />

            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Assignment is automatic from upload source (product/page/user). No manual selection needed.
            </p>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Alt Text</span>
              <input
                name="alt"
                type="text"
                placeholder="Describe the image"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Description</span>
              <textarea
                name="description"
                rows={4}
                placeholder="Optional description..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#2ea2cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
              >
                Save Media
              </button>
            </div>
          </form>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Tips</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Use meaningful alt text for accessibility and SEO.</p>
              <p>Replace image URL any time from media edit page.</p>
              <p>Use crop when you need square thumbnails.</p>
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
