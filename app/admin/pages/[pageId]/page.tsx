import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProductDescriptionEditor } from "@/components/admin-product-description-editor";
import { AdminShell } from "@/components/admin-shell";
import {
  deletePageAction,
  restorePageAction,
  trashPageAction,
  updatePageAction,
} from "@/app/admin/actions";
import { getPageById } from "@/lib/shop-store";

type AdminEditPageProps = {
  params: Promise<{ pageId: string }>;
};

export default async function AdminEditPage({ params }: AdminEditPageProps) {
  const { pageId } = await params;
  const page = getPageById(pageId, { includeDrafts: true, includeTrashed: true });

  if (!page) {
    notFound();
  }

  return (
    <AdminShell title={`Edit Page: ${page.name}`} description="Update page URL and content.">
      <form action={updatePageAction} className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <input type="hidden" name="pageId" value={page.id} />
        <input type="hidden" name="redirectTo" value={`/dashboard/pages/${page.id}`} />
        <input type="hidden" name="publishStatus" value={page.publishStatus} />

        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-[#f4f4f4] p-4">
            <input
              name="name"
              type="text"
              defaultValue={page.name}
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-4xl font-medium text-slate-800 outline-none focus:border-slate-500"
              required
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_260px]">
              <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                URL: /{page.slug}
              </div>
              <input
                name="slug"
                type="text"
                defaultValue={page.slug}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="mt-4">
              <AdminProductDescriptionEditor
                name="content"
                defaultValue={page.content}
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
              <p>ID: {page.id}</p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    page.trashedAt
                      ? "text-amber-700"
                      : page.publishStatus === "Draft"
                        ? "text-slate-700"
                        : "text-emerald-700"
                  }`}
                >
                  {page.trashedAt ? "In Trash" : page.publishStatus}
                </span>
              </p>
              <p>
                Public URL:{" "}
                <Link href={`/${page.slug}`} className="font-semibold text-[#2ea2cc] hover:underline">
                  /{page.slug}
                </Link>
              </p>
              <p>Updated: {page.updatedAt}</p>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
              <select
                name="publishStatus"
                defaultValue={page.publishStatus}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  name="publishStatus"
                  value="Draft"
                  formNoValidate
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  name="publishStatus"
                  value="Published"
                  className="rounded-lg bg-[#2ea2cc] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
                >
                  Update
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Danger Zone</p>
            <div className="mt-3 space-y-2">
              {page.trashedAt ? (
                <>
                  <button
                    type="submit"
                    formAction={restorePageAction}
                    formNoValidate
                    name="redirectTo"
                    value={`/dashboard/pages/${page.id}`}
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200"
                  >
                    Restore Page
                  </button>
                  <button
                    type="submit"
                    formAction={deletePageAction}
                    formNoValidate
                    name="redirectTo"
                    value="/dashboard/pages"
                    className="w-full rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-200"
                  >
                    Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  formAction={trashPageAction}
                  formNoValidate
                  name="redirectTo"
                  value="/dashboard/pages"
                  className="w-full rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
                >
                  Move to Trash
                </button>
              )}
            </div>
          </article>
        </aside>
      </form>
    </AdminShell>
  );
}
