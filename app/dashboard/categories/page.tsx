import { AdminShell } from "@/components/admin-shell";
import { listProducts } from "@/lib/shop-store";

export default function AdminCategoriesPage() {
  const products = listProducts({ includeTrashed: true, includeDrafts: true });
  const categoryCounts = new Map<string, number>();

  for (const product of products) {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
  }

  const categories = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <AdminShell title="Categories" description="Product categories and product counts.">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-2xl font-semibold">All Categories</p>
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No categories yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(([name, count]) => (
              <div key={name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-600">{count} products</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </AdminShell>
  );
}
