import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { listCustomers, listOrders } from "@/lib/shop-store";

export default async function AdminCustomersPage() {
  const customers = listCustomers();
  const orders = listOrders();

  const orderCountByCustomer = new Map<string, number>();
  for (const order of orders) {
    const key = order.customer.toLowerCase();
    orderCountByCustomer.set(key, (orderCountByCustomer.get(key) ?? 0) + 1);
  }

  return (
    <AdminShell title="Customers" description="View customers and their order activity.">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-2xl font-semibold">Customer List</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Username</th>
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">City</th>
                  <th className="pb-2 font-medium">Orders</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100">
                    <td className="py-3">@{customer.username}</td>
                    <td className="py-3 font-semibold">{customer.name}</td>
                    <td className="py-3">{customer.email}</td>
                    <td className="py-3">{customer.phone || "-"}</td>
                    <td className="py-3">{customer.city || "-"}</td>
                    <td className="py-3">{orderCountByCustomer.get(customer.name.toLowerCase()) ?? 0}</td>
                    <td className="py-3">{customer.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                Total Customers:{" "}
                <span className="font-semibold text-slate-900">{customers.length}</span>
              </p>
              <p>
                Total Orders: <span className="font-semibold text-slate-900">{orders.length}</span>
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-lg font-semibold">Manage Users</p>
            <p className="mt-2 text-sm text-slate-600">
              Per te krijuar user te rinj manualisht, perdor panelin e users.
            </p>
            <Link
              href="/dashboard/users"
              className="mt-4 inline-block rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
            >
              Open Users
            </Link>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
