import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const CART_SESSION_COOKIE = "bli_cart_session";

export type ServerCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type ServerCartItemInput = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
};

type CartSession = {
  items: ServerCartItem[];
  updatedAt: string;
};

type CartStore = {
  sessions: Record<string, CartSession>;
};

declare global {
  var __bli_cart_store__: CartStore | undefined;
}

const CART_STORE_PATH = path.join(process.cwd(), ".bli-store", "cart-sessions.json");

function nowIso(): string {
  return new Date().toISOString();
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safePrice(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Number(parsed.toFixed(2)));
}

function safeQuantity(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.max(1, Math.floor(parsed));
}

function normalizeItem(input: Partial<ServerCartItemInput | ServerCartItem>): ServerCartItem | null {
  const id = safeString(input.id);
  const name = safeString(input.name);
  const price = safePrice(input.price);
  if (!id || !name || price <= 0) return null;

  const quantity = safeQuantity(input.quantity);
  const image = safeString(input.image);

  return {
    id,
    name,
    price,
    quantity,
    image: image || undefined,
  };
}

function normalizeItems(items: unknown): ServerCartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => normalizeItem((item as Partial<ServerCartItem>)))
    .filter((item): item is ServerCartItem => Boolean(item));
}

function loadStoreFromDisk(): CartStore {
  try {
    const payload = readFileSync(CART_STORE_PATH, "utf8");
    if (!payload.trim()) return { sessions: {} };
    const parsed = JSON.parse(payload) as unknown;
    if (typeof parsed !== "object" || parsed === null) return { sessions: {} };

    const draft = parsed as { sessions?: Record<string, { items?: unknown; updatedAt?: unknown }> };
    const sessions: Record<string, CartSession> = {};
    const source = draft.sessions ?? {};

    for (const [sessionId, value] of Object.entries(source)) {
      const normalizedSessionId = safeString(sessionId);
      if (!normalizedSessionId) continue;
      sessions[normalizedSessionId] = {
        items: normalizeItems(value?.items),
        updatedAt: safeString(value?.updatedAt) || nowIso(),
      };
    }

    return { sessions };
  } catch {
    return { sessions: {} };
  }
}

function persistStore(store: CartStore): void {
  try {
    mkdirSync(path.dirname(CART_STORE_PATH), { recursive: true });
    writeFileSync(CART_STORE_PATH, JSON.stringify(store), "utf8");
  } catch {
    // Ignore persistence errors and keep in-memory state.
  }
}

function getStore(): CartStore {
  if (!globalThis.__bli_cart_store__) {
    globalThis.__bli_cart_store__ = loadStoreFromDisk();
  }
  return globalThis.__bli_cart_store__;
}

function ensureSession(sessionId: string): CartSession {
  const normalizedId = safeString(sessionId);
  const store = getStore();

  if (!store.sessions[normalizedId]) {
    store.sessions[normalizedId] = {
      items: [],
      updatedAt: nowIso(),
    };
    persistStore(store);
  }

  return store.sessions[normalizedId];
}

function cloneItems(items: ServerCartItem[]): ServerCartItem[] {
  return items.map((item) => ({ ...item }));
}

export function createCartSessionId(): string {
  return `cart_${randomUUID().replace(/-/g, "")}`;
}

export function listCartItems(sessionId: string): ServerCartItem[] {
  return cloneItems(ensureSession(sessionId).items);
}

export function addCartItemToSession(sessionId: string, input: ServerCartItemInput): ServerCartItem[] {
  const entry = ensureSession(sessionId);
  const next = normalizeItem(input);
  if (!next) return cloneItems(entry.items);

  const existing = entry.items.find((item) => item.id === next.id);
  if (existing) {
    existing.quantity += safeQuantity(next.quantity);
    existing.name = next.name;
    existing.price = next.price;
    existing.image = next.image;
  } else {
    entry.items.push(next);
  }

  entry.updatedAt = nowIso();
  persistStore(getStore());
  return cloneItems(entry.items);
}

export function updateCartItemQuantityInSession(
  sessionId: string,
  itemId: string,
  quantity: number,
): ServerCartItem[] {
  const entry = ensureSession(sessionId);
  const target = entry.items.find((item) => item.id === safeString(itemId));
  if (!target) return cloneItems(entry.items);

  target.quantity = safeQuantity(quantity);
  entry.updatedAt = nowIso();
  persistStore(getStore());
  return cloneItems(entry.items);
}

export function removeCartItemFromSession(sessionId: string, itemId: string): ServerCartItem[] {
  const entry = ensureSession(sessionId);
  const normalizedItemId = safeString(itemId);
  if (!normalizedItemId) return cloneItems(entry.items);

  entry.items = entry.items.filter((item) => item.id !== normalizedItemId);
  entry.updatedAt = nowIso();
  persistStore(getStore());
  return cloneItems(entry.items);
}

export function clearCartSession(sessionId: string): ServerCartItem[] {
  const entry = ensureSession(sessionId);
  entry.items = [];
  entry.updatedAt = nowIso();
  persistStore(getStore());
  return [];
}

export function mergeCartSessions(sourceSessionId: string, targetSessionId: string): ServerCartItem[] {
  const sourceId = safeString(sourceSessionId);
  const targetId = safeString(targetSessionId);
  if (!sourceId || !targetId || sourceId === targetId) {
    return targetId ? listCartItems(targetId) : [];
  }

  const store = getStore();
  const source = ensureSession(sourceId);
  const target = ensureSession(targetId);

  for (const sourceItem of source.items) {
    const normalized = normalizeItem(sourceItem);
    if (!normalized) continue;

    const existing = target.items.find((item) => item.id === normalized.id);
    if (existing) {
      existing.quantity += safeQuantity(normalized.quantity);
      existing.name = normalized.name;
      existing.price = normalized.price;
      existing.image = normalized.image;
    } else {
      target.items.push(normalized);
    }
  }

  source.items = [];
  source.updatedAt = nowIso();
  target.updatedAt = nowIso();
  persistStore(store);
  return cloneItems(target.items);
}
