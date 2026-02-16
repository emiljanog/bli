import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProductDescriptionEditor } from "@/components/admin-product-description-editor";
import { AdminProductMediaEditor } from "@/components/admin-product-media-editor";
import { AdminShell } from "@/components/admin-shell";
import {
  deleteProductPermanentlyAction,
  restoreProductAction,
  trashProductAction,
  updateProductAction,
} from "@/app/admin/actions";
import { getProductById, listProducts } from "@/lib/shop-store";

type AdminProductEditPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const { productId } = await params;
  const product = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  const categories = Array.from(
    new Set(listProducts({ includeTrashed: true, includeDrafts: true }).map((item) => item.category)),
  ).sort((a, b) => a.localeCompare(b));

  if (!product) {
    notFound();
  }

  return (
    <AdminShell title={`Edit Product: ${product.name}`} description="Update product URL, content and media.">
      <form action={updateProductAction} encType="multipart/form-data" className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="redirectTo" value={`/dashboard/products/${product.id}`} />
        <input type="hidden" name="publishStatus" value={product.publishStatus} />

        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-[#f4f4f4] p-4">
            <input
              name="name"
              type="text"
              defaultValue={product.name}
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-4xl font-medium text-slate-800 outline-none focus:border-slate-500"
              required
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_260px]">
              <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                Permalink: /product/{product.slug}
              </div>
              <input
                name="slug"
                type="text"
                defaultValue={product.slug}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="mt-4">
              <AdminProductDescriptionEditor name="description" defaultValue={product.description} />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Product Data</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Regular price</span>
                <input
                  name="price"
                  type="number"
                  min="1"
                  defaultValue={product.price}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Stock quantity</span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product.stock}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
              </label>
            </div>
          </article>
        </section>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold">Publish</p>
            </div>
            <div className="space-y-2 px-4 py-3 text-sm text-slate-700">
              <p>
                Status:{" "}
                <span
                  className={
                    product.trashedAt
                      ? "font-semibold text-amber-700"
                      : product.publishStatus === "Draft"
                        ? "font-semibold text-slate-700"
                        : "font-semibold text-emerald-700"
                  }
                >
                  {product.trashedAt ? "In Trash" : product.publishStatus}
                </span>
              </p>
              <p>ID: {product.id}</p>
              <p>
                Public URL:{" "}
                <Link href={`/product/${product.slug}`} className="font-semibold text-[#2ea2cc] hover:underline">
                  /product/{product.slug}
                </Link>
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
              <select
                name="publishStatus"
                defaultValue={product.publishStatus}
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

          <article className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold">Product Categories</p>
            </div>
            <div className="px-4 py-3">
              <label className="mb-2 block text-xs font-medium text-slate-600">Primary category</label>
              <select
                name="category"
                defaultValue={product.category}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <label className="mb-2 mt-3 block text-xs font-medium text-slate-600">Add new category</label>
              <input
                name="newCategory"
                type="text"
                placeholder="Type new category name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Product Media</p>
            <div className="mt-3">
              <AdminProductMediaEditor defaultImage={product.image} defaultGallery={product.gallery} />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold">Product Tags</p>
            </div>
            <div className="px-4 py-3">
              <input
                name="tags"
                type="text"
                defaultValue={product.tags.join(", ")}
                placeholder="new, featured, summer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Danger Zone</p>
            <div className="mt-3 space-y-2">
              {product.trashedAt ? (
                <>
                  <button
                    type="submit"
                    formAction={restoreProductAction}
                    formNoValidate
                    name="redirectTo"
                    value={`/dashboard/products/${product.id}`}
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200"
                  >
                    Restore Product
                  </button>
                  <button
                    type="submit"
                    formAction={deleteProductPermanentlyAction}
                    formNoValidate
                    name="redirectTo"
                    value="/dashboard/products"
                    className="w-full rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-200"
                  >
                    Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  formAction={trashProductAction}
                  formNoValidate
                  name="redirectTo"
                  value="/dashboard/products"
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
