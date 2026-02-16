import { AdminProductDescriptionEditor } from "@/components/admin-product-description-editor";
import { AdminProductMediaEditor } from "@/components/admin-product-media-editor";
import { AdminShell } from "@/components/admin-shell";
import { addProductAction } from "@/app/admin/actions";
import { listProducts } from "@/lib/shop-store";

const fallbackCategories = [
  "Tech Essentials",
  "Urban Fashion",
  "Home & Living",
  "Sports & Outdoor",
  "Beauty & Care",
];

export default async function AdminNewProductPage() {
  const existingCategories = Array.from(
    new Set(listProducts({ includeTrashed: true, includeDrafts: true }).map((product) => product.category)),
  ).sort((a, b) => a.localeCompare(b));
  const categories = existingCategories.length > 0 ? existingCategories : fallbackCategories;

  return (
    <AdminShell
      title="Add New Product"
      description="Create product details, media and URL from the same editor."
    >
      <form action={addProductAction} encType="multipart/form-data" className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <input type="hidden" name="redirectTo" value="/dashboard/products" />
        <input type="hidden" name="publishStatus" value="Draft" />

        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-[#f4f4f4] p-4">
            <input
              name="name"
              type="text"
              placeholder="My New Product Name"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-4xl font-medium text-slate-800 outline-none focus:border-slate-500"
              required
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_260px]">
              <div className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                Permalink: /product/
              </div>
              <input
                name="slug"
                type="text"
                placeholder="emri-produktit"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="mt-4">
              <AdminProductDescriptionEditor name="description" />
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
                  placeholder="0"
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
                  placeholder="0"
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
              <p>Status: Draft</p>
              <p>Visibility: Public</p>
              <p>Publish: Immediately</p>
              <p>Catalog visibility: Catalog/search</p>
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

          <article className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold">Product Categories</p>
            </div>
            <div className="px-4 py-3">
              <label className="mb-2 block text-xs font-medium text-slate-600">Primary category</label>
              <select
                name="category"
                defaultValue={categories[0]}
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
              <p className="mt-1 text-xs text-slate-500">
                If filled, new category will be used and saved with this product.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Product Media</p>
            <div className="mt-3">
              <AdminProductMediaEditor />
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
                placeholder="new, featured, summer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </article>
        </aside>
      </form>
    </AdminShell>
  );
}
