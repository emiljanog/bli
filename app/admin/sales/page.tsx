import { AdminShell } from "@/components/admin-shell";
import { addSaleAction } from "@/app/admin/actions";
import { listSales } from "@/lib/shop-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminSalesPage() {
  const sales = listSales();
  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <AdminShell title="Sales" description="Track and record sales channels.">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-2xl font-semibold">Sales History</p>
            <span className="rounded-lg bg-[#f4e4cf] px-3 py-1 text-sm font-semibold">
              Total: {formatCurrency(total)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Sale ID</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100">
                    <td className="py-3 font-semibold">{sale.id}</td>
                    <td className="py-3">{sale.source}</td>
                    <td className="py-3">{sale.createdAt}</td>
                    <td className="py-3">{formatCurrency(sale.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-semibold">Add Sale</p>
          <form action={addSaleAction} className="mt-4 space-y-3">
            <input
              name="source"
              type="text"
              placeholder="Source (Website, Instagram...)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <input
              name="amount"
              type="number"
              min="1"
              placeholder="Amount"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <input
              name="createdAt"
              type="date"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
            >
              Save Sale
            </button>
          </form>
        </article>
      </div>
    </AdminShell>
  );
}
