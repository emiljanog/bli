import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { ProductVisibility } from "@/lib/shop-store";

export type ProductPreviewDraft = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  categories: string[];
  visibility: ProductVisibility;
  visibilityPassword: string;
  description: string;
  image: string;
  gallery: string[];
  tags: string[];
  price: number;
  salePrice: number | null;
  saleScheduleStartAt: string | null;
  saleScheduleEndAt: string | null;
  stock: number;
};

type StoredPreviewDraft = {
  token: string;
  expiresAt: number;
  payload: ProductPreviewDraft;
};

const PREVIEW_TTL_MS = 20 * 60 * 1000;
const PREVIEW_PERSIST_PATH = path.join(process.cwd(), ".bli-store", "product-preview-drafts.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStoredDraft(input: unknown): StoredPreviewDraft | null {
  if (!isRecord(input)) return null;
  const token = typeof input.token === "string" ? input.token.trim() : "";
  const expiresAt = Number(input.expiresAt);
  if (!token || !Number.isFinite(expiresAt)) return null;
  if (!isRecord(input.payload)) return null;
  const payload = input.payload as Record<string, unknown>;

  const productId = typeof payload.productId === "string" ? payload.productId : "";
  const slug = typeof payload.slug === "string" ? payload.slug : "";
  const name = typeof payload.name === "string" ? payload.name : "";
  const category = typeof payload.category === "string" ? payload.category : "";
  const categories = Array.isArray(payload.categories) ? payload.categories.filter((item): item is string => typeof item === "string") : [];
  const gallery = Array.isArray(payload.gallery) ? payload.gallery.filter((item): item is string => typeof item === "string") : [];
  const tags = Array.isArray(payload.tags) ? payload.tags.filter((item): item is string => typeof item === "string") : [];
  const visibilityRaw = typeof payload.visibility === "string" ? payload.visibility : "Public";
  const visibility: ProductVisibility =
    visibilityRaw === "LoggedUsers" || visibilityRaw === "Password" ? visibilityRaw : "Public";
  const visibilityPassword = typeof payload.visibilityPassword === "string" ? payload.visibilityPassword : "";
  const description = typeof payload.description === "string" ? payload.description : "";
  const image = typeof payload.image === "string" ? payload.image : "";
  const price = Number(payload.price);
  const rawSalePrice = payload.salePrice;
  const salePriceParsed = rawSalePrice === null || rawSalePrice === undefined || rawSalePrice === ""
    ? null
    : Number(rawSalePrice);
  const salePrice = Number.isFinite(salePriceParsed as number) ? Number(salePriceParsed) : null;
  const saleScheduleStartAtRaw = typeof payload.saleScheduleStartAt === "string" ? payload.saleScheduleStartAt.trim() : "";
  const saleScheduleEndAtRaw = typeof payload.saleScheduleEndAt === "string" ? payload.saleScheduleEndAt.trim() : "";
  const saleScheduleStartAt = saleScheduleStartAtRaw ? saleScheduleStartAtRaw : null;
  const saleScheduleEndAt = saleScheduleEndAtRaw ? saleScheduleEndAtRaw : null;
  const stock = Number(payload.stock);

  if (!productId || !slug || !name || !category || !Number.isFinite(price) || !Number.isFinite(stock)) {
    return null;
  }

  return {
    token,
    expiresAt,
    payload: {
      productId,
      slug,
      name,
      category,
      categories,
      visibility,
      visibilityPassword,
      description,
      image,
      gallery,
      tags,
      price,
      salePrice,
      saleScheduleStartAt,
      saleScheduleEndAt,
      stock,
    },
  };
}

function loadDraftsFromDisk(): StoredPreviewDraft[] {
  try {
    const raw = readFileSync(PREVIEW_PERSIST_PATH, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw) as unknown;
    const source = Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.items) ? parsed.items : [];
    return source.map(normalizeStoredDraft).filter((item): item is StoredPreviewDraft => Boolean(item));
  } catch {
    return [];
  }
}

function saveDraftsToDisk(items: StoredPreviewDraft[]) {
  try {
    mkdirSync(path.dirname(PREVIEW_PERSIST_PATH), { recursive: true });
    writeFileSync(PREVIEW_PERSIST_PATH, JSON.stringify(items), "utf8");
  } catch {
    // ignore filesystem errors; preview will simply fail gracefully
  }
}

function cleanupExpiredDrafts(items: StoredPreviewDraft[]): StoredPreviewDraft[] {
  const now = Date.now();
  return items.filter((draft) => draft.expiresAt > now);
}

function clonePayload(payload: ProductPreviewDraft): ProductPreviewDraft {
  return {
    ...payload,
    categories: [...payload.categories],
    gallery: [...payload.gallery],
    tags: [...payload.tags],
  };
}

export function createProductPreviewDraft(payload: ProductPreviewDraft): string {
  const current = cleanupExpiredDrafts(loadDraftsFromDisk());
  const token = randomUUID();
  current.push({
    token,
    expiresAt: Date.now() + PREVIEW_TTL_MS,
    payload: clonePayload(payload),
  });
  saveDraftsToDisk(current);
  return token;
}

export function getProductPreviewDraft(token: string): ProductPreviewDraft | null {
  const normalizedToken = token.trim();
  if (!normalizedToken) return null;
  const current = loadDraftsFromDisk();
  const cleaned = cleanupExpiredDrafts(current);
  if (cleaned.length !== current.length) {
    saveDraftsToDisk(cleaned);
  }
  const stored = cleaned.find((item) => item.token === normalizedToken);
  if (!stored) return null;
  return clonePayload(stored.payload);
}
