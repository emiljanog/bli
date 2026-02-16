import { AdminShell } from "@/components/admin-shell";
import { addCouponAction, setCouponStatusAction } from "@/app/dashboard/actions";
import { listCoupons } from "@/lib/shop-store";

export default async function AdminCouponsPage() {
  const coupons = listCoupons();

  return (
    <AdminShell title="Coupons" description="Create coupons and enable discounts in checkout.">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-2xl font-semibold">Coupon List</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Min Subtotal</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-slate-100">
                    <td className="py-3 font-semibold">{coupon.code}</td>
                    <td className="py-3">{coupon.description || "-"}</td>
                    <td className="py-3">{coupon.type === "percent" ? "Percent" : "Fixed"}</td>
                    <td className="py-3">
                      {coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td className="py-3">${coupon.minSubtotal}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          coupon.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <form action={setCouponStatusAction}>
                        <input type="hidden" name="couponId" value={coupon.id} />
                        <input type="hidden" name="isActive" value={coupon.isActive ? "0" : "1"} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          {coupon.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-2xl font-semibold">Create Coupon</p>
          <form action={addCouponAction} className="mt-4 space-y-3">
            <input
              name="code"
              type="text"
              placeholder="Code (WELCOME10)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-slate-500"
              required
            />
            <input
              name="description"
              type="text"
              placeholder="Description"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <select
              name="type"
              defaultValue="percent"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
            <input
              name="value"
              type="number"
              min="1"
              step="0.01"
              placeholder="Value"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
            <input
              name="minSubtotal"
              type="number"
              min="0"
              step="0.01"
              placeholder="Minimum subtotal"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input name="isActive" type="checkbox" defaultChecked />
              Active
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#ff8a00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ea7f00]"
            >
              Save Coupon
            </button>
          </form>
        </article>
      </div>
    </AdminShell>
  );
}
