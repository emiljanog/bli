import { AdminShell } from "@/components/admin-shell";
import { deleteStoreCategoryAction, upsertStoreCategoryAction } from "@/app/dashboard/actions";
import { listProductCategories, listProducts } from "@/lib/shop-store";

const ICON_PRESETS = ["", "🛍️", "💻", "👗", "🏠", "⚽", "💄", "🍽️", "📚", "🐾"] as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitIconValue(icon: string): { preset: string; custom: string } {
  const safe = icon.trim();
  if (!safe) return { preset: "", custom: "" };
  if (ICON_PRESETS.includes(safe as (typeof ICON_PRESETS)[number])) {
    return { preset: safe, custom: "" };
  }
  return { preset: "", custom: safe };
}

export default function AdminStoreCategoriesPage() {
  const categories = listProductCategories();
  const products = listProducts({ includeTrashed: true, includeDrafts: true });
  const productCountByCategorySlug = new Map<string, number>();

  for (const product of products) {
    for (const categoryName of product.categories) {
      const categorySlug = slugify(categoryName);
      productCountByCategorySlug.set(categorySlug, (productCountByCategorySlug.get(categorySlug) ?? 0) + 1);
    }
  }

  return (
    <AdminShell
      title="Store / Categories"
      description="Menaxho kategorite e store-it: shto/perditeso emer, pershkrim, ikon dhe foto."
    >
      <div className="space-y-5">
        <article className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xl font-semibold text-slate-900">Shto kategori te re</p>
          <form action={upsertStoreCategoryAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/dashboard/store/categories" />
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Emri</span>
              <input
                name="name"
                required
                placeholder="p.sh. Home & Living"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Slug (opsionale)</span>
              <input
                name="slug"
                placeholder="home-living"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium text-slate-700">Pershkrimi</span>
              <textarea
                name="description"
                rows={2}
                placeholder="Pershkrim i shkurter i kategorise"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Ikona (preset)</span>
              <select
                name="iconPreset"
                defaultValue=""
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="">Pa ikone</option>
                <option value="🛍️">Shopping</option>
                <option value="💻">Tech</option>
                <option value="👗">Fashion</option>
                <option value="🏠">Home</option>
                <option value="⚽">Sports</option>
                <option value="💄">Beauty</option>
                <option value="🍽️">Food</option>
                <option value="📚">Books</option>
                <option value="🐾">Pets</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Ikona (custom)</span>
              <input
                name="iconCustom"
                placeholder="p.sh. 🪑"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Foto URL (opsionale)</span>
              <input
                name="imageUrl"
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Foto upload (opsionale)</span>
              <input
                type="file"
                accept="image/*"
                name="imageFile"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                Shto kategorine
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xl font-semibold text-slate-900">Kategorite ekzistuese</p>
          {categories.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              Nuk ka kategori ende.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {categories.map((category) => {
                const iconData = splitIconValue(category.icon ?? "");
                return (
                  <div key={category.slug} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg">
                          {(category.icon ?? "").trim() || "🏷️"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{category.name}</p>
                        <p className="truncate text-xs text-slate-500">/{category.slug}</p>
                        <p className="text-xs font-semibold text-slate-600">
                          {productCountByCategorySlug.get(category.slug) ?? 0} produkte
                        </p>
                      </div>
                    </div>

                    <form action={upsertStoreCategoryAction} className="grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="redirectTo" value="/dashboard/store/categories" />
                      <input type="hidden" name="currentSlug" value={category.slug} />
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Emri</span>
                        <input
                          name="name"
                          required
                          defaultValue={category.name}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Slug</span>
                        <input
                          name="slug"
                          readOnly
                          defaultValue={category.slug}
                          className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm md:col-span-2">
                        <span className="font-medium text-slate-700">Pershkrimi</span>
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={category.description}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Ikona (preset)</span>
                        <select
                          name="iconPreset"
                          defaultValue={iconData.preset}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        >
                          <option value="">Pa ikone</option>
                          <option value="🛍️">Shopping</option>
                          <option value="💻">Tech</option>
                          <option value="👗">Fashion</option>
                          <option value="🏠">Home</option>
                          <option value="⚽">Sports</option>
                          <option value="💄">Beauty</option>
                          <option value="🍽️">Food</option>
                          <option value="📚">Books</option>
                          <option value="🐾">Pets</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Ikona (custom)</span>
                        <input
                          name="iconCustom"
                          defaultValue={iconData.custom}
                          placeholder="p.sh. 🪑"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Foto URL</span>
                        <input
                          name="imageUrl"
                          defaultValue={category.imageUrl}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="font-medium text-slate-700">Foto upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          name="imageFile"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
                        />
                      </label>
                      <div className="md:col-span-2 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Ruaj ndryshimet
                        </button>
                      </div>
                    </form>

                    <form action={deleteStoreCategoryAction} className="mt-2">
                      <input type="hidden" name="redirectTo" value="/dashboard/store/categories" />
                      <input type="hidden" name="slug" value={category.slug} />
                      <button
                        type="submit"
                        className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Fshi kategorine
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </AdminShell>
  );
}

