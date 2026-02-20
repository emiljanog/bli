export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CartItemInput = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
};

const CART_UPDATED_EVENT = "bli-cart-updated";

let cartCache: CartItem[] = [];

function canUseWindow(): boolean {
  return typeof window !== "undefined";
}

function sanitizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizePrice(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Number(parsed.toFixed(2)));
}

function sanitizeCount(value?: number): number {
  if (!value || Number.isNaN(value) || value < 1) return 1;
  return Math.floor(value);
}

function normalizeCartItem(input: unknown): CartItem | null {
  if (typeof input !== "object" || input === null) return null;
  const row = input as Partial<CartItem>;

  const id = sanitizeString(row.id);
  const name = sanitizeString(row.name);
  const price = sanitizePrice(row.price);
  if (!id || !name || price <= 0) return null;

  return {
    id,
    name,
    price,
    quantity: sanitizeCount(row.quantity),
    image: sanitizeString(row.image) || undefined,
  };
}

function normalizeCartItems(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => normalizeCartItem(item))
    .filter((item): item is CartItem => Boolean(item));
}

function cloneCartItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({ ...item }));
}

function emitCartUpdated(): void {
  if (!canUseWindow()) return;
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

async function requestCart(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  options: { body?: Record<string, unknown>; itemId?: string } = {},
): Promise<CartItem[]> {
  if (!canUseWindow()) return [];

  const query = options.itemId ? `?id=${encodeURIComponent(options.itemId)}` : "";
  const endpoint = `/api/cart${query}`;

  try {
    const response = await fetch(endpoint, {
      method,
      cache: "no-store",
      credentials: "same-origin",
      headers:
        method === "GET" || method === "DELETE"
          ? undefined
          : {
              "Content-Type": "application/json",
            },
      body:
        method === "GET" || method === "DELETE"
          ? undefined
          : JSON.stringify(options.body ?? {}),
    });

    if (!response.ok) {
      return cloneCartItems(cartCache);
    }

    const payload = (await response.json()) as { items?: unknown };
    cartCache = normalizeCartItems(payload.items);
    return cloneCartItems(cartCache);
  } catch {
    return cloneCartItems(cartCache);
  }
}

export async function readCart(): Promise<CartItem[]> {
  return requestCart("GET");
}

export async function addItemToCart(input: CartItemInput): Promise<CartItem[]> {
  const items = await requestCart("POST", {
    body: {
      id: sanitizeString(input.id),
      name: sanitizeString(input.name),
      price: sanitizePrice(input.price),
      image: sanitizeString(input.image),
      quantity: sanitizeCount(input.quantity),
    },
  });
  emitCartUpdated();
  return items;
}

export async function getCartCount(): Promise<number> {
  const items = await readCart();
  return items.reduce((sum, item) => sum + sanitizeCount(item.quantity), 0);
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartItem[]> {
  const items = await requestCart("PATCH", {
    body: {
      id: sanitizeString(itemId),
      quantity: sanitizeCount(quantity),
    },
  });
  emitCartUpdated();
  return items;
}

export async function removeCartItem(itemId: string): Promise<CartItem[]> {
  const items = await requestCart("DELETE", { itemId: sanitizeString(itemId) });
  emitCartUpdated();
  return items;
}

export async function clearCart(): Promise<void> {
  await requestCart("DELETE");
  emitCartUpdated();
}

export function subscribeCartUpdates(onChange: () => void): () => void {
  if (!canUseWindow()) return () => {};

  const onCustom = () => onChange();
  const onFocus = () => onChange();
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      onChange();
    }
  };

  window.addEventListener(CART_UPDATED_EVENT, onCustom);
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, onCustom);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
