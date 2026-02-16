"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearCart, type CartItem, readCart, subscribeCartUpdates } from "@/lib/cart";

type CheckoutSuccess = {
  orderCount: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);
  const [createAccount, setCreateAccount] = useState(false);

  useEffect(() => {
    const syncItems = () => setItems(readCart());
    syncItems();
    return subscribeCartUpdates(syncItems);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const handleSubmit = async (formData: FormData) => {
    if (items.length === 0) {
      setError("Shporta eshte bosh.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      customerName: String(formData.get("customerName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      couponCode: String(formData.get("couponCode") ?? "").trim(),
      createAccount: formData.get("createAccount") === "on",
      password: String(formData.get("password") ?? "").trim(),
      items,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        orderCount?: number;
        subtotal?: number;
        discount?: number;
        total?: number;
        couponCode?: string | null;
      };

      if (!response.ok) {
        setError(data.error ?? "Checkout deshtoi. Provo perseri.");
        return;
      }

      clearCart();
      setSuccess({
        orderCount: data.orderCount ?? payload.items.length,
        subtotal: data.subtotal ?? total,
        discount: data.discount ?? 0,
        total: data.total ?? total,
        couponCode: data.couponCode ?? null,
      });
    } catch {
      setError("Nuk u arrit serveri. Provo perseri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="text-slate-900">
        <section className="mx-auto w-[90%] max-w-[800px] py-10 md:py-14">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Payment Complete</p>
            <h1 className="mt-2 text-3xl font-bold">Blerja u krye me sukses</h1>
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              U krijuan {success.orderCount} porosi.
            </p>
            <div className="mt-4 inline-flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm">
              <p>
                Subtotal: <span className="font-semibold">{formatCurrency(success.subtotal)}</span>
              </p>
              <p>
                Zbritje: <span className="font-semibold">- {formatCurrency(success.discount)}</span>
              </p>
              <p>
                Total: <span className="font-semibold">{formatCurrency(success.total)}</span>
              </p>
              {success.couponCode ? (
                <p>
                  Coupon: <span className="font-semibold">{success.couponCode}</span>
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Vazhdo Shopping
              </Link>
              <Link
                href="/dashboard/orders"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Shiko Orders (Admin)
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[1440px] py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Checkout</p>
          <h1 className="mt-2 text-4xl font-bold">Perfundo blerjen</h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Ploteso te dhenat dhe konfirmo porosine.
          </p>
        </div>

        {items.length === 0 ? (
          <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold">Nuk ka produkte per checkout</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/cart"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Kthehu te Cart
              </Link>
              <Link
                href="/shop"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Shko te Shop
              </Link>
            </div>
          </article>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <form
              action={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xl font-semibold">Te dhenat e bleresit</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  name="customerName"
                  type="text"
                  placeholder="Emri i plote"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <input
                  name="phone"
                  type="text"
                  placeholder="Telefoni"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <input
                  name="city"
                  type="text"
                  placeholder="Qyteti"
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
              <textarea
                name="address"
                rows={4}
                placeholder="Adresa e plote"
                required
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <input
                name="couponCode"
                type="text"
                placeholder="Coupon code (opsionale)"
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-slate-500"
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <input
                  name="createAccount"
                  type="checkbox"
                  checked={createAccount}
                  onChange={(event) => setCreateAccount(event.target.checked)}
                />
                Krijo account me keto te dhena
              </label>
              {createAccount ? (
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  placeholder="Password (min 6 karaktere)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              ) : null}

              {error ? (
                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isSubmitting ? "Duke procesuar..." : "Perfundo blerjen"}
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold">Order Summary</p>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700">
                      {item.name} <span className="text-slate-500">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
