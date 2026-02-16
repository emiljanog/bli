import { notFound } from "next/navigation";
import { updateOrderAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { findProductNameById, getOrderById, listProducts } from "@/lib/shop-store";

type AdminOrderEditPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function AdminOrderEditPage({ params }: AdminOrderEditPageProps) {
  const { orderId } = await params;
  const order = getOrderById(orderId);
  const products = listProducts({ includeDrafts: true, includeTrashed: true });

  if (!order) {
    notFound();
  }

  return (
    <AdminShell title={`Edit Order: ${order.id}`} description="Edit customer, product, pricing and status.">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <form action={updateOrderAction} className="space-y-4">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="redirectTo" value={`/dashboard/orders/${order.id}`} />

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Customer</span>
              <input
                name="customer"
                type="text"
                defaultValue={order.customer}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Product</span>
              <select
                name="productId"
                defaultValue={order.productId}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.id})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">Quantity</span>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={order.quantity}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">Status</span>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option>Pending</option>
                  <option>Paid</option>
                  <option>Shipped</option>
                  <option>Cancelled</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">Total</span>
                <input
                  name="total"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={order.total}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">Discount</span>
                <input
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={order.discount}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">Coupon</span>
                <input
                  name="couponCode"
                  type="text"
                  defaultValue={order.couponCode ?? ""}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-slate-500"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#2ea2cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
              >
                Update Order
              </button>
            </div>
          </form>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                Order ID: <span className="font-semibold">{order.id}</span>
              </p>
              <p>
                Product: <span className="font-semibold">{findProductNameById(order.productId)}</span>
              </p>
              <p>
                Created: <span className="font-semibold">{order.createdAt}</span>
              </p>
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
