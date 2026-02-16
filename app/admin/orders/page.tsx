import { AdminShell } from "@/components/admin-shell";
import { AdminOrdersTable } from "@/components/admin-orders-table";
import { addOrderAction } from "@/app/admin/actions";
import { findProductNameById, listOrders, listProducts } from "@/lib/shop-store";

export default async function AdminOrdersPage() {
  const products = listProducts({ includeDrafts: true });
  const orders = listOrders().map((order) => ({
    id: order.id,
    customer: order.customer,
    productId: order.productId,
    productName: findProductNameById(order.productId),
    quantity: order.quantity,
    total: order.total,
    discount: order.discount,
    couponCode: order.couponCode,
    status: order.status,
    createdAt: order.createdAt,
  }));

  return (
    <AdminShell title="Orders" description="Track customer orders and update statuses.">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-2xl font-semibold">Order List</p>
          <AdminOrdersTable orders={orders} />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-semibold">Create Order</p>
          <form action={addOrderAction} className="mt-4 space-y-3">
            <input
              name="customer"
              type="text"
              placeholder="Customer name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <select
              name="productId"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
              defaultValue=""
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
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <select
              name="status"
              defaultValue="Pending"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Shipped</option>
              <option>Cancelled</option>
            </select>
            <input
              name="discount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Discount (optional)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input
              name="couponCode"
              type="text"
              placeholder="Coupon code (optional)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input
              name="total"
              type="number"
              min="0"
              step="0.01"
              placeholder="Manual total (optional)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input type="hidden" name="redirectTo" value="/dashboard/orders" />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
            >
              Save Order
            </button>
          </form>
        </article>
      </div>
    </AdminShell>
  );
}
