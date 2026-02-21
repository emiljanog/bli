import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_VALUE, ADMIN_USERNAME_COOKIE_NAME } from "@/lib/admin-auth";
import {
  addOrder,
  addProduct,
  addSale,
  addUser,
  applyCoupon,
  findUserByUsername,
  getSiteSettings,
  listProducts,
} from "@/lib/shop-store";

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type PreparedOrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
};

type ShippingMethodCode = "standard" | "express";
type PaymentMethodCode = "cad" | "bank_transfer" | "stripe_demo";

type CheckoutShippingOption = {
  code: ShippingMethodCode;
  label: string;
  eta: string;
  price: number;
};

type CheckoutPaymentOption = {
  code: PaymentMethodCode;
  label: string;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

function parseItems(input: unknown): CheckoutItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: asString(row.id),
        name: asString(row.name),
        price: asNumber(row.price),
        quantity: Math.max(1, Math.floor(asNumber(row.quantity))),
      };
    })
    .filter((item) => item.id && item.name && item.price > 0 && item.quantity > 0);
}

function getShippingOptions() {
  const settings = getSiteSettings();
  const options: CheckoutShippingOption[] = [];

  if (settings.shippingStandardEnabled) {
    options.push({
      code: "standard",
      label: settings.shippingStandardLabel,
      eta: settings.shippingStandardEta,
      price: Math.max(0, Number(settings.shippingStandardPrice) || 0),
    });
  }

  if (settings.shippingExpressEnabled) {
    options.push({
      code: "express",
      label: settings.shippingExpressLabel,
      eta: settings.shippingExpressEta,
      price: Math.max(0, Number(settings.shippingExpressPrice) || 0),
    });
  }

  if (options.length === 0) {
    options.push({
      code: "standard",
      label: "Standard shipping",
      eta: "2-4 business days",
      price: 0,
    });
  }

  return {
    freeThreshold: Math.max(0, Number(settings.shippingFreeThreshold) || 0),
    methods: options,
  };
}

function getPaymentOptions() {
  const settings = getSiteSettings();
  const methods: CheckoutPaymentOption[] = [];

  if (settings.paymentCadEnabled) {
    methods.push({
      code: "cad",
      label: "CAD (Cash on Delivery)",
    });
  }

  if (settings.paymentBankTransferEnabled) {
    methods.push({
      code: "bank_transfer",
      label: "Bank transfer",
    });
  }

  if (settings.paymentStripeDemoEnabled) {
    methods.push({
      code: "stripe_demo",
      label: "Stripe demo",
    });
  }

  if (methods.length === 0) {
    methods.push({
      code: "stripe_demo",
      label: "Stripe demo",
    });
  }

  return {
    methods,
    bankTransferInstructions: settings.paymentBankTransferInstructions,
  };
}

export async function GET() {
  const shipping = getShippingOptions();
  const payments = getPaymentOptions();

  return NextResponse.json({
    shipping,
    payments,
  });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = (await request.json()) as Record<string, unknown>;
    const customerNameInput = asString(body.customerName);
    const emailInput = asString(body.email);
    const phoneInput = asString(body.phone);
    const addressInput = asString(body.address);
    const cityInput = asString(body.city);
    const stateInput = asString(body.state);
    const zipInput = asString(body.zip);
    const countryInput = asString(body.country);
    const couponCode = asString(body.couponCode);
    const orderNote = asString(body.orderNote);
    const shippingMethodInput = asString(body.shippingMethod);
    const paymentMethodInput = asString(body.paymentMethod);
    const createAccount = asBoolean(body.createAccount);
    const password = asString(body.password);
    const items = parseItems(body.items);

    const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
    const sessionUsername = isLoggedIn ? asString(cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value ?? "") : "";
    const authenticatedUser = sessionUsername ? findUserByUsername(sessionUsername) : null;
    const activeAuthenticatedUser =
      authenticatedUser && authenticatedUser.isActive ? authenticatedUser : null;

    const customerName = activeAuthenticatedUser
      ? `${activeAuthenticatedUser.name} ${activeAuthenticatedUser.surname}`.trim() ||
        activeAuthenticatedUser.username
      : customerNameInput;
    const email = activeAuthenticatedUser ? activeAuthenticatedUser.email : emailInput;
    const phone = activeAuthenticatedUser?.phone || phoneInput;
    const address = activeAuthenticatedUser?.address || addressInput;
    const city = activeAuthenticatedUser?.city || cityInput;
    const state = stateInput;
    const zip = zipInput;
    const country = countryInput;

    const shippingSettings = getShippingOptions();
    const selectedShippingMethod =
      shippingSettings.methods.find((method) => method.code === shippingMethodInput) ||
      shippingSettings.methods[0];
    const paymentSettings = getPaymentOptions();
    const selectedPaymentMethod =
      paymentSettings.methods.find((method) => method.code === paymentMethodInput) ||
      paymentSettings.methods[0];

    if (!customerName || !email || !phone || !address || !city || !country || items.length === 0) {
      return NextResponse.json(
        { error: "Te dhenat e checkout nuk jane te plota." },
        { status: 400 },
      );
    }
    if (!selectedShippingMethod) {
      return NextResponse.json({ error: "No shipping method is available." }, { status: 400 });
    }
    if (!selectedPaymentMethod) {
      return NextResponse.json({ error: "No payment method is available." }, { status: 400 });
    }

    if (!activeAuthenticatedUser && createAccount && password.length < 6) {
      return NextResponse.json(
        { error: "Password duhet te jete te pakten 6 karaktere per regjistrim." },
        { status: 400 },
      );
    }

    const knownProducts = listProducts();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const couponResult = applyCoupon(couponCode, subtotal);
    if (couponResult.error) {
      return NextResponse.json({ error: couponResult.error }, { status: 400 });
    }

    let orderUserId: string | null = activeAuthenticatedUser?.id ?? null;
    if (!orderUserId && createAccount) {
      const [firstName, ...surnameParts] = customerName.split(/\s+/).filter(Boolean);
      const createdUser = addUser({
        name: firstName || customerName,
        surname: surnameParts.join(" "),
        email,
        password,
        phone,
        city,
        address,
        source: "Checkout",
      });

      if (!createdUser) {
        return NextResponse.json(
          {
            error:
              "Nuk u krijua account-i. Kontrollo email-in (mund te ekzistoje) dhe password-in.",
          },
          { status: 400 },
        );
      }

      orderUserId = createdUser.id;
    }

    const discount = couponResult.discount;
    const shippingCost =
      shippingSettings.freeThreshold > 0 && subtotal >= shippingSettings.freeThreshold
        ? 0
        : selectedShippingMethod.price;
    const total = Math.max(0, Number((subtotal - discount + shippingCost).toFixed(2)));

    const preparedItems: PreparedOrderItem[] = [];
    let allocatedDiscount = 0;
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const byId = knownProducts.find((product) => product.id === item.id);
      const byName = knownProducts.find(
        (product) => product.name.toLowerCase() === item.name.toLowerCase(),
      );

      const productId =
        byId?.id ??
        byName?.id ??
        addProduct({
          name: item.name,
          category: "Electronics",
          price: item.price,
          stock: 999,
        }).id;

      const itemSubtotal = item.price * item.quantity;
      const itemDiscount =
        index === items.length - 1
          ? Math.max(0, Number((discount - allocatedDiscount).toFixed(2)))
          : Math.max(0, Number(((discount * itemSubtotal) / subtotal).toFixed(2)));
      allocatedDiscount += itemDiscount;
      const itemTotal = Math.max(0, Number((itemSubtotal - itemDiscount).toFixed(2)));

      preparedItems.push({
        productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: itemDiscount,
        total: itemTotal,
      });
    }

    const createdOrder = addOrder({
      customer: `${customerName}${state || zip ? ` (${state || "State"} ${zip || ""})` : ""}`.trim(),
      userId: orderUserId,
      items: preparedItems,
      total,
      discount,
      couponCode: couponResult.coupon?.code ?? null,
      note: orderNote,
      status: "Paid",
    });

    addSale({
      source: "Website Checkout",
      amount: total,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/coupons");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/users");
    revalidatePath("/shop");
    revalidatePath("/checkout");

    return NextResponse.json({
      success: true,
      orderCount: 1,
      orderId: createdOrder.id,
      subtotal,
      shippingCost,
      discount,
      total,
      couponCode: couponResult.coupon?.code ?? null,
      shippingMethod: selectedShippingMethod.code,
      paymentMethod: selectedPaymentMethod.code,
      country,
    });
  } catch {
    return NextResponse.json({ error: "Checkout deshtoi ne server." }, { status: 500 });
  }
}
