import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { addReviewAction, deleteReviewAction, updateReviewStatusAction } from "@/app/dashboard/actions";
import { listProducts, listReviews, type ReviewStatus } from "@/lib/shop-store";

export default async function AdminReviewsPage() {
  const products = listProducts({ includeDrafts: true });
  const reviews = listReviews({ status: "all" });

  return (
    <AdminShell title="Reviews" description="Manage product reviews and moderation status.">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-2xl font-semibold">Review List</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Author</th>
                  <th className="pb-2 font-medium">Rating</th>
                  <th className="pb-2 font-medium">Comment</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const product = products.find((item) => item.id === review.productId);
                  const statusColors: Record<ReviewStatus, string> = {
                    Approved: "bg-emerald-100 text-emerald-700",
                    Pending: "bg-amber-100 text-amber-700",
                    Hidden: "bg-slate-200 text-slate-600",
                  };

                  return (
                    <tr key={review.id} className="border-b border-slate-100 align-top">
                      <td className="py-3">
                        <p className="font-semibold">{product?.name ?? review.productId}</p>
                        {product ? (
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="text-xs text-slate-500 underline"
                          >
                            /product/{product.slug}
                          </Link>
                        ) : null}
                      </td>
                      <td className="py-3">{review.author}</td>
                      <td className="py-3">{review.rating}/5</td>
                      <td className="py-3">{review.comment}</td>
                      <td className="py-3">{review.createdAt}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[review.status]}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={updateReviewStatusAction}>
                            <input type="hidden" name="reviewId" value={review.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={review.status === "Approved" ? "Hidden" : "Approved"}
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              {review.status === "Approved" ? "Hide" : "Approve"}
                            </button>
                          </form>
                          <form action={deleteReviewAction}>
                            <input type="hidden" name="reviewId" value={review.id} />
                            <input type="hidden" name="productSlug" value={product?.slug ?? ""} />
                            <button
                              type="submit"
                              className="rounded-lg border border-rose-300 bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-semibold">Add Review</p>
          <form action={addReviewAction} className="mt-4 space-y-3">
            <select
              name="productId"
              defaultValue=""
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            >
              <option value="" disabled>
                Select product
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              name="author"
              type="text"
              placeholder="Author name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <select
              name="rating"
              defaultValue="5"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
            <textarea
              name="comment"
              rows={4}
              placeholder="Review text"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <select
              name="status"
              defaultValue="Approved"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Hidden">Hidden</option>
            </select>
            <input type="hidden" name="redirectTo" value="/dashboard/reviews" />
            <button
              type="submit"
              className="w-full rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
            >
              Save Review
            </button>
          </form>
        </article>
      </div>
    </AdminShell>
  );
}
