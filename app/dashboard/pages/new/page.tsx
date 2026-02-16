import { AdminProductDescriptionEditor } from "@/components/admin-product-description-editor";
import { AdminShell } from "@/components/admin-shell";
import { addPageAction } from "@/app/dashboard/actions";

export default function AdminNewPagePage() {
  return (
    <AdminShell title="Add New Page" description="Create a page with name, URL and content.">
      <form action={addPageAction} className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <input type="hidden" name="redirectTo" value="/dashboard/pages" />
        <input type="hidden" name="publishStatus" value="Draft" />

        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-[#f4f4f4] p-4">
            <input
              name="name"
              type="text"
              placeholder="Page title"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-4xl font-medium text-slate-800 outline-none focus:border-slate-500"
              required
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_260px]">
              <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                URL: /
              </div>
              <input
                name="slug"
                type="text"
                placeholder="about-us (optional)"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="mt-4">
              <AdminProductDescriptionEditor
                name="content"
                rows={16}
                placeholder="Write page content..."
              />
            </div>
          </article>
        </section>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold">Publish</p>
            </div>
            <div className="space-y-2 px-4 py-3 text-sm text-slate-700">
              <p>Status: Draft</p>
              <p>Visibility: Public</p>
              <p>URL: auto from title if empty</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="submit"
                name="publishStatus"
                value="Draft"
                formNoValidate
                className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Save Draft
              </button>
              <button
                type="submit"
                name="publishStatus"
                value="Published"
                className="rounded-lg bg-[#2ea2cc] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
              >
                Publish
              </button>
            </div>
          </article>
        </aside>
      </form>
    </AdminShell>
  );
}
