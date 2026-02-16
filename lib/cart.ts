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

const CART_STORAGE_KEY = "bli_cart_items";
const CART_UPDATED_EVENT = "bli-cart-updated";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeCount(value?: number): number {
  if (!value || Number.isNaN(value) || value < 1) return 1;
  return Math.floor(value);
}

export function readCart(): CartItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function emitCartUpdated(): void {
  if (!canUseStorage()) return;
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function addItemToCart(input: CartItemInput): CartItem[] {
  const current = readCart();
  const quantity = sanitizeCount(input.quantity);
  const existing = current.find((item) => item.id === input.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    current.push({
      id: input.id,
      name: input.name,
      price: input.price,
      image: input.image,
      quantity,
    });
  }

  writeCart(current);
  emitCartUpdated();
  return current;
}

export function getCartCount(): number {
  return readCart().reduce((sum, item) => sum + sanitizeCount(item.quantity), 0);
}

export function updateCartItemQuantity(itemId: string, quantity: number): CartItem[] {
  const current = readCart();
  const safeQuantity = sanitizeCount(quantity);
  const target = current.find((item) => item.id === itemId);
  if (!target) return current;

  target.quantity = safeQuantity;
  writeCart(current);
  emitCartUpdated();
  return current;
}

export function removeCartItem(itemId: string): CartItem[] {
  const current = readCart().filter((item) => item.id !== itemId);
  writeCart(current);
  emitCartUpdated();
  return current;
}

export function clearCart(): void {
  writeCart([]);
  emitCartUpdated();
}

export function subscribeCartUpdates(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) onChange();
  };
  const onCustom = () => onChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(CART_UPDATED_EVENT, onCustom);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CART_UPDATED_EVENT, onCustom);
  };
}
