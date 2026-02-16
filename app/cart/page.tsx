"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type CartItem,
  readCart,
  removeCartItem,
  subscribeCartUpdates,
  updateCartItemQuantity,
} from "@/lib/cart";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncItems = () => setItems(readCart());
    syncItems();
    return subscribeCartUpdates(syncItems);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[1440px] py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Cart</p>
          <h1 className="mt-2 text-4xl font-bold">Shporta juaj</h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Kontrollo produktet, ndrysho sasite dhe vazhdo te checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold">Shporta eshte bosh</p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Shko te Shop
            </Link>
          </article>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid items-center gap-4 rounded-xl border border-slate-100 p-4 md:grid-cols-[84px_1fr_auto_auto]"
                  >
                    <div
                      className="h-20 w-full rounded-lg bg-cover bg-center"
                      style={{
                        backgroundImage: item.image
                          ? `url('${item.image}')`
                          : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                      }}
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="h-8 w-8 rounded-lg border border-slate-300 text-sm font-semibold"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-lg border border-slate-300 text-sm font-semibold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold">Order Summary</p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-5 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Vazhdoni ne Checkout
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
