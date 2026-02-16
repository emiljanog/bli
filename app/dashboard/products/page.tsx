import Link from "next/link";
import { AdminProductsTable } from "@/components/admin-products-table";
import { AdminShell } from "@/components/admin-shell";
import { listProducts, listReviews } from "@/lib/shop-store";

export default async function AdminProductsPage() {
  const allProducts = listProducts({ includeTrashed: true, includeDrafts: true });
  const reviews = listReviews({ status: "all" });
  const reviewCountByProductId = new Map<string, number>();
  for (const review of reviews) {
    reviewCountByProductId.set(
      review.productId,
      (reviewCountByProductId.get(review.productId) ?? 0) + 1,
    );
  }

  const products = allProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    tags: product.tags,
    price: product.price,
    stock: product.stock,
    reviews: reviewCountByProductId.get(product.id) ?? 0,
    publishStatus: product.publishStatus,
    trashedAt: product.trashedAt,
  }));

  const publishedCount = products.filter((product) => !product.trashedAt && product.publishStatus === "Published").length;
  const draftCount = products.filter((product) => !product.trashedAt && product.publishStatus === "Draft").length;
  const trashedCount = products.filter((product) => Boolean(product.trashedAt)).length;

  return (
    <AdminShell title="Products" description="Create and manage shop products.">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-2xl font-semibold">Products</p>
          <AdminProductsTable products={products} />
        </article>

        <aside className="space-y-4">
          <article className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Add New Product</p>
            <Link
              href="/dashboard/products/new"
              className="mt-4 inline-block w-full rounded-xl bg-[#2ea2cc] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#2387aa]"
            >
              Add New Product
            </Link>
          </article>

          <article className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Quick Summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                Published: <span className="font-semibold text-slate-800">{publishedCount}</span>
              </p>
              <p>
                Drafts: <span className="font-semibold text-slate-800">{draftCount}</span>
              </p>
              <p>
                Trash: <span className="font-semibold text-slate-800">{trashedCount}</span>
              </p>
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
