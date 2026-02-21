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

type TopProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  price: number;
};

type SiteCartDrawerProps = {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
};

const FREE_SHIPPING_TARGET = 50;
const CHECKOUT_ORDER_NOTE_KEY = "bli-order-note";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SiteCartDrawer({ open, onClose, isLoggedIn }: SiteCartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [recommendations, setRecommendations] = useState<TopProduct[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);

  useEffect(() => {
    let canceled = false;

    const syncItems = async () => {
      const next = await readCart();
      if (!canceled) {
        setItems(next);
      }
    };

    void syncItems();
    const unsubscribe = subscribeCartUpdates(() => {
      void syncItems();
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    let canceled = false;

    const syncOnOpen = async () => {
      const next = await readCart();
      if (!canceled) {
        setItems(next);
      }
    };

    void syncOnOpen();
    return () => {
      canceled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || items.length > 0 || recommendations.length > 0) return;
    let canceled = false;
    const controller = new AbortController();

    const loadRecommendations = async () => {
      setRecommendationLoading(true);
      try {
        const response = await fetch("/api/products/top?limit=3", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { products?: TopProduct[] };
        if (!canceled) {
          setRecommendations(Array.isArray(payload.products) ? payload.products : []);
        }
      } catch {
        if (!canceled) {
          setRecommendations([]);
        }
      } finally {
        if (!canceled) {
          setRecommendationLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [open, items.length, recommendations.length]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const fromStorage = window.localStorage.getItem(CHECKOUT_ORDER_NOTE_KEY) || "";
    if (fromStorage) {
      setOrderNote(fromStorage);
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!orderNote.trim()) {
      window.localStorage.removeItem(CHECKOUT_ORDER_NOTE_KEY);
      return;
    }
    window.localStorage.setItem(CHECKOUT_ORDER_NOTE_KEY, orderNote);
  }, [orderNote]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const discountAmount = Math.min(subtotal, couponApplied?.discount ?? 0);
  const checkoutTotal = Math.max(0, subtotal - discountAmount);
  const appliedCouponCode = couponApplied?.code ?? "";

  useEffect(() => {
    if (!appliedCouponCode || subtotal <= 0) return;
    let canceled = false;
    const controller = new AbortController();

    const revalidateCoupon = async () => {
      try {
        const response = await fetch("/api/coupons/apply", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCouponCode, subtotal }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          discount?: number;
          coupon?: { code?: string; description?: string } | null;
        };

        if (canceled) return;
        if (!response.ok) {
          setCouponApplied(null);
          setCouponError(payload.error || "Kuponi nuk eshte me valid per kete subtotal.");
          return;
        }

        const discount = Number(payload.discount);
        setCouponApplied((previous) => {
          if (!previous) return previous;
          return {
            code: payload.coupon?.code || appliedCouponCode,
            discount: Number.isFinite(discount) ? discount : 0,
            description: payload.coupon?.description || previous.description || "",
          };
        });
      } catch {
        if (!canceled) {
          setCouponApplied(null);
          setCouponError("Kuponi nuk mund te verifikohet tani.");
        }
      }
    };

    void revalidateCoupon();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [subtotal, appliedCouponCode]);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_TARGET - subtotal);
  const shippingProgress = Math.max(0, Math.min(100, Math.round((subtotal / FREE_SHIPPING_TARGET) * 100)));

  const handleDecrease = async (itemId: string, quantity: number) => {
    const next = await updateCartItemQuantity(itemId, Math.max(1, quantity - 1));
    setItems(next);
  };

  const handleIncrease = async (itemId: string, quantity: number) => {
    const next = await updateCartItemQuantity(itemId, quantity + 1);
    setItems(next);
  };

  const handleRemove = async (itemId: string) => {
    const next = await removeCartItem(itemId);
    setItems(next);
  };

  const handleApplyCoupon = async () => {
    if (couponApplying) return;
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Vendos kodin e kuponit.");
      return;
    }

    setCouponApplying(true);
    setCouponError("");
    try {
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        discount?: number;
        coupon?: { code?: string; description?: string } | null;
      };
      if (!response.ok) {
        setCouponApplied(null);
        setCouponError(payload.error || "Kuponi nuk u aplikua.");
        return;
      }

      const discount = Number(payload.discount);
      setCouponApplied({
        code: payload.coupon?.code || code,
        discount: Number.isFinite(discount) ? discount : 0,
        description: payload.coupon?.description || "",
      });
      setCouponInput("");
    } catch {
      setCouponApplied(null);
      setCouponError("Gabim gjate aplikimit te kuponit.");
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponError("");
  };

  return (
    <div
      className={`fixed inset-0 z-[220] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close cart drawer overlay"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/35 transition ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your Cart"
        className={`absolute bottom-[15px] right-[15px] top-[15px] h-[calc(100%-30px)] w-[min(560px,calc(100vw-30px))] overflow-y-auto rounded-3xl bg-[#efefef] p-[15px] shadow-2xl transition duration-200 ${
          open ? "translate-x-0 opacity-100" : "translate-x-[calc(100%+42px)] opacity-0"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[1.55rem] font-semibold leading-none text-slate-900 md:text-[1.75rem]">Your Cart</p>
          <button
            type="button"
            aria-label="Close cart drawer"
            onClick={onClose}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-white/80"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length > 0 ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-base text-slate-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-700">
                    <path d="M1 3h13v11H1z" />
                    <path d="M14 8h4l4 3v3h-8z" />
                    <circle cx="5.5" cy="17.5" r="1.5" />
                    <circle cx="17.5" cy="17.5" r="1.5" />
                  </svg>
                  {remainingForFreeShipping > 0
                    ? `Spend ${formatCurrency(remainingForFreeShipping)} for free shipping`
                    : "Free shipping unlocked"}
                </p>
                <span className="text-xs font-semibold text-slate-500">{shippingProgress}%</span>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-300">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-2.5">
                  <div className="grid gap-2.5 sm:grid-cols-[172px_1fr]">
                    <div
                      className="aspect-video w-full rounded-xl bg-slate-100 bg-cover bg-center"
                      style={{
                        backgroundImage: item.image
                          ? `url('${item.image}')`
                          : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                      }}
                    />
                    <div>
                      <p className="line-clamp-2 text-base font-semibold leading-tight text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-700">{formatCurrency(item.price)}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-100">
                          <button
                            type="button"
                            onClick={() => void handleDecrease(item.id, item.quantity)}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-base font-semibold text-slate-800 transition hover:bg-slate-200"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            -
                          </button>
                          <span className="inline-flex min-w-8 items-center justify-center text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleIncrease(item.id, item.quantity)}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-base font-semibold text-slate-800 transition hover:bg-slate-200"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleRemove(item.id)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 10v6M14 10v6" />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-2 text-[1.1rem] font-semibold leading-none text-[#3558ff]">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-300 pt-5">
              <button
                type="button"
                onClick={() => setInstructionsOpen((openState) => !openState)}
                className="flex w-full cursor-pointer items-center justify-between border-b border-slate-300 pb-3 text-left text-xl font-medium text-slate-900"
              >
                <span>Order special instructions</span>
                <span className="text-2xl leading-none">{instructionsOpen ? "-" : "+"}</span>
              </button>
              {instructionsOpen ? (
                <div className="rounded-xl border border-slate-300 bg-white p-3">
                  <textarea
                    value={orderNote}
                    onChange={(event) => setOrderNote(event.target.value)}
                    rows={4}
                    placeholder="Shkruaj nje note per porosine..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setDiscountOpen((openState) => !openState)}
                className="flex w-full cursor-pointer items-center justify-between border-b border-slate-300 pb-3 text-left text-xl font-medium text-slate-900"
              >
                <span>Discount</span>
                <span className="text-2xl leading-none">{discountOpen ? "-" : "+"}</span>
              </button>
              {discountOpen ? (
                <div className="rounded-xl border border-slate-300 bg-white p-3">
                  {couponApplied ? (
                    <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                      <p className="font-semibold text-emerald-800">
                        Kuponi {couponApplied.code} u aplikua: -{formatCurrency(couponApplied.discount)}
                      </p>
                      {couponApplied.description ? (
                        <p className="mt-1 text-emerald-700">{couponApplied.description}</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="mt-2 cursor-pointer text-xs font-semibold text-emerald-800 underline"
                      >
                        Hiqe kuponin
                      </button>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value.toUpperCase());
                        if (couponError) {
                          setCouponError("");
                        }
                      }}
                      placeholder="Coupon code"
                      className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm uppercase outline-none focus:border-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      disabled={couponApplying}
                      className="h-10 cursor-pointer rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {couponApplying ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  {couponError ? <p className="mt-2 text-sm font-medium text-rose-700">{couponError}</p> : null}
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <p className="text-[2rem] font-semibold leading-tight text-slate-900">
                Subtotal: {formatCurrency(checkoutTotal)} USD
              </p>
              {discountAmount > 0 ? (
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  Discount applied: -{formatCurrency(discountAmount)}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-slate-600">
                Tax included. Shipping and discounts calculated at checkout.
              </p>
              <div className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />
                <p>
                  Pranoj{" "}
                  <Link href="/terms" onClick={onClose} className="font-semibold text-[#3558ff] hover:underline">
                    Termat
                  </Link>{" "}
                  dhe{" "}
                  <Link href="/conditions" onClick={onClose} className="font-semibold text-[#3558ff] hover:underline">
                    Kushtet
                  </Link>
                  .
                </p>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className={`mt-5 block rounded-xl px-5 py-3 text-center text-lg font-semibold text-white transition ${
                  acceptedTerms
                    ? "cursor-pointer bg-[#3ea26d] hover:bg-[#31825a]"
                    : "pointer-events-none bg-[#b8d6be] text-white/80"
                }`}
              >
                Vazhdo te pagesa
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="17" cy="20" r="1.5" />
                  <path d="M3 4h2l2.5 11h10.5l2-8H7" />
                </svg>
              </div>
              <p className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-[2rem]">Your Cart is Empty</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#3558ff] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#2744dd]"
              >
                Continue Shopping
              </Link>
              {!isLoggedIn ? (
                <p className="mt-6 text-base text-slate-700">
                  Have an account?{" "}
                  <Link href="/login" onClick={onClose} className="font-semibold text-[#3558ff] hover:underline">
                    Log in
                  </Link>{" "}
                  to check out faster.
                </p>
              ) : null}
            </div>

            <div className="mt-8 border-t border-slate-300 pt-6">
              <p className="text-2xl font-semibold text-slate-900">Top products of this week</p>
              {recommendationLoading ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`top-product-loading-${index}`} className="space-y-2">
                      <div className="route-loading-shimmer h-36 overflow-hidden rounded-xl bg-slate-200" />
                      <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
                      <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {recommendations.map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="group rounded-xl border border-slate-200 bg-white p-2 transition hover:border-slate-300"
                    >
                      <div
                        className="h-32 rounded-lg bg-slate-100 bg-cover bg-center"
                        style={{ backgroundImage: `url('${product.image}')` }}
                      />
                      <p className="mt-2 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {product.category}
                      </p>
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-2xl font-bold leading-none text-[#3558ff]">{formatCurrency(product.price)}</p>
                      {index === 0 ? (
                        <span className="mt-2 inline-flex rounded-lg bg-[#ff8a00] px-2 py-1 text-[11px] font-semibold text-white">
                          Bestseller
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No featured products available yet.</p>
              )}
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-300 pt-4">
          <Link href="/shop" onClick={onClose} className="text-lg font-semibold text-[#3558ff] hover:underline">
            Continue Shopping
          </Link>
          <Link href="/cart" onClick={onClose} className="text-lg font-semibold text-[#3558ff] hover:underline">
            View Cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
