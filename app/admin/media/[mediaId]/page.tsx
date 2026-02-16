import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteMediaPermanentlyAction,
  restoreMediaAction,
  updateMediaAction,
} from "@/app/admin/actions";
import { AdminMediaImageEditor } from "@/components/admin-media-image-editor";
import { AdminMediaTrashAction } from "@/components/admin-media-trash-action";
import { AdminShell } from "@/components/admin-shell";
import { getMediaById } from "@/lib/shop-store";

type AdminMediaEditPageProps = {
  params: Promise<{ mediaId: string }>;
};

export default async function AdminMediaEditPage({ params }: AdminMediaEditPageProps) {
  const { mediaId } = await params;
  const media = getMediaById(mediaId, { includeTrashed: true });

  if (!media) {
    notFound();
  }

  return (
    <AdminShell title={`Edit Media: ${media.id}`} description="Edit image, crop, replace, alt text and description.">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <form action={updateMediaAction} encType="multipart/form-data" className="space-y-4">
            <input type="hidden" name="mediaId" value={media.id} />
            <input type="hidden" name="redirectTo" value={`/dashboard/media/${media.id}`} />

            <AdminMediaImageEditor defaultUrl={media.url} restoreUrl={media.originalUrl ?? media.url} />

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Alt Text</span>
              <input
                name="alt"
                type="text"
                defaultValue={media.alt}
                placeholder="Describe the image"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Description</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={media.description}
                placeholder="Optional description..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#2ea2cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
              >
                Update Media
              </button>
            </div>
          </form>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Media Info</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                ID: <span className="font-semibold">{media.id}</span>
              </p>
              <p>
                Uploaded: <span className="font-semibold">{media.createdAt}</span>
              </p>
              <p>
                Uploaded by: <span className="font-semibold">{media.uploadedBy || "System"}</span>
              </p>
              <p>
                Updated: <span className="font-semibold">{media.updatedAt}</span>
              </p>
              <p>
                URL:{" "}
                <Link href={media.url} target="_blank" className="font-semibold text-[#2ea2cc] hover:underline">
                  Open image
                </Link>
              </p>
              <p>
                Status:{" "}
                <span className={`font-semibold ${media.trashedAt ? "text-amber-700" : "text-emerald-700"}`}>
                  {media.trashedAt ? "In Trash" : "Active"}
                </span>
              </p>
              <p>
                Assigned:{" "}
                <span className="font-semibold">
                  {media.assignedTo}
                  {media.assignedToId ? " (" : ""}
                  {media.assignedTo === "Product" && media.assignedToId ? (
                    <Link
                      href={`/dashboard/products/${media.assignedToId}`}
                      className="text-[#2ea2cc] hover:underline"
                    >
                      {media.assignedToId}
                    </Link>
                  ) : null}
                  {media.assignedTo === "Page" && media.assignedToId ? (
                    <Link href={`/dashboard/pages/${media.assignedToId}`} className="text-[#2ea2cc] hover:underline">
                      {media.assignedToId}
                    </Link>
                  ) : null}
                  {media.assignedTo === "User" && media.assignedToId ? (
                    <Link href={`/dashboard/users/${media.assignedToId}`} className="text-[#2ea2cc] hover:underline">
                      {media.assignedToId}
                    </Link>
                  ) : null}
                  {media.assignedTo === "Unassigned" && media.assignedToId ? media.assignedToId : null}
                  {media.assignedToId ? ")" : ""}
                </span>
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Danger Zone</p>
            <div className="mt-3 space-y-2">
              {!media.trashedAt ? (
                <AdminMediaTrashAction
                  mediaId={media.id}
                  redirectTo="/dashboard/media"
                  buttonLabel="Move to Trash"
                  buttonClassName="w-full rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200"
                  confirmText={`Are you sure you want to move media "${media.id}" to trash?`}
                  fullWidth
                />
              ) : (
                <>
                  <form action={restoreMediaAction}>
                    <input type="hidden" name="mediaId" value={media.id} />
                    <input type="hidden" name="redirectTo" value={`/dashboard/media/${media.id}`} />
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200"
                    >
                      Restore
                    </button>
                  </form>
                  <form action={deleteMediaPermanentlyAction}>
                    <input type="hidden" name="mediaId" value={media.id} />
                    <input type="hidden" name="redirectTo" value="/dashboard/media" />
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-200"
                    >
                      Delete Permanently
                    </button>
                  </form>
                </>
              )}
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
