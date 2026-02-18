import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_VALUE, ADMIN_USERNAME_COOKIE_NAME } from "@/lib/admin-auth";
import { addOrder, addProduct, addSale, addUser, applyCoupon, findUserByUsername, listProducts } from "@/lib/shop-store";

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = (await request.json()) as Record<string, unknown>;
    const customerNameInput = asString(body.customerName);
    const emailInput = asString(body.email);
    const phoneInput = asString(body.phone);
    const addressInput = asString(body.address);
    const cityInput = asString(body.city);
    const couponCode = asString(body.couponCode);
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

    if (!customerName || !email || !phone || !address || !city || items.length === 0) {
      return NextResponse.json(
        { error: "Te dhenat e checkout nuk jane te plota." },
        { status: 400 },
      );
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
    const total = Math.max(0, Number((subtotal - discount).toFixed(2)));

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

      addOrder({
        customer: customerName,
        userId: orderUserId,
        productId,
        quantity: item.quantity,
        total: itemTotal,
        discount: itemDiscount,
        couponCode: couponResult.coupon?.code ?? null,
        status: "Paid",
      });
    }

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
      orderCount: items.length,
      subtotal,
      discount,
      total,
      couponCode: couponResult.coupon?.code ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Checkout deshtoi ne server." }, { status: 500 });
  }
}
