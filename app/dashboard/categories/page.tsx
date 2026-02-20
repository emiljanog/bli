import { AdminShell } from "@/components/admin-shell";
import { listProductCategories, listProducts } from "@/lib/shop-store";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const categories = listProductCategories();
  const products = listProducts({ includeTrashed: true, includeDrafts: true });
  const productCountByCategorySlug = new Map<string, number>();

  for (const product of products) {
    for (const name of product.categories) {
      const slug = slugify(name);
      productCountByCategorySlug.set(slug, (productCountByCategorySlug.get(slug) ?? 0) + 1);
    }
  }

  return (
    <AdminShell title="Categories" description="Category library with slug, description and image.">
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-3xl font-semibold text-slate-900">All Categories</p>
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No categories yet.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.slug} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-500">
                    IMG
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{category.name}</p>
                  <p className="truncate text-xs text-slate-500">/{category.slug}</p>
                  <p className="truncate text-xs text-slate-600">{category.description || "No description"}</p>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {productCountByCategorySlug.get(category.slug) ?? 0} products
                </p>
              </div>
            ))}
          </div>
        )}
      </article>
    </AdminShell>
  );
}
