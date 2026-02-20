import Link from "next/link";
import { AdminProductsTable } from "@/components/admin-products-table";
import { AdminShell } from "@/components/admin-shell";
import { listProducts, listReviews } from "@/lib/shop-store";

type AdminProductsPageProps = {
  searchParams?: Promise<{
    trash?: string;
    trashedProductId?: string;
    undoUntil?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = (await searchParams) ?? {};
  const trashedProductId = (params.trashedProductId ?? "").trim();
  const undoUntil = Number(params.undoUntil);
  const canShowUndoNotice =
    params.trash === "1" &&
    trashedProductId &&
    Number.isFinite(undoUntil) &&
    undoUntil > 0;

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
    salePrice: product.salePrice,
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
      <article className="rounded-3xl border border-slate-200 bg-[#ececed] p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-4xl font-semibold text-slate-900">Products</p>
          <Link
            href="/dashboard/products/new"
            className="rounded-md border border-[#2271b1] bg-white px-3 py-1.5 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
          >
            Add new product
          </Link>
          <button
            type="button"
            className="rounded-md border border-[#2271b1] bg-white px-3 py-1.5 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
          >
            Import
          </button>
          <button
            type="button"
            className="rounded-md border border-[#2271b1] bg-white px-3 py-1.5 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
          >
            Export
          </button>
        </div>

        <AdminProductsTable
          products={products}
          trashNotice={canShowUndoNotice
            ? {
              productId: trashedProductId,
              undoUntil,
              message: "1 product moved to the Trash.",
            }
            : undefined}
          summary={{
            publishedCount,
            draftCount,
            trashedCount,
          }}
        />
      </article>
    </AdminShell>
  );
}
