"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { clearCart, type CartItem, readCart, subscribeCartUpdates } from "@/lib/cart";

type CheckoutSuccess = {
  orderCount: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode: string | null;
  shippingMethod: string;
  paymentMethod: string;
};

type CheckoutFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  addressLine2: string;
  city: string;
  couponCode: string;
  password: string;
};

type ShippingOption = {
  code: string;
  label: string;
  eta: string;
  price: number;
};

type PaymentOption = {
  code: string;
  label: string;
};

type CheckoutOptions = {
  shipping: {
    freeThreshold: number;
    methods: ShippingOption[];
  };
  payments: {
    methods: PaymentOption[];
    bankTransferInstructions: string;
  };
};

const FALLBACK_OPTIONS: CheckoutOptions = {
  shipping: {
    freeThreshold: 120,
    methods: [
      {
        code: "standard",
        label: "Standard shipping",
        eta: "2-4 business days",
        price: 6,
      },
      {
        code: "express",
        label: "Express shipping",
        eta: "1-2 business days",
        price: 12,
      },
    ],
  },
  payments: {
    methods: [
      {
        code: "cad",
        label: "CAD (Cash on Delivery)",
      },
      {
        code: "bank_transfer",
        label: "Bank transfer",
      },
      {
        code: "stripe_demo",
        label: "Stripe demo",
      },
    ],
    bankTransferInstructions:
      "Use order ID as payment reference. Bank: Demo Bank, IBAN: AL47 2121 1009 0000 0002 3569 8741.",
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CHECKOUT_ORDER_NOTE_KEY = "bli-order-note";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [showOtherCountryPicker, setShowOtherCountryPicker] = useState(false);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [options, setOptions] = useState<CheckoutOptions>(FALLBACK_OPTIONS);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(FALLBACK_OPTIONS.shipping.methods[0]?.code ?? "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(FALLBACK_OPTIONS.payments.methods[0]?.code ?? "");
  const [couponDraft, setCouponDraft] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [mobileCouponOpen, setMobileCouponOpen] = useState(false);
  const [mobileItemsExpanded, setMobileItemsExpanded] = useState(false);
  const [fields, setFields] = useState<CheckoutFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Shqiperi",
    address: "",
    addressLine2: "",
    city: "",
    couponCode: "",
    password: "",
  });

  useEffect(() => {
    let canceled = false;

    const syncItems = async () => {
      const nextItems = await readCart();
      if (!canceled) {
        setItems(nextItems);
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
    if (items.length <= 1 && mobileItemsExpanded) {
      setMobileItemsExpanded(false);
    }
  }, [items.length, mobileItemsExpanded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStorage = window.localStorage.getItem(CHECKOUT_ORDER_NOTE_KEY) || "";
    if (!fromStorage) return;
    setOrderNote(fromStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!orderNote.trim()) {
      window.localStorage.removeItem(CHECKOUT_ORDER_NOTE_KEY);
      return;
    }
    window.localStorage.setItem(CHECKOUT_ORDER_NOTE_KEY, orderNote);
  }, [orderNote]);

  useEffect(() => {
    let canceled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          authenticated?: boolean;
          user?: {
            name?: string;
            surname?: string;
            email?: string;
            phone?: string;
            city?: string;
            address?: string;
          };
        };
        if (!data?.authenticated || !data.user || canceled) return;

        setIsAuthenticatedUser(true);
        setCreateAccount(false);
        setFields((prev) => ({
          ...prev,
          firstName: data.user?.name ?? prev.firstName,
          lastName: data.user?.surname ?? prev.lastName,
          email: data.user?.email ?? prev.email,
          phone: data.user?.phone ?? prev.phone,
          city: data.user?.city ?? prev.city,
          address: data.user?.address ?? prev.address,
        }));
      } catch {
        // Ignore; checkout still works for guest users.
      }
    }

    async function loadCheckoutOptions() {
      try {
        const response = await fetch("/api/checkout", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as CheckoutOptions;
        if (canceled) return;

        if (Array.isArray(data?.shipping?.methods) && data.shipping.methods.length > 0) {
          setOptions(data);
        }
      } catch {
        // fallback defaults remain
      }
    }

    void loadCurrentUser();
    void loadCheckoutOptions();

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    const availableShipping = options.shipping.methods;
    if (!availableShipping.some((method) => method.code === selectedShippingMethod)) {
      setSelectedShippingMethod(availableShipping[0]?.code ?? "");
    }
  }, [options.shipping.methods, selectedShippingMethod]);

  useEffect(() => {
    const availablePayments = options.payments.methods;
    if (!availablePayments.some((method) => method.code === selectedPaymentMethod)) {
      setSelectedPaymentMethod(availablePayments[0]?.code ?? "");
    }
  }, [options.payments.methods, selectedPaymentMethod]);

  useEffect(() => {
    if (!success || typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [success]);

  const updateField = (field: keyof CheckoutFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const hasDeliveryAddress = Boolean(fields.address.trim() && fields.city.trim() && fields.country.trim());

  const selectedShipping = useMemo(
    () => options.shipping.methods.find((method) => method.code === selectedShippingMethod) ?? null,
    [options.shipping.methods, selectedShippingMethod],
  );

  const shippingPreviewCost = useMemo(() => {
    if (!selectedShipping) return null;
    if (options.shipping.freeThreshold > 0 && subtotal >= options.shipping.freeThreshold) {
      return 0;
    }
    return selectedShipping.price;
  }, [options.shipping.freeThreshold, selectedShipping, subtotal]);

  const totalPreview = subtotal + (shippingPreviewCost ?? 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const mobilePrimaryItem = items[0] ?? null;
  const mobileHasHiddenItems = items.length > 1;

  const renderSummaryItem = (item: CartItem) => (
    <article key={item.id} className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-300 bg-white">
          {item.image ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${item.image}')` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">No image</div>
          )}
          <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white">
            {item.quantity}
          </span>
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-900">{item.name}</p>
        </div>
      </div>
      <p className="text-xl font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
    </article>
  );

  const handleApplyCoupon = () => {
    const normalized = couponDraft.trim().toUpperCase();
    setFields((prev) => ({ ...prev, couponCode: normalized }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) {
      setError("Shporta eshte bosh.");
      return;
    }

    if (!selectedShippingMethod) {
      setError("Zgjidh nje menyre dergese.");
      return;
    }

    if (!selectedPaymentMethod) {
      setError("Zgjidh nje menyre pagese.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const feedbackDelay = new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });

    const customerName = `${fields.firstName.trim()} ${fields.lastName.trim()}`.trim();
    const fullAddress = `${fields.address.trim()}${fields.addressLine2.trim() ? `, ${fields.addressLine2.trim()}` : ""}`;

    const payload = {
      customerName,
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      address: fullAddress,
      city: fields.city.trim(),
      country: fields.country.trim(),
      shippingMethod: selectedShippingMethod,
      paymentMethod: selectedPaymentMethod,
      couponCode: fields.couponCode.trim(),
      orderNote: orderNote.trim(),
      createAccount: !isAuthenticatedUser && createAccount,
      password: fields.password.trim(),
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
        shippingCost?: number;
        discount?: number;
        total?: number;
        couponCode?: string | null;
        orderId?: string;
        shippingMethod?: string;
        paymentMethod?: string;
      };

      await feedbackDelay;

      if (!response.ok) {
        setError(data.error ?? "Checkout deshtoi. Provo perseri.");
        return;
      }

      await clearCart();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CHECKOUT_ORDER_NOTE_KEY);
      }
      setSuccess({
        orderCount: data.orderCount ?? payload.items.length,
        subtotal: data.subtotal ?? subtotal,
        shippingCost: data.shippingCost ?? (shippingPreviewCost ?? 0),
        discount: data.discount ?? 0,
        total: data.total ?? totalPreview,
        couponCode: data.couponCode ?? null,
        shippingMethod: data.shippingMethod ?? selectedShippingMethod,
        paymentMethod: data.paymentMethod ?? selectedPaymentMethod,
      });
    } catch {
      await feedbackDelay;
      setError("Serveri nuk pergjigjet. Provo perseri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen overflow-x-clip bg-white text-slate-900">
        <section className="site-container px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
          <article className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">Pagesa u krye</p>
            <h1 className="mt-2 text-3xl font-bold">Porosia u krijua me sukses</h1>
            <p className="mt-3 text-sm text-slate-600">Porosite e krijuara: {success.orderCount}</p>
            <div className="mt-5 space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p>Nentotali: <span className="font-semibold">{formatCurrency(success.subtotal)}</span></p>
              <p>Transporti: <span className="font-semibold">{formatCurrency(success.shippingCost)}</span></p>
              <p>Zbritja: <span className="font-semibold">- {formatCurrency(success.discount)}</span></p>
              <p>Total: <span className="font-semibold">{formatCurrency(success.total)}</span></p>
              {success.couponCode ? <p>Kuponi: <span className="font-semibold">{success.couponCode}</span></p> : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f56bf]"
              >
                Vazhdo blerjet
              </Link>
              <Link
                href={isAuthenticatedUser ? "/my-account?tab=orders" : "/dashboard/orders"}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Shiko porosite
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900 lg:bg-[linear-gradient(to_right,#ffffff_50%,#f5f5f5_50%)]">
      <section className="site-container grid lg:min-h-screen lg:grid-cols-2 lg:items-start">
        <form id="checkout-form" onSubmit={handleSubmit} className="min-w-0 bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
          <div className="w-full max-w-[640px] space-y-8">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold leading-none">Contact</h2>
                {!isAuthenticatedUser ? (
                  <Link href="/login" className="text-sm font-medium text-[#1565d8] hover:underline">
                    Sign in
                  </Link>
                ) : null}
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={fields.email}
                onChange={(event) => updateField("email", event.target.value)}
                readOnly={isAuthenticatedUser}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#1565d8]"
              />
              <label className="mt-4 inline-flex items-center gap-2 text-base text-slate-700">
                <input
                  type="checkbox"
                  checked={emailMarketing}
                  onChange={(event) => setEmailMarketing(event.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 bg-white"
                />
                Email me with news and offers
              </label>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold leading-none">Delivery</h2>
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-2 text-xs text-slate-500">Shteti</span>
                    {showOtherCountryPicker ? (
                      <select
                        name="country"
                        value={fields.country}
                        onChange={(event) => updateField("country", event.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pb-2 pt-5 text-base outline-none transition focus:border-[#1565d8]"
                      >
                        <option value="Shqiperi">Shqiperi</option>
                        <option value="Kosove">Kosove</option>
                        <option value="Maqedonia e Veriut">Maqedonia e Veriut</option>
                      </select>
                    ) : (
                      <input
                        name="country"
                        type="text"
                        value="Shqiperi"
                        readOnly
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pb-2 pt-5 text-base outline-none"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setShowOtherCountryPicker((previous) => {
                        const next = !previous;
                        if (!next) {
                          updateField("country", "Shqiperi");
                        }
                        return next;
                      })
                    }
                    className={`h-12 rounded-xl border px-4 text-sm font-semibold transition ${
                      showOtherCountryPicker
                        ? "border-[#1565d8] text-[#1565d8] hover:bg-blue-50"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Shtet tjeter?
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    name="firstName"
                    type="text"
                    placeholder="First name (optional)"
                    value={fields.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#1565d8]"
                  />
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    required
                    value={fields.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#1565d8]"
                  />
                </div>

                <div>
                  <div className="relative">
                    <input
                      name="address"
                      type="text"
                      placeholder="Address"
                      required
                      value={fields.address}
                      onChange={(event) => updateField("address", event.target.value)}
                      readOnly={isAuthenticatedUser}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-base outline-none transition focus:border-[#1565d8]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8h.01M11 12h1v4h1" />
                    </svg>
                    Add a house number if you have one
                  </p>
                </div>

                <input
                  name="addressLine2"
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={fields.addressLine2}
                  onChange={(event) => updateField("addressLine2", event.target.value)}
                  readOnly={isAuthenticatedUser}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#1565d8]"
                />

                <input
                  name="city"
                  type="text"
                  placeholder="Qyteti"
                  required
                  value={fields.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  readOnly={isAuthenticatedUser}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#1565d8]"
                />

                <input
                  name="phone"
                  type="text"
                  placeholder="Phone"
                  required
                  value={fields.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  readOnly={isAuthenticatedUser}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-[#1565d8]"
                />

                {!isAuthenticatedUser ? (
                  <>
                    <label className="inline-flex items-center gap-2 text-base text-slate-700">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(event) => setCreateAccount(event.target.checked)}
                        className="h-5 w-5 rounded border-slate-300"
                      />
                      Create account with this email
                    </label>
                    {createAccount ? (
                      <input
                        name="password"
                        type="password"
                        minLength={6}
                        required
                        value={fields.password}
                        onChange={(event) => updateField("password", event.target.value)}
                        placeholder="Password (min 6 chars)"
                        className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-[#1565d8]"
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold leading-none">Menyra e dergeses</h2>
              {!hasDeliveryAddress ? (
                <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-5 text-center text-base text-slate-500">
                  Ploteso adresen e dergeses per te pare menyrat e dergeses.
                </div>
              ) : (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {options.shipping.methods.map((method) => {
                    const isSelected = selectedShippingMethod === method.code;
                    const label =
                      method.code === "standard"
                        ? "Dergese standarde"
                        : method.code === "express"
                          ? "Dergese ekspres"
                          : method.label;
                    const methodPrice = options.shipping.freeThreshold > 0 && subtotal >= options.shipping.freeThreshold
                      ? 0
                      : method.price;
                    return (
                      <label
                        key={method.code}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-3 transition ${
                          isSelected ? "border-[#1565d8] bg-white" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.code}
                            checked={isSelected}
                            onChange={() => setSelectedShippingMethod(method.code)}
                            className="h-4 w-4 border-slate-300"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-800">{label}</span>
                            <span className="block text-xs text-slate-500">{method.eta}</span>
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(methodPrice)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold leading-none">Payment</h2>
              <p className="mt-2 text-base text-slate-500">All transactions are secure and encrypted.</p>

              <div className="mt-3 space-y-2">
                {options.payments.methods.map((method) => {
                  const isSelected = selectedPaymentMethod === method.code;
                  return (
                    <label
                      key={method.code}
                      className={`block cursor-pointer rounded-xl border px-4 py-3 transition ${
                        isSelected ? "border-[#1565d8] bg-white" : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.code}
                          checked={isSelected}
                          onChange={() => setSelectedPaymentMethod(method.code)}
                          className="h-4 w-4 border-slate-300"
                        />
                        <span className="text-base font-medium text-slate-800">{method.label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedPaymentMethod === "stripe_demo" ? (
                <div className="mt-3 space-y-3 rounded-xl border border-slate-300 bg-slate-50 p-4">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-[#1565d8]"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Expiration date (MM / YY)"
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-[#1565d8]"
                    />
                    <input
                      type="text"
                      placeholder="Security code"
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-[#1565d8]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-[#1565d8]"
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={useShippingAsBilling}
                      onChange={(event) => setUseShippingAsBilling(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Use shipping address as billing address
                  </label>
                </div>
              ) : null}

              {selectedPaymentMethod === "bank_transfer" ? (
                <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                  {options.payments.bankTransferInstructions}
                </div>
              ) : null}

              {selectedPaymentMethod === "cad" ? (
                <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
                  Pay in cash when your order is delivered.
                </div>
              ) : null}
            </section>

            <section>
              <h2 className="mb-3 text-[18px] font-semibold leading-none">Shenim per porosine</h2>
              <textarea
                value={orderNote}
                onChange={(event) => setOrderNote(event.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Shkruaj nje shenim per porosine (opsionale)"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-[#1565d8]"
              />
            </section>

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative hidden h-12 w-full cursor-pointer rounded-xl bg-[#1565d8] text-xl font-semibold text-white transition hover:bg-[#0f56bf] disabled:cursor-not-allowed disabled:bg-slate-500 sm:block"
            >
              <span className="inline-flex h-full w-full items-center justify-center pr-10">
                {isSubmitting ? "Po paguhet..." : "Paguaj tani"}
              </span>
              {isSubmitting ? (
                <span className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-1 text-[#1565d8] shadow-sm ring-1 ring-white/60">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-35" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              ) : null}
            </button>
          </div>
        </form>

        <aside className="min-w-0 bg-[#f5f5f5] lg:sticky lg:top-0 lg:self-start">
          <div className="w-full space-y-4 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10 lg:max-h-screen lg:overflow-y-auto">
            <div className="hidden space-y-3 sm:block">
              {items.map((item) => renderSummaryItem(item))}
            </div>

            <div className="space-y-2 sm:hidden">
              {mobilePrimaryItem ? renderSummaryItem(mobilePrimaryItem) : null}
              {mobileHasHiddenItems ? (
                <button
                  type="button"
                  onClick={() => setMobileItemsExpanded((open) => !open)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left transition hover:bg-slate-100"
                  aria-expanded={mobileItemsExpanded}
                >
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{totalItems} items</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {mobileItemsExpanded ? "Hide items" : "Show all items"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Total</span>
                    <span className="text-base font-semibold text-slate-900">{formatCurrency(totalPreview)}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`h-4 w-4 text-slate-600 transition-transform ${mobileItemsExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
              ) : null}
              {mobileHasHiddenItems && mobileItemsExpanded ? (
                <div className="space-y-3 border-t border-slate-300 pt-3">
                  {items.slice(1).map((item) => renderSummaryItem(item))}
                </div>
              ) : null}
            </div>

            <div className="pt-2">
              <div className="hidden gap-2 sm:flex">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={couponDraft}
                  onChange={(event) => setCouponDraft(event.target.value)}
                  className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-[#1565d8]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-xl font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Apply
                </button>
              </div>

              <div className="sm:hidden">
                {!mobileCouponOpen ? (
                  <button
                    type="button"
                    onClick={() => setMobileCouponOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" />
                      <path d="M9 9h.01M15 15h.01M10 14l4-4" />
                    </svg>
                    Add coupon code
                  </button>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={couponDraft}
                      onChange={(event) => setCouponDraft(event.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-20 text-base outline-none focus:border-[#1565d8]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-300 pt-3 text-xl">
              <div className="flex items-center justify-between text-slate-700">
                <span>Subtotal - {totalItems} items</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Shipping</span>
                <span>
                  {shippingPreviewCost === null ? "No shipping methods" : formatCurrency(shippingPreviewCost)}
                </span>
              </div>
              {fields.couponCode ? (
                <div className="flex items-center justify-between text-slate-700">
                  <span>Coupon</span>
                  <span>{fields.couponCode}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-end justify-between border-t border-slate-300 pt-4">
              <span className="text-2xl font-semibold">Total</span>
              <div className="text-right">
                <p className="text-sm uppercase tracking-wide text-slate-500">USD</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPreview)}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="bg-[#f5f5f5] px-4 pb-6 sm:hidden">
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="relative h-12 w-full cursor-pointer rounded-xl bg-[#1565d8] text-xl font-semibold text-white transition hover:bg-[#0f56bf] disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            <span className="inline-flex h-full w-full items-center justify-center pr-10">
              {isSubmitting ? "Po paguhet..." : "Paguaj tani"}
            </span>
            {isSubmitting ? (
              <span className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-1 text-[#1565d8] shadow-sm ring-1 ring-white/60">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-35" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            ) : null}
          </button>
        </div>
      </section>
    </main>
  );
}
