import { AdminShell } from "@/components/admin-shell";
import { listProductTags, listProducts } from "@/lib/shop-store";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminTagsPage() {
  const tags = listProductTags();
  const products = listProducts({ includeTrashed: true, includeDrafts: true });
  const tagCounts = new Map<string, number>();

  for (const product of products) {
    for (const tag of product.tags) {
      const slug = slugify(tag);
      tagCounts.set(slug, (tagCounts.get(slug) ?? 0) + 1);
    }
  }

  return (
    <AdminShell title="Tags" description="Product tags with slug and description.">
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-3xl font-semibold text-slate-900">All Tags</p>
        {tags.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No tags yet.
          </p>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => (
              <div key={tag.slug} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{tag.name}</p>
                  <p className="text-xs font-semibold text-slate-600">{tagCounts.get(tag.slug) ?? 0} products</p>
                </div>
                <p className="text-xs text-slate-500">/{tag.slug}</p>
                <p className="mt-1 text-xs text-slate-600">{tag.description || "No description"}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </AdminShell>
  );
}
