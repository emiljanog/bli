import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { dashboardStats, listOrders, listProducts, listSales } from "@/lib/shop-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminPage() {
  const stats = dashboardStats();
  const orders = listOrders().slice(0, 5);
  const products = listProducts().slice(0, 4);
  const sales = listSales().slice(0, 5);

  return (
    <AdminShell
      title="Dashboard"
      description="Monitor sales, orders, products and users in one place."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-[#f0d6b6] bg-[#f4e4cf] p-5">
          <p className="text-sm text-slate-500">Total Sales</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(stats.totalSales)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold">{stats.orders}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Products</p>
          <p className="mt-2 text-3xl font-bold">{stats.products}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Users</p>
          <p className="mt-2 text-3xl font-bold">{stats.users}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-2xl font-semibold">Recent Orders</p>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-[#ff8a00]">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 font-semibold">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">{formatCurrency(order.total)}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-2xl font-semibold">Top Products</p>
              <Link href="/dashboard/products" className="text-sm font-semibold text-[#ff8a00]">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-slate-600">
                    {product.category} | Stock: {product.stock}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-2xl font-semibold">Latest Sales</p>
              <Link href="/dashboard/sales" className="text-sm font-semibold text-[#ff8a00]">
                Open
              </Link>
            </div>
            <div className="space-y-2">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{sale.source}</span>
                  <span className="font-semibold">{formatCurrency(sale.amount)}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </AdminShell>
  );
}
