import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type Product = {
  id: string;
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
  publishStatus: PublicationStatus;
  trashedAt: string | null;
};

export type ProductPricing = {
  current: number;
  regular: number;
  salePrice: number | null;
  onSale: boolean;
  discountPercent: number;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type ProductTag = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type OrderStatus = "Pending" | "Paid" | "Shipped" | "Cancelled";
export type PublicationStatus = "Published" | "Draft";
export type ProductVisibility = "Public" | "LoggedUsers" | "Password";

export type Order = {
  id: string;
  customer: string;
  userId?: string | null;
  productId: string;
  quantity: number;
  total: number;
  discount: number;
  couponCode: string | null;
  status: OrderStatus;
  createdAt: string;
};

export type Sale = {
  id: string;
  source: string;
  amount: number;
  createdAt: string;
};

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type CouponType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  isActive: boolean;
  createdAt: string;
};

export type ReviewStatus = "Approved" | "Pending" | "Hidden";

export type ProductReview = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
};

export type UserSource = "Admin" | "Checkout";
export type UserRole = "Super Admin" | "Admin" | "Manager" | "Customer";

export type User = {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
  role: UserRole;
  phone: string;
  city: string;
  address: string;
  source: UserSource;
  createdAt: string;
  isActive: boolean;
  passwordResetRequired: boolean;
  showToolbar: boolean;
};

export type Page = {
  id: string;
  name: string;
  slug: string;
  content: string;
  publishStatus: PublicationStatus;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  originalUrl: string | null;
  assignedTo: MediaAssignedTo;
  assignedToId: string | null;
  uploadedBy: string | null;
  alt: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  trashedAt: string | null;
};

export type MediaAssignedTo = "Unassigned" | "Product" | "Page" | "User";

export type SiteMenuItem = {
  label: string;
  href: string;
};

export type HomeSliderPreset = "sunset" | "ocean" | "forest" | "violet" | "sunrise";

export type HomeSliderItem = {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  imageUrl: string;
  gradientPreset: HomeSliderPreset;
};

export type EmailProvider = "smtp" | "phpmailer" | "react-email";

export type SupportTicketStatus = "Open" | "Closed";
export type AdminNotificationType = "Order" | "Ticket" | "User";

export type SupportTicketReply = {
  id: string;
  by: string;
  message: string;
  createdAt: string;
};

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  isRead: boolean;
};

export type PasswordResetToken = {
  id: string;
  userId: string;
  username: string;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
};

export type SupportTicket = {
  id: string;
  userId: string;
  username: string;
  email: string;
  subject: string;
  message: string;
  replies: SupportTicketReply[];
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  siteTitle: string;
  brandName: string;
  layoutMaxWidthPx: number;
  mediaUploadMaxMb: number;
  logoUrl: string;
  iconUrl: string;
  brandingVersion: number;
  useLogoOnly: boolean;
  headerMenu: SiteMenuItem[];
  homeSlides: HomeSliderItem[];
  sliderAutoplayMs: number;
  sliderShowArrows: boolean;
  sliderShowDots: boolean;
  titleFont: string;
  textFont: string;
  buttonFont: string;
  uiFont: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  emailProvider: EmailProvider;
  emailFromName: string;
  emailFromAddress: string;
  mailHost: string;
  mailPort: number;
  mailSecure: boolean;
  mailUsername: string;
  mailPassword: string;
  phpMailerPath: string;
  reactEmailApiUrl: string;
  reactEmailApiKey: string;
  notifyCustomerOrderConfirmation: boolean;
  notifyAdminPaidOrder: boolean;
  notifyShippedOrder: boolean;
  notifyLowStock: boolean;
  paymentCadEnabled: boolean;
  paymentBankTransferEnabled: boolean;
  paymentStripeDemoEnabled: boolean;
  paymentBankTransferInstructions: string;
  shippingStandardEnabled: boolean;
  shippingStandardLabel: string;
  shippingStandardEta: string;
  shippingStandardPrice: number;
  shippingExpressEnabled: boolean;
  shippingExpressLabel: string;
  shippingExpressEta: string;
  shippingExpressPrice: number;
  shippingFreeThreshold: number;
};

type ProductInput = {
  name: string;
  category: string;
  categories?: string[];
  visibility?: ProductVisibility;
  visibilityPassword?: string;
  price: number;
  salePrice?: number | null;
  saleScheduleStartAt?: string | null;
  saleScheduleEndAt?: string | null;
  stock: number;
  slug?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  tags?: string[];
  publishStatus?: PublicationStatus;
};

type CouponInput = {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minSubtotal?: number;
  isActive?: boolean;
};

type ProductReviewInput = {
  productId: string;
  author: string;
  rating: number;
  comment: string;
  status?: ReviewStatus;
};

type UserInput = {
  name: string;
  surname?: string;
  username?: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role?: UserRole;
  phone?: string;
  city?: string;
  address?: string;
  source?: UserSource;
  showToolbar?: boolean;
};

type UserUpdateInput = {
  name: string;
  surname?: string;
  username?: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  city?: string;
  address?: string;
  showToolbar?: boolean;
};

type PageInput = {
  name: string;
  slug?: string;
  content?: string;
  publishStatus?: PublicationStatus;
};

type ListProductsOptions = {
  includeTrashed?: boolean;
  onlyTrashed?: boolean;
  includeDrafts?: boolean;
};

type ListPagesOptions = {
  includeTrashed?: boolean;
  onlyTrashed?: boolean;
  includeDrafts?: boolean;
};

type ListMediaOptions = {
  includeTrashed?: boolean;
  onlyTrashed?: boolean;
};

type OrderUpdateInput = {
  customer: string;
  productId: string;
  quantity: number;
  status: OrderStatus;
  total?: number;
  discount?: number;
  couponCode?: string | null;
};

type MediaInput = {
  url: string;
  alt?: string;
  description?: string;
  assignedTo?: MediaAssignedTo;
  assignedToId?: string;
  uploadedBy?: string;
};

type ListReviewOptions = {
  productId?: string;
  status?: ReviewStatus | "all";
};

type CouponApplyResult = {
  coupon: Coupon | null;
  discount: number;
  error?: string;
};

type Store = {
  seq: number;
  products: Product[];
  productCategories: ProductCategory[];
  productTags: ProductTag[];
  orders: Order[];
  sales: Sale[];
  accounts: AdminAccount[];
  coupons: Coupon[];
  reviews: ProductReview[];
  users: User[];
  pages: Page[];
  media: MediaAsset[];
  supportTickets: SupportTicket[];
  adminNotifications: AdminNotification[];
  passwordResetTokens: PasswordResetToken[];
  settings: SiteSettings;
};

type ProductSeed = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  { id: "PRD-1001", name: "AeroBook 14", category: "Tech Essentials", price: 899, stock: 22 },
  { id: "PRD-1002", name: "NoiseBuds Pro", category: "Tech Essentials", price: 129, stock: 40 },
  { id: "PRD-1003", name: "Pulse Smartwatch", category: "Tech Essentials", price: 219, stock: 31 },
  { id: "PRD-1004", name: "StreamCam 4K", category: "Tech Essentials", price: 159, stock: 18 },
  { id: "PRD-1005", name: "Core Router X6", category: "Tech Essentials", price: 179, stock: 26 },
  { id: "PRD-1006", name: "Volt Power Bank", category: "Tech Essentials", price: 59, stock: 57 },
  { id: "PRD-1007", name: "Urban Chino Pants", category: "Urban Fashion", price: 69, stock: 35 },
  { id: "PRD-1008", name: "Essential Overshirt", category: "Urban Fashion", price: 74, stock: 27 },
  { id: "PRD-1009", name: "Street Denim Jacket", category: "Urban Fashion", price: 109, stock: 19 },
  { id: "PRD-1010", name: "Canvas Daily Sneakers", category: "Urban Fashion", price: 89, stock: 41 },
  { id: "PRD-1011", name: "Signature Hoodie", category: "Urban Fashion", price: 79, stock: 29 },
  { id: "PRD-1012", name: "Classic Leather Belt", category: "Urban Fashion", price: 39, stock: 60 },
  { id: "PRD-1013", name: "Minimal Floor Lamp", category: "Home & Living", price: 129, stock: 16 },
  { id: "PRD-1014", name: "Oak Side Table", category: "Home & Living", price: 149, stock: 13 },
  { id: "PRD-1015", name: "Cloud Bedding Set", category: "Home & Living", price: 99, stock: 24 },
  { id: "PRD-1016", name: "Aroma Diffuser", category: "Home & Living", price: 45, stock: 52 },
  { id: "PRD-1017", name: "Kitchen Knife Set", category: "Home & Living", price: 79, stock: 33 },
  { id: "PRD-1018", name: "Modular Storage Box", category: "Home & Living", price: 34, stock: 66 },
  { id: "PRD-1019", name: "Trail Running Shoes", category: "Sports & Outdoor", price: 119, stock: 28 },
  { id: "PRD-1020", name: "Active Dry T-Shirt", category: "Sports & Outdoor", price: 35, stock: 74 },
  { id: "PRD-1021", name: "Thermal Water Bottle", category: "Sports & Outdoor", price: 29, stock: 80 },
  { id: "PRD-1022", name: "Foldable Yoga Mat", category: "Sports & Outdoor", price: 49, stock: 46 },
  { id: "PRD-1023", name: "Resistance Bands Kit", category: "Sports & Outdoor", price: 39, stock: 68 },
  { id: "PRD-1024", name: "Compact Fitness Bag", category: "Sports & Outdoor", price: 59, stock: 37 },
  { id: "PRD-1025", name: "Hydra Face Serum", category: "Beauty & Care", price: 42, stock: 58 },
  { id: "PRD-1026", name: "Daily Clean Gel", category: "Beauty & Care", price: 24, stock: 84 },
  { id: "PRD-1027", name: "Repair Hair Mask", category: "Beauty & Care", price: 31, stock: 47 },
  { id: "PRD-1028", name: "Glow SPF 50 Cream", category: "Beauty & Care", price: 36, stock: 62 },
  { id: "PRD-1029", name: "Vitamin C Toner", category: "Beauty & Care", price: 28, stock: 55 },
  { id: "PRD-1030", name: "Premium Care Bundle", category: "Beauty & Care", price: 89, stock: 20 },
];

const PRODUCTS_WITH_GALLERY = new Set(["PRD-1001", "PRD-1002", "PRD-1003", "PRD-1004", "PRD-1005"]);

declare global {
  var __bli_store__: Store | undefined;
}

const STORE_PERSIST_PATH = path.join(process.cwd(), ".bli-store", "store.json");
const STORE_PERSIST_DEBOUNCE_MS = 50;

const proxiedValues = new WeakMap<object, object>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let isHydratingStore = false;
let lastPersistedPayload = "";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergePersistedSettings(base: SiteSettings, input: unknown): SiteSettings {
  if (!isRecord(input)) return base;
  const draft = input as Partial<SiteSettings>;
  return {
    ...base,
    ...draft,
    headerMenu: Array.isArray(draft.headerMenu) ? draft.headerMenu : base.headerMenu,
    homeSlides: Array.isArray(draft.homeSlides) ? draft.homeSlides : base.homeSlides,
  };
}

function mergePersistedStore(base: Store, input: unknown): Store {
  if (!isRecord(input)) return base;
  const draft = input as Partial<Store>;
  return {
    ...base,
    ...draft,
    seq: typeof draft.seq === "number" ? draft.seq : base.seq,
    products: Array.isArray(draft.products) ? draft.products : base.products,
    productCategories: Array.isArray(draft.productCategories) ? draft.productCategories : base.productCategories,
    productTags: Array.isArray(draft.productTags) ? draft.productTags : base.productTags,
    orders: Array.isArray(draft.orders) ? draft.orders : base.orders,
    sales: Array.isArray(draft.sales) ? draft.sales : base.sales,
    accounts: Array.isArray(draft.accounts) ? draft.accounts : base.accounts,
    coupons: Array.isArray(draft.coupons) ? draft.coupons : base.coupons,
    reviews: Array.isArray(draft.reviews) ? draft.reviews : base.reviews,
    users: Array.isArray(draft.users) ? draft.users : base.users,
    pages: Array.isArray(draft.pages) ? draft.pages : base.pages,
    media: Array.isArray(draft.media) ? draft.media : base.media,
    supportTickets: Array.isArray(draft.supportTickets) ? draft.supportTickets : base.supportTickets,
    adminNotifications: Array.isArray(draft.adminNotifications) ? draft.adminNotifications : base.adminNotifications,
    passwordResetTokens: Array.isArray(draft.passwordResetTokens) ? draft.passwordResetTokens : base.passwordResetTokens,
    settings: mergePersistedSettings(base.settings, draft.settings),
  };
}

function loadStoreFromDisk(): Store | null {
  try {
    const payload = readFileSync(STORE_PERSIST_PATH, "utf8");
    if (!payload.trim()) return null;
    const parsed = JSON.parse(payload) as unknown;
    const merged = mergePersistedStore(createInitialStore(), parsed);
    lastPersistedPayload = JSON.stringify(merged);
    return merged;
  } catch {
    return null;
  }
}

function persistStoreNow(): void {
  if (isHydratingStore) return;
  if (!globalThis.__bli_store__) return;

  try {
    const payload = JSON.stringify(globalThis.__bli_store__);
    if (payload === lastPersistedPayload) return;
    mkdirSync(path.dirname(STORE_PERSIST_PATH), { recursive: true });
    writeFileSync(STORE_PERSIST_PATH, payload, "utf8");
    lastPersistedPayload = payload;
  } catch {
    // Ignore filesystem errors and keep in-memory fallback behavior.
  }
}

function scheduleStorePersist(): void {
  if (isHydratingStore) return;
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistStoreNow();
  }, STORE_PERSIST_DEBOUNCE_MS);
}

function toPersistentProxy<T>(value: T): T {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const existing = proxiedValues.get(value as object);
  if (existing) {
    return existing as T;
  }

  const proxy = new Proxy(value as object, {
    get(target, property, receiver) {
      const current = Reflect.get(target, property, receiver);
      if (typeof current === "object" && current !== null) {
        return toPersistentProxy(current);
      }
      return current;
    },
    set(target, property, nextValue, receiver) {
      const previousValue = Reflect.get(target, property, receiver);
      const wrappedValue =
        typeof nextValue === "object" && nextValue !== null
          ? toPersistentProxy(nextValue)
          : nextValue;
      const didSet = Reflect.set(target, property, wrappedValue, receiver);
      if (didSet && !Object.is(previousValue, wrappedValue)) {
        scheduleStorePersist();
      }
      return didSet;
    },
    deleteProperty(target, property) {
      const hadProperty = Reflect.has(target, property);
      const didDelete = Reflect.deleteProperty(target, property);
      if (didDelete && hadProperty) {
        scheduleStorePersist();
      }
      return didDelete;
    },
  });

  proxiedValues.set(value as object, proxy);
  return proxy as T;
}

function mediaUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
}

function defaultImageById(productId: string): string {
  return mediaUrl(`bli-${productId}`);
}

function defaultGalleryById(productId: string): string[] {
  if (!PRODUCTS_WITH_GALLERY.has(productId)) return [];
  return [
    mediaUrl(`bli-${productId}-1`),
    mediaUrl(`bli-${productId}-2`),
    mediaUrl(`bli-${productId}-3`),
    mediaUrl(`bli-${productId}-4`),
  ];
}

function asSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(new Set(input.map((item) => asSafeString(item)).filter(Boolean)));
}

function normalizeCouponCode(value: unknown): string {
  return asSafeString(value)
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "");
}

function toEmail(value: unknown): string {
  return asSafeString(value).toLowerCase();
}

function normalizeUserRole(value: unknown): UserRole {
  const role = asSafeString(value).toLowerCase();
  if (role === "super admin" || role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  return "Customer";
}

function normalizePublicationStatus(value: unknown): PublicationStatus {
  const normalized = asSafeString(value).toLowerCase();
  return normalized === "draft" ? "Draft" : "Published";
}

function normalizeProductVisibility(value: unknown): ProductVisibility {
  const normalized = asSafeString(value).toLowerCase();
  if (normalized === "loggedusers" || normalized === "logged_users" || normalized === "logged-users") {
    return "LoggedUsers";
  }
  if (normalized === "password") {
    return "Password";
  }
  return "Public";
}

function normalizeMediaAssignedTo(value: unknown): MediaAssignedTo {
  const normalized = asSafeString(value).toLowerCase();
  if (normalized === "product") return "Product";
  if (normalized === "page") return "Page";
  if (normalized === "user") return "User";
  return "Unassigned";
}

function normalizeUsername(value: unknown): string {
  const base = asSafeString(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

  return base || "user";
}

function usernameFromName(name: string): string {
  return normalizeUsername(name);
}

function nextUniqueUsername(base: string, taken: Set<string>): string {
  const normalizedBase = normalizeUsername(base);
  let candidate = normalizedBase;
  let index = 1;

  while (taken.has(candidate)) {
    candidate = `${normalizedBase}${index}`;
    index += 1;
  }

  taken.add(candidate);
  return candidate;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function money(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Number(value.toFixed(2)));
}

function normalizeSalePrice(price: number, salePrice: unknown): number | null {
  const regularPrice = money(price);
  const parsed = Number(salePrice);
  if (!Number.isFinite(parsed)) return null;
  const safeSale = money(parsed);
  if (safeSale <= 0 || safeSale >= regularPrice) return null;
  return safeSale;
}

function normalizeSaleScheduleDate(value: unknown): string | null {
  const safe = asSafeString(value);
  if (!safe) return null;
  const timestamp = Date.parse(safe);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

function isSaleScheduleActive(
  saleScheduleStartAt: string | null | undefined,
  saleScheduleEndAt: string | null | undefined,
  nowMs = Date.now(),
): boolean {
  const startAt = normalizeSaleScheduleDate(saleScheduleStartAt);
  const endAt = normalizeSaleScheduleDate(saleScheduleEndAt);
  const startMs = startAt ? Date.parse(startAt) : Number.NEGATIVE_INFINITY;
  const endMs = endAt ? Date.parse(endAt) : Number.POSITIVE_INFINITY;
  if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs <= startMs) return false;
  return nowMs >= startMs && nowMs <= endMs;
}

export function getEffectiveProductPricing(
  product: Pick<Product, "price" | "salePrice" | "saleScheduleStartAt" | "saleScheduleEndAt">,
  nowMs = Date.now(),
): ProductPricing {
  const regular = money(product.price);
  const normalizedSalePrice = normalizeSalePrice(product.price, product.salePrice);
  const hasActiveSale =
    normalizedSalePrice !== null &&
    isSaleScheduleActive(product.saleScheduleStartAt, product.saleScheduleEndAt, nowMs);
  const salePrice = hasActiveSale ? normalizedSalePrice : null;
  const current = salePrice ?? regular;
  const discountPercent =
    salePrice !== null && regular > 0 ? Math.round(((regular - salePrice) / regular) * 100) : 0;
  return {
    current,
    regular,
    salePrice,
    onSale: salePrice !== null,
    discountPercent,
  };
}

function extractIdNumber(value: string): number {
  const digits = value.replace(/[^0-9]+/g, "");
  if (!digits) return Number.NaN;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function formatEntityId(value: number): string {
  const safe = Math.max(1, Math.floor(value));
  return String(safe).padStart(3, "0");
}

function maxEntityIdNumber(items: Array<{ id: string }>): number {
  let max = 0;
  for (const item of items) {
    const idNumber = extractIdNumber(item.id);
    if (Number.isFinite(idNumber)) {
      max = Math.max(max, idNumber);
    }
  }
  return max;
}

function nextEntityId(items: Array<{ id: string }>): string {
  return formatEntityId(maxEntityIdNumber(items) + 1);
}

function hasCleanNumericIds(items: Array<{ id: string }>): boolean {
  return items.every((item) => /^[0-9]+$/.test(item.id));
}

function remapEntityIdsInPlace<T extends { id: string }>(items: T[]): Map<string, string> {
  const map = new Map<string, string>();
  const entries = items.map((item, index) => ({
    item,
    index,
    oldId: item.id,
    numericId: extractIdNumber(item.id),
  }));

  entries.sort((a, b) => {
    const safeA = Number.isFinite(a.numericId) ? a.numericId : Number.POSITIVE_INFINITY;
    const safeB = Number.isFinite(b.numericId) ? b.numericId : Number.POSITIVE_INFINITY;
    if (safeA !== safeB) return safeA - safeB;
    return a.index - b.index;
  });

  for (let index = 0; index < entries.length; index += 1) {
    const nextId = formatEntityId(index + 1);
    entries[index].item.id = nextId;
    map.set(entries[index].oldId, nextId);
  }

  return map;
}

function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "product";
}

function nextUniqueSlug(baseSlug: string, taken: Set<string>): string {
  let candidate = baseSlug || "product";
  let index = 2;

  while (taken.has(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  taken.add(candidate);
  return candidate;
}

function cloneProduct(product: Product): Product {
  const safeCategories = Array.isArray(product.categories)
    ? product.categories
    : asSafeString(product.category)
      ? [asSafeString(product.category)]
      : ["Uncategorized"];
  const safeGallery = Array.isArray(product.gallery) ? product.gallery : [];
  const safeTags = Array.isArray(product.tags) ? product.tags : [];
  const safeVisibility = normalizeProductVisibility(
    (product as Partial<Product>).visibility ?? "Public",
  );
  const safeVisibilityPassword = safeVisibility === "Password"
    ? asSafeString((product as Partial<Product>).visibilityPassword)
    : "";

  const safeSaleScheduleStartAt = normalizeSaleScheduleDate((product as Partial<Product>).saleScheduleStartAt ?? null);
  let safeSaleScheduleEndAt = normalizeSaleScheduleDate((product as Partial<Product>).saleScheduleEndAt ?? null);
  if (
    safeSaleScheduleStartAt &&
    safeSaleScheduleEndAt &&
    Date.parse(safeSaleScheduleEndAt) <= Date.parse(safeSaleScheduleStartAt)
  ) {
    safeSaleScheduleEndAt = null;
  }
  const safeSalePrice = normalizeSalePrice(product.price, (product as Partial<Product>).salePrice ?? null);

  return {
    ...product,
    category: safeCategories[0] ?? "Uncategorized",
    categories: [...safeCategories],
    visibility: safeVisibility,
    visibilityPassword: safeVisibilityPassword,
    gallery: [...safeGallery],
    tags: [...safeTags],
    salePrice: safeSalePrice,
    saleScheduleStartAt: safeSalePrice !== null ? safeSaleScheduleStartAt : null,
    saleScheduleEndAt: safeSalePrice !== null ? safeSaleScheduleEndAt : null,
  };
}

function cloneProductCategory(category: ProductCategory): ProductCategory {
  return { ...category };
}

function cloneProductTag(tag: ProductTag): ProductTag {
  return { ...tag };
}

function cloneCoupon(coupon: Coupon): Coupon {
  return { ...coupon };
}

function cloneReview(review: ProductReview): ProductReview {
  return { ...review };
}

function cloneUser(user: User): User {
  return { ...user };
}

function clonePage(page: Page): Page {
  return { ...page };
}

function cloneMedia(media: MediaAsset): MediaAsset {
  return { ...media };
}

function cloneSupportTicket(ticket: SupportTicket): SupportTicket {
  const safeReplies = Array.isArray(ticket.replies) ? ticket.replies : [];
  return {
    ...ticket,
    replies: safeReplies.map((reply) => ({ ...reply })),
  };
}

function cloneAdminNotification(notification: AdminNotification): AdminNotification {
  return { ...notification };
}

function clonePasswordResetToken(token: PasswordResetToken): PasswordResetToken {
  return { ...token };
}

function cloneSiteSettings(settings: SiteSettings): SiteSettings {
  const headerMenu = Array.isArray(settings.headerMenu) ? settings.headerMenu : [];
  const homeSlides = Array.isArray(settings.homeSlides) ? settings.homeSlides : [];
  return {
    ...settings,
    headerMenu: headerMenu.map((item) => ({ ...item })),
    homeSlides: homeSlides.map((slide) => ({ ...slide })),
  };
}

const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "dashboard",
  "user",
  "api",
  "shop",
  "product",
  "cart",
  "checkout",
  "collections",
  "contact",
  "my-account",
]);

function isReservedPageSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug);
}

function nextUniquePageSlug(baseSlug: string, taken: Set<string>): string {
  const fallbackBase = baseSlug || "page";
  let candidate = fallbackBase;
  let index = 2;

  while (taken.has(candidate) || isReservedPageSlug(candidate)) {
    candidate = `${fallbackBase}-${index}`;
    index += 1;
  }

  taken.add(candidate);
  return candidate;
}

function defaultHeaderMenu(): SiteMenuItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "Contact", href: "/contact" },
    { label: "My Account", href: "/my-account" },
  ];
}

const HOME_SLIDER_DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

function normalizeHomeSliderPreset(value: unknown): HomeSliderPreset {
  const safe = asSafeString(value).toLowerCase();
  if (safe === "ocean") return "ocean";
  if (safe === "forest") return "forest";
  if (safe === "violet") return "violet";
  if (safe === "sunrise") return "sunrise";
  return "sunset";
}

function defaultHomeSlides(): HomeSliderItem[] {
  return [
    {
      id: "slide-1",
      badge: "Collection 2026",
      title: "Stili i ri per sezonin e ardhshem",
      description: "Zbritje deri ne 40% per artikujt me te kerkuar. Furnizim i limituar per modelet premium.",
      ctaPrimary: "Shop Now",
      ctaPrimaryHref: "/shop",
      ctaSecondary: "Shiko koleksionin",
      ctaSecondaryHref: "/collections",
      imageUrl: HOME_SLIDER_DEFAULT_IMAGE,
      gradientPreset: "sunset",
    },
    {
      id: "slide-2",
      badge: "Tech Essentials",
      title: "Aksesore modern per pune dhe gaming",
      description: "Produkte te zgjedhura per performance dhe komoditet, me dergese te shpejte ne gjithe vendin.",
      ctaPrimary: "Bli tani",
      ctaPrimaryHref: "/shop",
      ctaSecondary: "Shiko ofertat",
      ctaSecondaryHref: "/collections",
      imageUrl: HOME_SLIDER_DEFAULT_IMAGE,
      gradientPreset: "ocean",
    },
    {
      id: "slide-3",
      badge: "Home Picks",
      title: "Transformo shtepine me detaje smart",
      description: "Nga dekor modern te pajisje praktike, gjithcka ne nje homepage te vetme per shop-in tend.",
      ctaPrimary: "Eksploro",
      ctaPrimaryHref: "/shop",
      ctaSecondary: "Produktet e reja",
      ctaSecondaryHref: "/collections",
      imageUrl: HOME_SLIDER_DEFAULT_IMAGE,
      gradientPreset: "forest",
    },
  ];
}

function normalizeHomeSlides(input: unknown): HomeSliderItem[] {
  if (!Array.isArray(input)) return defaultHomeSlides();

  const output: HomeSliderItem[] = [];
  const ids = new Set<string>();

  for (let index = 0; index < input.length; index += 1) {
    const raw = input[index];
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Partial<HomeSliderItem>;
    const title = asSafeString(item.title).slice(0, 140);
    if (!title) continue;

    let id = asSafeString(item.id) || `slide-${index + 1}`;
    while (ids.has(id)) {
      id = `${id}-${index + 1}`;
    }
    ids.add(id);

    output.push({
      id,
      badge: asSafeString(item.badge).slice(0, 60),
      title,
      description: asSafeString(item.description).slice(0, 420),
      ctaPrimary: asSafeString(item.ctaPrimary).slice(0, 40) || "Shop Now",
      ctaPrimaryHref: normalizeMenuHref(item.ctaPrimaryHref ?? "/shop"),
      ctaSecondary: asSafeString(item.ctaSecondary).slice(0, 40) || "Shiko koleksionin",
      ctaSecondaryHref: normalizeMenuHref(item.ctaSecondaryHref ?? "/collections"),
      imageUrl: asSafeString(item.imageUrl) || HOME_SLIDER_DEFAULT_IMAGE,
      gradientPreset: normalizeHomeSliderPreset(item.gradientPreset),
    });

    if (output.length >= 12) break;
  }

  return output.length > 0 ? output : defaultHomeSlides();
}

function defaultSiteSettings(): SiteSettings {
  return {
    siteTitle: "BLI Shop",
    brandName: "BLI",
    layoutMaxWidthPx: 1440,
    mediaUploadMaxMb: 10,
    logoUrl: "/logo.svg",
    iconUrl: "/favicon.ico",
    brandingVersion: 1,
    useLogoOnly: false,
    headerMenu: defaultHeaderMenu(),
    homeSlides: defaultHomeSlides(),
    sliderAutoplayMs: 4500,
    sliderShowArrows: true,
    sliderShowDots: true,
    titleFont: "var(--font-geist-sans), sans-serif",
    textFont: "var(--font-geist-sans), sans-serif",
    buttonFont: "var(--font-geist-sans), sans-serif",
    uiFont: "var(--font-geist-sans), sans-serif",
    primaryColor: "#ff8a00",
    secondaryColor: "#0f172a",
    accentColor: "#2ea2cc",
    backgroundColor: "#ffffff",
    emailProvider: "smtp",
    emailFromName: "BLI Shop",
    emailFromAddress: "noreply@bli.local",
    mailHost: "smtp.mailserver.local",
    mailPort: 587,
    mailSecure: false,
    mailUsername: "",
    mailPassword: "",
    phpMailerPath: "",
    reactEmailApiUrl: "",
    reactEmailApiKey: "",
    notifyCustomerOrderConfirmation: true,
    notifyAdminPaidOrder: true,
    notifyShippedOrder: true,
    notifyLowStock: true,
    paymentCadEnabled: true,
    paymentBankTransferEnabled: true,
    paymentStripeDemoEnabled: true,
    paymentBankTransferInstructions:
      "Use order ID as payment reference. Bank: Demo Bank, IBAN: AL47 2121 1009 0000 0002 3569 8741.",
    shippingStandardEnabled: true,
    shippingStandardLabel: "Standard shipping",
    shippingStandardEta: "2-4 business days",
    shippingStandardPrice: 6,
    shippingExpressEnabled: true,
    shippingExpressLabel: "Express shipping",
    shippingExpressEta: "1-2 business days",
    shippingExpressPrice: 12,
    shippingFreeThreshold: 120,
  };
}

function normalizeMenuHref(value: unknown): string {
  const raw = asSafeString(value);
  if (!raw) return "/";
  if (raw.startsWith("#")) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;

  let href = raw.startsWith("/") ? raw : `/${raw}`;
  href = href.replace(/\/{2,}/g, "/");
  if (href.length > 1 && href.endsWith("/")) {
    href = href.slice(0, -1);
  }
  return href || "/";
}

function normalizeHeaderMenu(input: unknown): SiteMenuItem[] {
  if (!Array.isArray(input)) return [];

  const items: SiteMenuItem[] = [];
  const seen = new Set<string>();

  for (const rawItem of input) {
    if (typeof rawItem !== "object" || rawItem === null) continue;
    const item = rawItem as { label?: unknown; href?: unknown };
    const label = asSafeString(item.label).slice(0, 60);
    const href = normalizeMenuHref(item.href);
    if (!label) continue;

    const dedupeKey = `${label.toLowerCase()}|${href}`;
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    items.push({ label, href });
  }

  return items.slice(0, 20);
}

function normalizeProductsInPlace(products: Product[]): void {
  const takenSlugs = new Set<string>();

  for (const product of products) {
    product.name = asSafeString(product.name);
    const normalizedCategories = normalizeStringArray(product.categories);
    const fallbackCategory = asSafeString(product.category);
    if (normalizedCategories.length === 0 && fallbackCategory) {
      normalizedCategories.push(fallbackCategory);
    }
    if (normalizedCategories.length === 0) {
      normalizedCategories.push("Uncategorized");
    }
    product.categories = normalizedCategories;
    product.category = normalizedCategories[0];
    product.visibility = normalizeProductVisibility(product.visibility);
    product.visibilityPassword =
      product.visibility === "Password" ? asSafeString(product.visibilityPassword) : "";
    product.description = asSafeString(product.description);
    product.tags = normalizeStringArray(product.tags);
    product.gallery = normalizeStringArray(product.gallery);
    product.price = money(product.price);
    product.salePrice = normalizeSalePrice(product.price, (product as Partial<Product>).salePrice ?? null);
    product.saleScheduleStartAt = normalizeSaleScheduleDate((product as Partial<Product>).saleScheduleStartAt ?? null);
    product.saleScheduleEndAt = normalizeSaleScheduleDate((product as Partial<Product>).saleScheduleEndAt ?? null);
    if (
      product.saleScheduleStartAt &&
      product.saleScheduleEndAt &&
      Date.parse(product.saleScheduleEndAt) <= Date.parse(product.saleScheduleStartAt)
    ) {
      product.saleScheduleEndAt = null;
    }
    if (product.salePrice === null) {
      product.saleScheduleStartAt = null;
      product.saleScheduleEndAt = null;
    }
    product.stock = Math.max(0, Math.floor(Number(product.stock) || 0));
    product.image = asSafeString(product.image) || defaultImageById(product.id);
    if (product.trashedAt === undefined) {
      product.trashedAt = null;
    }
    product.publishStatus = normalizePublicationStatus(product.publishStatus);

    if (product.gallery.length === 0) {
      product.gallery = defaultGalleryById(product.id);
    }

    const baseSlug = slugify(asSafeString(product.slug) || product.name || product.id);
    product.slug = nextUniqueSlug(baseSlug, takenSlugs);
  }
}

function normalizeProductCategoriesInPlace(categories: ProductCategory[]): void {
  const takenSlugs = new Set<string>();
  for (const category of categories) {
    category.name = asSafeString(category.name);
    category.description = asSafeString(category.description);
    category.imageUrl = asSafeString(category.imageUrl);

    const baseSlug = slugify(asSafeString(category.slug) || category.name);
    category.slug = nextUniqueSlug(baseSlug, takenSlugs);
    category.id = asSafeString(category.id) || `CAT-${category.slug}`;
  }
}

function normalizeProductTagsInPlace(tags: ProductTag[]): void {
  const takenSlugs = new Set<string>();
  for (const tag of tags) {
    tag.name = asSafeString(tag.name);
    tag.description = asSafeString(tag.description);
    const baseSlug = slugify(asSafeString(tag.slug) || tag.name);
    tag.slug = nextUniqueSlug(baseSlug, takenSlugs);
    tag.id = asSafeString(tag.id) || `TAG-${tag.slug}`;
  }
}

function ensureTaxonomiesInPlace(s: Store): void {
  const categoryBySlug = new Map<string, ProductCategory>();
  for (const category of s.productCategories) {
    categoryBySlug.set(category.slug, category);
  }

  const tagBySlug = new Map<string, ProductTag>();
  for (const tag of s.productTags) {
    tagBySlug.set(tag.slug, tag);
  }

  for (const product of s.products) {
    const normalizedCategoryNames: string[] = [];
    for (const rawCategoryName of product.categories) {
      const categoryName = asSafeString(rawCategoryName);
      if (!categoryName) continue;
      const categorySlug = slugify(categoryName);
      const existingCategory = categoryBySlug.get(categorySlug);
      if (existingCategory) {
        normalizedCategoryNames.push(existingCategory.name);
      } else {
        const created: ProductCategory = {
          id: `CAT-${categorySlug}`,
          name: categoryName,
          slug: categorySlug,
          description: "",
          imageUrl: "",
        };
        s.productCategories.push(created);
        categoryBySlug.set(categorySlug, created);
        normalizedCategoryNames.push(created.name);
      }
    }

    if (normalizedCategoryNames.length === 0) {
      const uncategorizedSlug = "uncategorized";
      let uncategorized = categoryBySlug.get(uncategorizedSlug);
      if (!uncategorized) {
        uncategorized = {
          id: "CAT-uncategorized",
          name: "Uncategorized",
          slug: uncategorizedSlug,
          description: "",
          imageUrl: "",
        };
        s.productCategories.push(uncategorized);
        categoryBySlug.set(uncategorizedSlug, uncategorized);
      }
      normalizedCategoryNames.push(uncategorized.name);
    }

    product.categories = Array.from(new Set(normalizedCategoryNames));
    product.category = product.categories[0];

    const normalizedTagNames: string[] = [];
    for (const rawTagName of product.tags) {
      const tagName = asSafeString(rawTagName);
      if (!tagName) continue;
      const tagSlug = slugify(tagName);
      const existingTag = tagBySlug.get(tagSlug);
      if (existingTag) {
        normalizedTagNames.push(existingTag.name);
      } else {
        const created: ProductTag = {
          id: `TAG-${tagSlug}`,
          name: tagName,
          slug: tagSlug,
          description: "",
        };
        s.productTags.push(created);
        tagBySlug.set(tagSlug, created);
        normalizedTagNames.push(created.name);
      }
    }
    product.tags = Array.from(new Set(normalizedTagNames));
  }

  normalizeProductCategoriesInPlace(s.productCategories);
  normalizeProductTagsInPlace(s.productTags);
}

function normalizeCouponsInPlace(coupons: Coupon[]): void {
  const seenCodes = new Set<string>();

  for (const coupon of coupons) {
    coupon.code = normalizeCouponCode(coupon.code);
    coupon.description = asSafeString(coupon.description);
    coupon.value = money(coupon.value);
    coupon.minSubtotal = money(coupon.minSubtotal);
    if (coupon.type !== "percent" && coupon.type !== "fixed") {
      coupon.type = "percent";
    }
    if (coupon.type === "percent") {
      coupon.value = Math.min(100, coupon.value);
    }
    coupon.isActive = coupon.isActive !== false;
    if (seenCodes.has(coupon.code)) {
      coupon.code = `${coupon.code}-${coupon.id}`;
    }
    seenCodes.add(coupon.code);
  }
}

function normalizeReviewsInPlace(reviews: ProductReview[]): void {
  for (const review of reviews) {
    review.productId = asSafeString(review.productId);
    review.author = asSafeString(review.author) || "Anonymous";
    review.comment = asSafeString(review.comment);
    review.rating = clampInt(review.rating, 1, 5);
    if (review.status !== "Approved" && review.status !== "Pending" && review.status !== "Hidden") {
      review.status = "Approved";
    }
  }
}

function normalizeOrdersInPlace(orders: Order[]): void {
  for (const order of orders) {
    order.customer = asSafeString(order.customer);
    order.userId = asSafeString(order.userId ?? "") || null;
    order.productId = asSafeString(order.productId);
    order.quantity = Math.max(1, Math.floor(order.quantity));
    order.total = money(order.total);
    order.discount = money(order.discount ?? 0);
    order.couponCode = normalizeCouponCode(order.couponCode ?? "") || null;
    if (
      order.status !== "Pending" &&
      order.status !== "Paid" &&
      order.status !== "Shipped" &&
      order.status !== "Cancelled"
    ) {
      order.status = "Pending";
    }
  }
}

function normalizeUsersInPlace(users: User[]): void {
  const seenEmails = new Set<string>();
  const seenUsernames = new Set<string>();

  for (const user of users) {
    const rawName = asSafeString(user.name);
    const rawSurname = asSafeString(user.surname);
    if (!rawSurname && rawName.includes(" ")) {
      const parts = rawName.split(/\s+/).filter(Boolean);
      user.name = parts.shift() || rawName;
      user.surname = parts.join(" ");
    } else {
      user.name = rawName;
      user.surname = rawSurname;
    }
    user.username = normalizeUsername(user.username || usernameFromName(`${user.name} ${user.surname}`));
    user.email = toEmail(user.email);
    user.password = asSafeString(user.password);
    user.avatarUrl = asSafeString(user.avatarUrl);
    user.role = normalizeUserRole(user.role);
    user.phone = asSafeString(user.phone);
    user.city = asSafeString(user.city);
    user.address = asSafeString(user.address);
    if (user.source !== "Admin" && user.source !== "Checkout") {
      user.source = "Admin";
    }
    if (typeof user.isActive !== "boolean") {
      user.isActive = true;
    }
    if (typeof user.passwordResetRequired !== "boolean") {
      user.passwordResetRequired = false;
    }
    if (typeof user.showToolbar !== "boolean") {
      user.showToolbar = true;
    }

    if (seenEmails.has(user.email)) {
      user.email = `${user.id.toLowerCase()}@bli.local`;
    }
    seenEmails.add(user.email);

    if (seenUsernames.has(user.username)) {
      user.username = nextUniqueUsername(user.username, seenUsernames);
    } else {
      seenUsernames.add(user.username);
    }
  }
}

function normalizePagesInPlace(pages: Page[]): void {
  const takenSlugs = new Set<string>();

  for (const page of pages) {
    page.name = asSafeString(page.name) || "Untitled page";
    page.content = asSafeString(page.content);
    const baseSlug = slugify(asSafeString(page.slug) || page.name || page.id);
    page.slug = nextUniquePageSlug(baseSlug, takenSlugs);
    page.publishStatus = normalizePublicationStatus(page.publishStatus);
    if (page.trashedAt === undefined) {
      page.trashedAt = null;
    }
    page.createdAt = asSafeString(page.createdAt) || new Date().toISOString().slice(0, 10);
    page.updatedAt = asSafeString(page.updatedAt) || page.createdAt;
  }
}

function normalizeMediaInPlace(mediaItems: MediaAsset[]): void {
  const seenUrls = new Set<string>();

  for (let index = mediaItems.length - 1; index >= 0; index -= 1) {
    const media = mediaItems[index];
    media.url = asSafeString(media.url);
    if (!media.url || seenUrls.has(media.url)) {
      mediaItems.splice(index, 1);
      continue;
    }
    seenUrls.add(media.url);
    media.originalUrl = asSafeString(media.originalUrl) || null;
    media.assignedTo = normalizeMediaAssignedTo(media.assignedTo);
    media.assignedToId = asSafeString(media.assignedToId) || null;
    media.uploadedBy = asSafeString(media.uploadedBy) || null;
    media.alt = asSafeString(media.alt);
    media.description = asSafeString(media.description);
    media.createdAt = asSafeString(media.createdAt) || new Date().toISOString().slice(0, 10);
    media.updatedAt = asSafeString(media.updatedAt) || media.createdAt;
    if (media.trashedAt === undefined) {
      media.trashedAt = null;
    }
  }
}

function normalizeSupportTicketsInPlace(tickets: SupportTicket[]): void {
  for (const ticket of tickets) {
    ticket.userId = asSafeString(ticket.userId);
    ticket.username = normalizeUsername(ticket.username);
    ticket.email = toEmail(ticket.email);
    ticket.subject = asSafeString(ticket.subject);
    ticket.message = asSafeString(ticket.message);
    if (!Array.isArray(ticket.replies)) {
      ticket.replies = [];
    }
    ticket.replies = ticket.replies
      .map((reply) => ({
        id: asSafeString(reply.id) || `RPY-${Math.random().toString(36).slice(2, 9)}`,
        by: normalizeUsername(reply.by) || "system",
        message: asSafeString(reply.message),
        createdAt: asSafeString(reply.createdAt) || new Date().toISOString().slice(0, 10),
      }))
      .filter((reply) => Boolean(reply.message));
    if (ticket.status !== "Open" && ticket.status !== "Closed") {
      ticket.status = "Open";
    }
    ticket.createdAt = asSafeString(ticket.createdAt) || new Date().toISOString().slice(0, 10);
    ticket.updatedAt = asSafeString(ticket.updatedAt) || ticket.createdAt;
  }
}

function normalizeAdminNotificationsInPlace(notifications: AdminNotification[]): void {
  for (let index = notifications.length - 1; index >= 0; index -= 1) {
    const notification = notifications[index];
    notification.id = asSafeString(notification.id) || `NTF-${Date.now()}-${index}`;
    if (notification.type !== "Order" && notification.type !== "Ticket" && notification.type !== "User") {
      notification.type = "Order";
    }
    notification.title = asSafeString(notification.title) || "Notification";
    notification.message = asSafeString(notification.message);
    notification.href = normalizeMenuHref(notification.href || "/dashboard");
    notification.createdAt = asSafeString(notification.createdAt) || new Date().toISOString();
    notification.isRead = Boolean(notification.isRead);

    if (!notification.message) {
      notifications.splice(index, 1);
    }
  }

  notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (notifications.length > 120) {
    notifications.splice(120);
  }
}

function normalizePasswordResetTokensInPlace(tokens: PasswordResetToken[]): void {
  const nowMs = Date.now();
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    token.id = asSafeString(token.id);
    token.userId = asSafeString(token.userId);
    token.username = normalizeUsername(token.username);
    token.email = toEmail(token.email);
    token.token = asSafeString(token.token);
    token.createdAt = asSafeString(token.createdAt) || new Date().toISOString();
    token.expiresAt = asSafeString(token.expiresAt);
    token.usedAt = asSafeString(token.usedAt ?? "") || null;

    const expiresMs = Date.parse(token.expiresAt);
    const isExpired = !Number.isFinite(expiresMs) || expiresMs <= nowMs;
    if (!token.id || !token.userId || !token.username || !token.email || !token.token || isExpired) {
      tokens.splice(index, 1);
    }
  }
}

function ensureProductMediaInLibraryInPlace(s: Store): void {
  const urlToMedia = new Map(s.media.map((media) => [media.url, media]));
  const today = new Date().toISOString().slice(0, 10);
  let nextMediaId = maxEntityIdNumber(s.media) + 1;

  for (const product of s.products) {
    const productMediaUrls = [product.image, ...product.gallery].map((url) => asSafeString(url)).filter(Boolean);

    for (const url of productMediaUrls) {
      const existingMedia = urlToMedia.get(url);
      if (existingMedia) {
        if (existingMedia.assignedTo === "Unassigned") {
          existingMedia.assignedTo = "Product";
          existingMedia.assignedToId = product.id;
          existingMedia.updatedAt = today;
        }
        continue;
      }
      const media: MediaAsset = {
        id: formatEntityId(nextMediaId),
        url,
        originalUrl: null,
        assignedTo: "Product",
        assignedToId: product.id,
        uploadedBy: null,
        alt: product.name,
        description: "",
        createdAt: today,
        updatedAt: today,
        trashedAt: null,
      };
      nextMediaId += 1;
      s.media.unshift(media);
      urlToMedia.set(url, media);
    }
  }
}

function normalizeSiteSettingsInPlace(settings: SiteSettings): void {
  settings.siteTitle = asSafeString(settings.siteTitle) || "BLI Shop";
  settings.brandName = asSafeString(settings.brandName) || "BLI";
  settings.layoutMaxWidthPx = clampInt(settings.layoutMaxWidthPx, 960, 2400) || 1440;
  const parsedMediaUploadMaxMb = Number(settings.mediaUploadMaxMb);
  settings.mediaUploadMaxMb = Number.isFinite(parsedMediaUploadMaxMb)
    ? clampInt(parsedMediaUploadMaxMb, 1, 100)
    : 10;
  settings.logoUrl = asSafeString(settings.logoUrl);
  settings.iconUrl = asSafeString(settings.iconUrl) || "/favicon.ico";
  settings.brandingVersion = Math.max(1, Math.floor(Number(settings.brandingVersion) || 1));
  settings.useLogoOnly = Boolean(settings.logoUrl);
  settings.headerMenu = Array.isArray(settings.headerMenu)
    ? normalizeHeaderMenu(settings.headerMenu)
    : defaultHeaderMenu();
  settings.homeSlides = normalizeHomeSlides(settings.homeSlides);
  settings.sliderAutoplayMs = clampInt(settings.sliderAutoplayMs, 1500, 20000) || 4500;
  settings.sliderShowArrows = settings.sliderShowArrows !== false;
  settings.sliderShowDots = settings.sliderShowDots !== false;
  settings.titleFont = asSafeString(settings.titleFont) || "var(--font-geist-sans), sans-serif";
  settings.textFont = asSafeString(settings.textFont) || "var(--font-geist-sans), sans-serif";
  settings.buttonFont = asSafeString(settings.buttonFont) || settings.textFont;
  settings.uiFont = asSafeString(settings.uiFont) || settings.textFont;
  settings.primaryColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(asSafeString(settings.primaryColor))
    ? asSafeString(settings.primaryColor)
    : "#ff8a00";
  settings.secondaryColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(asSafeString(settings.secondaryColor))
    ? asSafeString(settings.secondaryColor)
    : "#0f172a";
  settings.accentColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(asSafeString(settings.accentColor))
    ? asSafeString(settings.accentColor)
    : "#2ea2cc";
  settings.backgroundColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(asSafeString(settings.backgroundColor))
    ? asSafeString(settings.backgroundColor)
    : "#ffffff";
  if (
    settings.emailProvider !== "smtp" &&
    settings.emailProvider !== "phpmailer" &&
    settings.emailProvider !== "react-email"
  ) {
    settings.emailProvider = "smtp";
  }
  settings.emailFromName = asSafeString(settings.emailFromName) || settings.brandName || "BLI Shop";
  settings.emailFromAddress = toEmail(settings.emailFromAddress) || "noreply@bli.local";
  settings.mailHost = asSafeString(settings.mailHost) || "smtp.mailserver.local";
  settings.mailPort = clampInt(settings.mailPort, 1, 65535) || 587;
  settings.mailSecure = Boolean(settings.mailSecure);
  settings.mailUsername = asSafeString(settings.mailUsername);
  settings.mailPassword = asSafeString(settings.mailPassword);
  settings.phpMailerPath = asSafeString(settings.phpMailerPath);
  settings.reactEmailApiUrl = asSafeString(settings.reactEmailApiUrl);
  settings.reactEmailApiKey = asSafeString(settings.reactEmailApiKey);
  settings.notifyCustomerOrderConfirmation = settings.notifyCustomerOrderConfirmation !== false;
  settings.notifyAdminPaidOrder = settings.notifyAdminPaidOrder !== false;
  settings.notifyShippedOrder = settings.notifyShippedOrder !== false;
  settings.notifyLowStock = settings.notifyLowStock !== false;
  settings.paymentCadEnabled = settings.paymentCadEnabled !== false;
  settings.paymentBankTransferEnabled = settings.paymentBankTransferEnabled !== false;
  settings.paymentStripeDemoEnabled = settings.paymentStripeDemoEnabled !== false;
  settings.paymentBankTransferInstructions =
    asSafeString(settings.paymentBankTransferInstructions) ||
    "Use order ID as payment reference. Bank: Demo Bank, IBAN: AL47 2121 1009 0000 0002 3569 8741.";
  settings.shippingStandardEnabled = settings.shippingStandardEnabled !== false;
  settings.shippingStandardLabel = asSafeString(settings.shippingStandardLabel) || "Standard shipping";
  settings.shippingStandardEta = asSafeString(settings.shippingStandardEta) || "2-4 business days";
  settings.shippingStandardPrice = money(Number(settings.shippingStandardPrice) || 0);
  settings.shippingExpressEnabled = settings.shippingExpressEnabled !== false;
  settings.shippingExpressLabel = asSafeString(settings.shippingExpressLabel) || "Express shipping";
  settings.shippingExpressEta = asSafeString(settings.shippingExpressEta) || "1-2 business days";
  settings.shippingExpressPrice = money(Number(settings.shippingExpressPrice) || 0);
  settings.shippingFreeThreshold = money(Number(settings.shippingFreeThreshold) || 0);
}

function buildSeedProduct(seed: ProductSeed): Product {
  return {
    ...seed,
    categories: [seed.category],
    visibility: "Public",
    visibilityPassword: "",
    slug: slugify(seed.name),
    description: "",
    image: defaultImageById(seed.id),
    gallery: defaultGalleryById(seed.id),
    tags: [],
    salePrice: null,
    saleScheduleStartAt: null,
    saleScheduleEndAt: null,
    publishStatus: "Published",
    trashedAt: null,
  };
}

const DEMO_FIRST_NAMES = [
  "Emiljano",
  "Ardit",
  "Lea",
  "Klea",
  "Arian",
  "Jon",
  "Mira",
  "Sara",
  "Endri",
  "Erisa",
  "Luan",
  "Denis",
  "Bora",
  "Aldi",
  "Elona",
  "Sindi",
  "Drin",
  "Arba",
  "Kristi",
  "Nora",
];

const DEMO_LAST_NAMES = [
  "Gogo",
  "Kola",
  "Dema",
  "Rama",
  "Hoxha",
  "Muca",
  "Leka",
  "Mema",
  "Pepa",
  "Sula",
  "Gjini",
  "Krasniqi",
  "Tafa",
  "Nika",
  "Doda",
  "Biba",
  "Mata",
  "Rrasa",
  "Prendi",
  "Kodra",
];

const DEMO_CITIES = [
  "Tirane",
  "Durres",
  "Vlore",
  "Shkoder",
  "Elbasan",
  "Fier",
  "Korce",
  "Lezhe",
];

function demoDateByIndex(index: number): string {
  const day = (index % 28) + 1;
  const month = index % 2 === 0 ? "01" : "02";
  return `2026-${month}-${String(day).padStart(2, "0")}`;
}

function generateDemoUsers(count: number, startId = 7101): User[] {
  return Array.from({ length: count }, (_, index) => {
    const firstName = DEMO_FIRST_NAMES[(index * 7 + 3) % DEMO_FIRST_NAMES.length];
    const lastName = DEMO_LAST_NAMES[(index * 11 + 5) % DEMO_LAST_NAMES.length];
    const city = DEMO_CITIES[(index * 5 + 2) % DEMO_CITIES.length];
    const baseUsername = normalizeUsername(`${firstName}${lastName}`);
    const role: UserRole =
      index % 23 === 0 ? "Admin" : index % 11 === 0 ? "Manager" : "Customer";
    const source: UserSource = role === "Customer" ? "Checkout" : "Admin";
    const suffix = index + 1;
    const phoneSerial = String(1000000 + ((index * 7919) % 9000000));

    return {
      id: `USR-${String(startId + index)}`,
      name: firstName,
      surname: lastName,
      username: baseUsername,
      email: `${baseUsername}${suffix}@demo.bli`,
      password: "demo1234",
      avatarUrl: "",
      role,
      phone: `+35569${phoneSerial}`,
      city,
      address: `Street ${10 + suffix}, ${city}`,
      source,
      createdAt: demoDateByIndex(index),
      isActive: true,
      passwordResetRequired: false,
      showToolbar: true,
    };
  });
}

function createInitialStore(): Store {
  const initialCategoryNames = Array.from(new Set(PRODUCT_SEEDS.map((seed) => seed.category)));

  return {
    seq: 1100,
    products: PRODUCT_SEEDS.map(buildSeedProduct),
    productCategories: initialCategoryNames.map((name) => {
      const slug = slugify(name);
      return {
        id: `CAT-${slug}`,
        name,
        slug,
        description: "",
        imageUrl: "",
      };
    }),
    productTags: [],
    orders: [
      {
        id: "ORD-2001",
        customer: "Arber D.",
        productId: "PRD-1002",
        quantity: 1,
        total: 129,
        discount: 0,
        couponCode: null,
        status: "Paid",
        createdAt: "2026-02-10",
      },
      {
        id: "ORD-2002",
        customer: "Sara K.",
        productId: "PRD-1001",
        quantity: 1,
        total: 899,
        discount: 0,
        couponCode: null,
        status: "Shipped",
        createdAt: "2026-02-11",
      },
      {
        id: "ORD-2003",
        customer: "Denisa T.",
        productId: "PRD-1004",
        quantity: 2,
        total: 318,
        discount: 0,
        couponCode: null,
        status: "Pending",
        createdAt: "2026-02-12",
      },
    ],
    sales: [
      { id: "SAL-3001", source: "Website", amount: 2400, createdAt: "2026-02-08" },
      { id: "SAL-3002", source: "Instagram", amount: 1600, createdAt: "2026-02-10" },
      { id: "SAL-3003", source: "Email Campaign", amount: 980, createdAt: "2026-02-12" },
    ],
    accounts: [
      {
        id: "ADM-4001",
        name: "Marcus George",
        email: "admin@bli.al",
        role: "Admin",
        createdAt: "2026-01-01",
      },
    ],
    coupons: [
      {
        id: "CPN-5001",
        code: "WELCOME10",
        description: "10% off for new orders",
        type: "percent",
        value: 10,
        minSubtotal: 50,
        isActive: true,
        createdAt: "2026-02-01",
      },
      {
        id: "CPN-5002",
        code: "SAVE25",
        description: "Flat $25 off",
        type: "fixed",
        value: 25,
        minSubtotal: 150,
        isActive: true,
        createdAt: "2026-02-03",
      },
    ],
    reviews: [
      {
        id: "REV-6001",
        productId: "PRD-1001",
        author: "Erisa L.",
        rating: 5,
        comment: "Produkt super, shume i shpejte dhe bateri e mire.",
        status: "Approved",
        createdAt: "2026-02-09",
      },
      {
        id: "REV-6002",
        productId: "PRD-1002",
        author: "Luan M.",
        rating: 4,
        comment: "Kualitet i mire per cmimin.",
        status: "Approved",
        createdAt: "2026-02-10",
      },
      {
        id: "REV-6003",
        productId: "PRD-1003",
        author: "Ari T.",
        rating: 5,
        comment: "Me pelqeu dizajni dhe ekranit.",
        status: "Approved",
        createdAt: "2026-02-12",
      },
    ],
    users: [
      {
        id: "USR-7001",
        name: "Emiljano",
        surname: "Gogo",
        username: "emiljano",
        email: "emiljano@bli.local",
        password: "demo1234",
        avatarUrl: "",
        role: "Super Admin",
        phone: "+355691001001",
        city: "Tirane",
        address: "Rr. e Kavajes",
        source: "Admin",
        createdAt: "2026-02-01",
        isActive: true,
        passwordResetRequired: false,
        showToolbar: true,
      },
      ...generateDemoUsers(100, 7002),
    ],
    pages: [],
    media: [],
    supportTickets: [],
    adminNotifications: [],
    passwordResetTokens: [],
    settings: defaultSiteSettings(),
  };
}

function migrateLegacyUsersInPlace(s: Store): void {
  const hasEmiljanoUser = s.users.some((user) => normalizeUsername(user.username) === "emiljano");
  const hasLegacySeedUsers = s.users.some(
    (user) => user.email === "sara@example.com" || user.email === "arber@example.com",
  );
  if (!hasLegacySeedUsers && hasEmiljanoUser) return;

  const existingEmiljano = s.users.find(
    (user) => normalizeUsername(user.username) === "emiljano" || toEmail(user.email) === "emiljano@bli.local",
  );

  s.users = [
    {
      id: existingEmiljano?.id || "USR-7001",
      name: existingEmiljano?.name || "Emiljano",
      surname: existingEmiljano?.surname || "Gogo",
      username: "emiljano",
      email: "emiljano@bli.local",
      password: existingEmiljano?.password || "demo1234",
      avatarUrl: existingEmiljano?.avatarUrl || "",
      role: "Super Admin",
      phone: existingEmiljano?.phone || "+355691001001",
      city: existingEmiljano?.city || "Tirane",
      address: existingEmiljano?.address || "Rr. e Kavajes",
      source: "Admin",
      createdAt: existingEmiljano?.createdAt || "2026-02-01",
      isActive: true,
      passwordResetRequired: false,
      showToolbar: existingEmiljano?.showToolbar ?? true,
    },
    ...generateDemoUsers(100, 7002),
  ];
}

function migrateLegacyEntityIdsInPlace(s: Store): void {
  const entityCollections: Array<Array<{ id: string }>> = [
    s.products,
    s.orders,
    s.sales,
    s.accounts,
    s.coupons,
    s.reviews,
    s.users,
    s.pages,
    s.media,
    s.supportTickets,
  ];
  const needsMigration = entityCollections.some((items) => !hasCleanNumericIds(items));
  if (!needsMigration) return;

  const productIdMap = remapEntityIdsInPlace(s.products);
  remapEntityIdsInPlace(s.orders);
  remapEntityIdsInPlace(s.sales);
  remapEntityIdsInPlace(s.accounts);
  remapEntityIdsInPlace(s.coupons);
  remapEntityIdsInPlace(s.reviews);
  remapEntityIdsInPlace(s.users);
  remapEntityIdsInPlace(s.pages);
  remapEntityIdsInPlace(s.media);
  remapEntityIdsInPlace(s.supportTickets);

  for (const order of s.orders) {
    const mappedProductId = productIdMap.get(order.productId);
    if (mappedProductId) {
      order.productId = mappedProductId;
    }
  }

  for (const review of s.reviews) {
    const mappedProductId = productIdMap.get(review.productId);
    if (mappedProductId) {
      review.productId = mappedProductId;
    }
  }
}

function store(): Store {
  if (!globalThis.__bli_store__) {
    isHydratingStore = true;
    try {
      globalThis.__bli_store__ = toPersistentProxy(loadStoreFromDisk() ?? createInitialStore());

      if (!globalThis.__bli_store__.coupons) {
        globalThis.__bli_store__.coupons = [];
      }
      if (!globalThis.__bli_store__.reviews) {
        globalThis.__bli_store__.reviews = [];
      }
      if (!globalThis.__bli_store__.productCategories) {
        globalThis.__bli_store__.productCategories = [];
      }
      if (!globalThis.__bli_store__.productTags) {
        globalThis.__bli_store__.productTags = [];
      }
      if (!globalThis.__bli_store__.users) {
        globalThis.__bli_store__.users = [];
      }
      if (!globalThis.__bli_store__.pages) {
        globalThis.__bli_store__.pages = [];
      }
      if (!globalThis.__bli_store__.media) {
        globalThis.__bli_store__.media = [];
      }
      if (!globalThis.__bli_store__.supportTickets) {
        globalThis.__bli_store__.supportTickets = [];
      }
      if (!globalThis.__bli_store__.adminNotifications) {
        globalThis.__bli_store__.adminNotifications = [];
      }
      if (!globalThis.__bli_store__.passwordResetTokens) {
        globalThis.__bli_store__.passwordResetTokens = [];
      }
      if (!globalThis.__bli_store__.settings) {
        globalThis.__bli_store__.settings = defaultSiteSettings();
      }

      migrateLegacyUsersInPlace(globalThis.__bli_store__);
      migrateLegacyEntityIdsInPlace(globalThis.__bli_store__);
      normalizeOrdersInPlace(globalThis.__bli_store__.orders);
      normalizeProductsInPlace(globalThis.__bli_store__.products);
      normalizeProductCategoriesInPlace(globalThis.__bli_store__.productCategories);
      normalizeProductTagsInPlace(globalThis.__bli_store__.productTags);
      ensureTaxonomiesInPlace(globalThis.__bli_store__);
      normalizeCouponsInPlace(globalThis.__bli_store__.coupons);
      normalizeReviewsInPlace(globalThis.__bli_store__.reviews);
      normalizeUsersInPlace(globalThis.__bli_store__.users);
      normalizePagesInPlace(globalThis.__bli_store__.pages);
      normalizeMediaInPlace(globalThis.__bli_store__.media);
      normalizeSupportTicketsInPlace(globalThis.__bli_store__.supportTickets);
      normalizeAdminNotificationsInPlace(globalThis.__bli_store__.adminNotifications);
      normalizePasswordResetTokensInPlace(globalThis.__bli_store__.passwordResetTokens);
      if (globalThis.__bli_store__.media.length === 0) {
        ensureProductMediaInLibraryInPlace(globalThis.__bli_store__);
        normalizeMediaInPlace(globalThis.__bli_store__.media);
      }
      normalizeSiteSettingsInPlace(globalThis.__bli_store__.settings);
    } finally {
      isHydratingStore = false;
    }

    persistStoreNow();
  }

  if (!Array.isArray(globalThis.__bli_store__.productCategories)) {
    globalThis.__bli_store__.productCategories = [];
  }
  if (!Array.isArray(globalThis.__bli_store__.productTags)) {
    globalThis.__bli_store__.productTags = [];
  }

  return globalThis.__bli_store__;
}

function nextId(prefix: string): string {
  const s = store();
  if (prefix === "PRD") return nextEntityId(s.products);
  if (prefix === "ORD") return nextEntityId(s.orders);
  if (prefix === "SAL") return nextEntityId(s.sales);
  if (prefix === "ADM") return nextEntityId(s.accounts);
  if (prefix === "CPN") return nextEntityId(s.coupons);
  if (prefix === "REV") return nextEntityId(s.reviews);
  if (prefix === "USR") return nextEntityId(s.users);
  if (prefix === "PGE") return nextEntityId(s.pages);
  if (prefix === "MDA") return nextEntityId(s.media);
  if (prefix === "TKT") {
    const tickets = (s as Store & { supportTickets?: SupportTicket[] }).supportTickets;
    if (!Array.isArray(tickets)) {
      (s as Store & { supportTickets?: SupportTicket[] }).supportTickets = [];
      return nextEntityId((s as Store & { supportTickets: SupportTicket[] }).supportTickets);
    }
    return nextEntityId(tickets);
  }

  s.seq += 1;
  return formatEntityId(s.seq);
}

function canIncludeProduct(product: Product, options: ListProductsOptions = {}): boolean {
  if (options.onlyTrashed) {
    return Boolean(product.trashedAt);
  }
  if (!options.includeTrashed && product.trashedAt) {
    return false;
  }
  if (!options.includeDrafts && product.publishStatus === "Draft") {
    return false;
  }
  return true;
}

function canIncludePage(page: Page, options: ListPagesOptions = {}): boolean {
  if (options.onlyTrashed) {
    return Boolean(page.trashedAt);
  }
  if (!options.includeTrashed && page.trashedAt) {
    return false;
  }
  if (!options.includeDrafts && page.publishStatus === "Draft") {
    return false;
  }
  return true;
}

export function listProducts(options: ListProductsOptions = {}): Product[] {
  const products = store().products;
  return products.filter((product) => canIncludeProduct(product, options)).map(cloneProduct);
}

export function peekNextProductId(): string {
  return nextEntityId(store().products);
}

export function listProductCategories(): ProductCategory[] {
  const categories = store().productCategories;
  return Array.isArray(categories) ? categories.map(cloneProductCategory) : [];
}

export function listProductTags(): ProductTag[] {
  const tags = store().productTags;
  return Array.isArray(tags) ? tags.map(cloneProductTag) : [];
}

export function getProductById(
  productId: string,
  options: { includeTrashed?: boolean; includeDrafts?: boolean } = {},
): Product | null {
  const target = store().products.find((item) => item.id === productId);
  if (!target) return null;
  if (!canIncludeProduct(target, options)) return null;

  return cloneProduct(target);
}

export function getProductBySlug(
  slug: string,
  options: { includeTrashed?: boolean; includeDrafts?: boolean } = {},
): Product | null {
  const normalizedSlug = slugify(slug);
  const target = store().products.find((item) => item.slug === normalizedSlug);
  if (!target) return null;
  if (!canIncludeProduct(target, options)) return null;

  return cloneProduct(target);
}

export function listOrders(): Order[] {
  return [...store().orders].sort((a, b) => b.id.localeCompare(a.id));
}

export function listOrdersByCustomer(customerQuery: string): Order[] {
  const safe = asSafeString(customerQuery).toLowerCase();
  if (!safe) return [];
  return listOrders().filter((order) => asSafeString(order.customer).toLowerCase().includes(safe));
}

export function listOrdersByUser(userId: string): Order[] {
  const safe = asSafeString(userId);
  if (!safe) return [];
  return listOrders().filter((order) => asSafeString(order.userId ?? "") === safe);
}

function ensureSupportTicketsStore(): SupportTicket[] {
  const s = store() as Store & { supportTickets?: SupportTicket[] };
  if (!Array.isArray(s.supportTickets)) {
    s.supportTickets = [];
  }
  return s.supportTickets;
}

function ensureAdminNotificationsStore(): AdminNotification[] {
  const s = store() as Store & { adminNotifications?: AdminNotification[] };
  if (!Array.isArray(s.adminNotifications)) {
    s.adminNotifications = [];
  }
  return s.adminNotifications;
}

function pushAdminNotification(input: {
  type: AdminNotificationType;
  title: string;
  message: string;
  href: string;
}): AdminNotification | null {
  const type =
    input.type === "Ticket" || input.type === "User"
      ? input.type
      : "Order";
  const title = asSafeString(input.title) || "Notification";
  const message = asSafeString(input.message);
  if (!message) return null;

  const notifications = ensureAdminNotificationsStore();
  const notification: AdminNotification = {
    id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    message,
    href: normalizeMenuHref(input.href || "/dashboard"),
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  notifications.unshift(notification);
  normalizeAdminNotificationsInPlace(notifications);
  return cloneAdminNotification(notification);
}

function isAdminLikeActor(actor: string): boolean {
  const normalized = normalizeUsername(actor);
  if (!normalized) return false;
  if (normalized.includes("admin")) return true;
  const user = store().users.find((item) => item.username === normalized);
  return user ? user.role !== "Customer" : false;
}

export function addAdminNotification(input: {
  type: AdminNotificationType;
  title: string;
  message: string;
  href: string;
}): AdminNotification | null {
  return pushAdminNotification(input);
}

export function listSupportTicketsByUser(userId: string): SupportTicket[] {
  const safeUserId = asSafeString(userId);
  if (!safeUserId) return [];
  return ensureSupportTicketsStore()
    .filter((ticket) => ticket.userId === safeUserId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(cloneSupportTicket);
}

export function listSupportTickets(): SupportTicket[] {
  return ensureSupportTicketsStore()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(cloneSupportTicket);
}

export function listAdminNotifications(limit = 15): AdminNotification[] {
  const safeLimit = clampInt(limit, 1, 50);
  return ensureAdminNotificationsStore()
    .slice(0, safeLimit)
    .map(cloneAdminNotification);
}

export function countUnreadAdminNotifications(): number {
  return ensureAdminNotificationsStore().filter((notification) => !notification.isRead).length;
}

export function markAllAdminNotificationsAsRead(): number {
  const notifications = ensureAdminNotificationsStore();
  let updated = 0;
  for (const notification of notifications) {
    if (!notification.isRead) {
      notification.isRead = true;
      updated += 1;
    }
  }
  return updated;
}

export function clearReadAdminNotifications(): number {
  const notifications = ensureAdminNotificationsStore();
  const before = notifications.length;
  const unreadOnly = notifications.filter((notification) => !notification.isRead);
  notifications.splice(0, notifications.length, ...unreadOnly);
  return Math.max(0, before - notifications.length);
}

export function addSupportTicket(input: {
  userId: string;
  username: string;
  email: string;
  subject: string;
  message: string;
}): SupportTicket | null {
  const userId = asSafeString(input.userId);
  const username = normalizeUsername(input.username);
  const email = toEmail(input.email);
  const subject = asSafeString(input.subject);
  const message = asSafeString(input.message);
  if (!userId || !username || !email || !subject || !message) return null;

  const now = new Date().toISOString().slice(0, 10);
  const ticket: SupportTicket = {
    id: nextId("TKT"),
    userId,
    username,
    email,
    subject,
    message,
    replies: [],
    status: "Open",
    createdAt: now,
    updatedAt: now,
  };
  ensureSupportTicketsStore().unshift(ticket);
  pushAdminNotification({
    type: "Ticket",
    title: "New ticket",
    message: `${ticket.subject} (${ticket.username})`,
    href: "/dashboard/help-tickets",
  });
  return cloneSupportTicket(ticket);
}

export function addSupportTicketReply(ticketId: string, by: string, message: string): SupportTicket | null {
  const safeTicketId = asSafeString(ticketId);
  const safeBy = normalizeUsername(by);
  const safeMessage = asSafeString(message);
  if (!safeTicketId || !safeBy || !safeMessage) return null;

  const target = ensureSupportTicketsStore().find((ticket) => ticket.id === safeTicketId);
  if (!target) return null;
  if (!Array.isArray(target.replies)) {
    target.replies = [];
  }

  const now = new Date().toISOString().slice(0, 10);
  const reply: SupportTicketReply = {
    id: `${target.id}-RPY-${target.replies.length + 1}`,
    by: safeBy,
    message: safeMessage,
    createdAt: now,
  };
  target.replies.push(reply);
  target.updatedAt = now;
  if (target.status !== "Open") {
    target.status = "Open";
  }
  if (!isAdminLikeActor(safeBy)) {
    pushAdminNotification({
      type: "Ticket",
      title: "Ticket reply",
      message: `${target.subject} (${target.username})`,
      href: "/dashboard/help-tickets",
    });
  }
  return cloneSupportTicket(target);
}

export function setSupportTicketStatus(ticketId: string, status: SupportTicketStatus): SupportTicket | null {
  const safeTicketId = asSafeString(ticketId);
  if (!safeTicketId) return null;
  if (status !== "Open" && status !== "Closed") return null;

  const target = ensureSupportTicketsStore().find((ticket) => ticket.id === safeTicketId);
  if (!target) return null;
  target.status = status;
  target.updatedAt = new Date().toISOString().slice(0, 10);
  return cloneSupportTicket(target);
}

export function deleteSupportTicket(ticketId: string): boolean {
  const safeTicketId = asSafeString(ticketId);
  if (!safeTicketId) return false;
  const tickets = ensureSupportTicketsStore();
  const index = tickets.findIndex((ticket) => ticket.id === safeTicketId);
  if (index === -1) return false;
  tickets.splice(index, 1);
  return true;
}

export function listSales(): Sale[] {
  return [...store().sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAdminAccounts(): AdminAccount[] {
  return [...store().accounts].sort((a, b) => b.id.localeCompare(a.id));
}

export function listCoupons(): Coupon[] {
  return [...store().coupons].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(cloneCoupon);
}

export function getCouponByCode(code: string): Coupon | null {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  const target = store().coupons.find((item) => item.code === normalized && item.isActive);
  return target ? cloneCoupon(target) : null;
}

export function applyCoupon(code: string, subtotal: number): CouponApplyResult {
  const safeSubtotal = money(subtotal);
  if (!code) return { coupon: null, discount: 0 };

  const coupon = getCouponByCode(code);
  if (!coupon) {
    return { coupon: null, discount: 0, error: "Kuponi nuk ekziston ose nuk eshte aktiv." };
  }

  if (safeSubtotal <= 0) {
    return { coupon, discount: 0, error: "Subtotal duhet te jete me i madh se 0." };
  }

  if (safeSubtotal < coupon.minSubtotal) {
    return {
      coupon,
      discount: 0,
      error: `Kuponi kerkon minimum ${coupon.minSubtotal}.`,
    };
  }

  const rawDiscount =
    coupon.type === "percent" ? (safeSubtotal * coupon.value) / 100 : coupon.value;
  const discount = Math.min(safeSubtotal, money(rawDiscount));

  return { coupon, discount };
}

export function addCoupon(input: CouponInput): Coupon | null {
  const code = normalizeCouponCode(input.code);
  if (!code) return null;
  if (store().coupons.some((item) => item.code === code)) return null;
  if (input.value <= 0) return null;

  const coupon: Coupon = {
    id: nextId("CPN"),
    code,
    description: asSafeString(input.description),
    type: input.type === "fixed" ? "fixed" : "percent",
    value: money(input.value),
    minSubtotal: money(input.minSubtotal ?? 0),
    isActive: input.isActive ?? true,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  if (coupon.type === "percent") {
    coupon.value = Math.min(100, coupon.value);
  }

  store().coupons.unshift(coupon);
  return cloneCoupon(coupon);
}

export function setCouponStatus(couponId: string, isActive: boolean): Coupon | null {
  const target = store().coupons.find((item) => item.id === couponId);
  if (!target) return null;
  target.isActive = isActive;
  return cloneCoupon(target);
}

export function listReviews(options: ListReviewOptions = {}): ProductReview[] {
  const { productId, status } = options;

  return store()
    .reviews.filter((review) => {
      if (productId && review.productId !== productId) return false;
      if (status && status !== "all" && review.status !== status) return false;
      if (!status && review.status !== "Approved") return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(cloneReview);
}

export function addReview(input: ProductReviewInput): ProductReview | null {
  const productId = asSafeString(input.productId);
  if (!productId) return null;
  const product = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  if (!product) return null;

  const review: ProductReview = {
    id: nextId("REV"),
    productId,
    author: asSafeString(input.author) || "Anonymous",
    rating: clampInt(input.rating, 1, 5),
    comment: asSafeString(input.comment),
    status: input.status ?? "Approved",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  store().reviews.unshift(review);
  return cloneReview(review);
}

export function updateReviewStatus(reviewId: string, status: ReviewStatus): ProductReview | null {
  const target = store().reviews.find((item) => item.id === reviewId);
  if (!target) return null;
  target.status = status;
  return cloneReview(target);
}

export function deleteReview(reviewId: string): boolean {
  const items = store().reviews;
  const index = items.findIndex((item) => item.id === reviewId);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

export function getReviewSummary(productId: string): { average: number; count: number } {
  const reviews = listReviews({ productId, status: "Approved" });
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    average: Number((total / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}

export function listUsers(): User[] {
  return [...store().users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(cloneUser);
}

export function getUserById(userId: string): User | null {
  const target = store().users.find((item) => item.id === userId);
  return target ? cloneUser(target) : null;
}

export function findUserByEmail(email: string): User | null {
  const normalized = toEmail(email);
  if (!normalized) return null;
  const target = store().users.find((item) => item.email === normalized);
  return target ? cloneUser(target) : null;
}

export function findUserByUsername(username: string): User | null {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const target = store().users.find((item) => item.username === normalized);
  return target ? cloneUser(target) : null;
}

export function authenticateUser(identifier: string, password: string): User | null {
  const safePassword = asSafeString(password);
  if (!safePassword) return null;

  const byEmail = findUserByEmail(identifier);
  if (byEmail && byEmail.password === safePassword && byEmail.isActive) {
    return byEmail;
  }

  const byUsername = findUserByUsername(identifier);
  if (byUsername && byUsername.password === safePassword && byUsername.isActive) {
    return byUsername;
  }

  return null;
}

function newPasswordResetToken(): string {
  const value = Math.floor(100000 + Math.random() * 900000);
  return String(value);
}

function nextPasswordResetTokenId(): string {
  const seed = Math.random().toString(36).slice(2, 8);
  return `PRT-${Date.now().toString(36)}-${seed}`;
}

export function requestPasswordReset(identifier: string): {
  sent: boolean;
  token?: PasswordResetToken;
} {
  const byEmail = findUserByEmail(identifier);
  const byUsername = findUserByUsername(identifier);
  const user = byEmail ?? byUsername;
  if (!user || !user.isActive) {
    return { sent: false };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 30); // 30 min
  const token: PasswordResetToken = {
    id: nextPasswordResetTokenId(),
    userId: user.id,
    username: user.username,
    email: user.email,
    token: newPasswordResetToken(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    usedAt: null,
  };

  const tokenStore = (store() as Store).passwordResetTokens;
  tokenStore.unshift(token);
  normalizePasswordResetTokensInPlace(tokenStore);

  return {
    sent: true,
    token: clonePasswordResetToken(token),
  };
}

export function resetPasswordWithToken(input: {
  identifier: string;
  token: string;
  newPassword: string;
}): boolean {
  const identifier = asSafeString(input.identifier);
  const token = asSafeString(input.token);
  const newPassword = asSafeString(input.newPassword);
  if (!identifier || !token || newPassword.length < 6) return false;

  const byEmail = findUserByEmail(identifier);
  const byUsername = findUserByUsername(identifier);
  const user = byEmail ?? byUsername;
  if (!user || !user.isActive) return false;

  const tokenStore = (store() as Store).passwordResetTokens;
  normalizePasswordResetTokensInPlace(tokenStore);
  const now = Date.now();
  const matched = tokenStore.find(
    (entry) =>
      entry.userId === user.id &&
      entry.token === token &&
      !entry.usedAt &&
      Number.isFinite(Date.parse(entry.expiresAt)) &&
      Date.parse(entry.expiresAt) > now,
  );
  if (!matched) return false;

  const updated = updateUser(user.id, {
    name: user.name,
    surname: user.surname,
    username: user.username,
    email: user.email,
    password: newPassword,
    avatarUrl: user.avatarUrl,
    role: user.role,
    phone: user.phone,
    city: user.city,
    address: user.address,
  });
  if (!updated) return false;

  matched.usedAt = new Date().toISOString();
  return true;
}

function nextAvailableUsername(
  users: User[],
  preferred: string,
  options: { excludeUserId?: string } = {},
): string {
  const taken = new Set(
    users.filter((item) => item.id !== options.excludeUserId).map((item) => item.username),
  );
  return nextUniqueUsername(preferred, taken);
}

export function addUser(input: UserInput): User | null {
  const email = toEmail(input.email);
  const name = asSafeString(input.name);
  const surname = asSafeString(input.surname);
  const password = asSafeString(input.password);
  const source = input.source ?? "Admin";
  const role = input.role ? normalizeUserRole(input.role) : source === "Checkout" ? "Customer" : "Admin";

  if (!email || !name || password.length < 6) return null;
  if (findUserByEmail(email)) return null;

  const users = store().users;
  const username = nextAvailableUsername(users, input.username || usernameFromName(`${name} ${surname}`));

  const user: User = {
    id: nextId("USR"),
    name,
    surname,
    username,
    email,
    password,
    avatarUrl: asSafeString(input.avatarUrl),
    role,
    phone: asSafeString(input.phone),
    city: asSafeString(input.city),
    address: asSafeString(input.address),
    source,
    createdAt: new Date().toISOString().slice(0, 10),
    isActive: true,
    passwordResetRequired: false,
    showToolbar: input.showToolbar !== false,
  };

  users.unshift(user);
  return cloneUser(user);
}

export function listCustomers(): User[] {
  return listUsers().filter((user) => user.role === "Customer");
}

export function updateUser(userId: string, input: UserUpdateInput): User | null {
  const users = store().users;
  const target = users.find((item) => item.id === userId);
  if (!target) return null;

  const email = toEmail(input.email);
  if (!email) return null;
  const emailTaken = users.some((item) => item.id !== userId && item.email === email);
  if (emailTaken) return null;

  const password = asSafeString(input.password);
  if (password && password.length < 6) return null;

  target.name = asSafeString(input.name);
  target.surname = asSafeString(input.surname);
  target.email = email;
  target.username = nextAvailableUsername(
    users,
    input.username || usernameFromName(`${target.name} ${target.surname}`),
    { excludeUserId: userId },
  );
  target.role = normalizeUserRole(input.role);
  if (password) {
    target.password = password;
    target.passwordResetRequired = false;
  }
  target.avatarUrl = asSafeString(input.avatarUrl);
  target.phone = asSafeString(input.phone);
  target.city = asSafeString(input.city);
  target.address = asSafeString(input.address);
  if (input.showToolbar !== undefined) {
    target.showToolbar = Boolean(input.showToolbar);
  }

  return cloneUser(target);
}

export function canCreateUserRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const actor = normalizeUserRole(actorRole);
  const target = normalizeUserRole(targetRole);

  if (actor === "Super Admin") return true;
  if (actor === "Admin") return target !== "Super Admin";
  if (actor === "Manager") return target === "Manager" || target === "Customer";
  return false;
}

export function canDeleteUser(actorRole: UserRole, targetRole: UserRole): boolean {
  const normalizedActor = normalizeUserRole(actorRole);
  const normalizedTarget = normalizeUserRole(targetRole);

  if (normalizedActor === "Customer") return false;
  if (normalizedActor === "Super Admin") return true;
  if (normalizedTarget === "Super Admin") return false;
  return normalizedActor === "Admin" || normalizedActor === "Manager";
}

export function deleteUser(userId: string, actorRole: UserRole): boolean {
  const users = store().users;
  const target = users.find((item) => item.id === userId);
  if (!target) return false;
  if (!canDeleteUser(actorRole, target.role)) return false;

  const index = users.findIndex((item) => item.id === userId);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

export function deactivateUser(userId: string, actorRole: UserRole): boolean {
  const target = store().users.find((item) => item.id === userId);
  if (!target) return false;
  if (!canDeleteUser(actorRole, target.role)) return false;

  target.isActive = false;
  return true;
}

export function markUserPasswordResetRequired(userId: string, actorRole: UserRole): boolean {
  const target = store().users.find((item) => item.id === userId);
  if (!target) return false;
  const actor = normalizeUserRole(actorRole);
  if (actor === "Customer") return false;
  if (target.role === "Super Admin" && actor !== "Super Admin") return false;

  target.passwordResetRequired = true;
  return true;
}

export function bulkDeleteUsers(userIds: string[], actorRole: UserRole): number {
  const uniqueIds = Array.from(new Set(userIds.map((id) => asSafeString(id)).filter(Boolean)));
  let deletedCount = 0;

  for (const userId of uniqueIds) {
    if (deleteUser(userId, actorRole)) {
      deletedCount += 1;
    }
  }

  return deletedCount;
}

export function bulkDeactivateUsers(userIds: string[], actorRole: UserRole): number {
  const uniqueIds = Array.from(new Set(userIds.map((id) => asSafeString(id)).filter(Boolean)));
  let updatedCount = 0;

  for (const userId of uniqueIds) {
    if (deactivateUser(userId, actorRole)) {
      updatedCount += 1;
    }
  }

  return updatedCount;
}

export function bulkMarkPasswordResetRequired(userIds: string[], actorRole: UserRole): number {
  const uniqueIds = Array.from(new Set(userIds.map((id) => asSafeString(id)).filter(Boolean)));
  let updatedCount = 0;

  for (const userId of uniqueIds) {
    if (markUserPasswordResetRequired(userId, actorRole)) {
      updatedCount += 1;
    }
  }

  return updatedCount;
}

export function listPages(options: ListPagesOptions = {}): Page[] {
  return [...store().pages]
    .filter((page) => canIncludePage(page, options))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(clonePage);
}

export function getPageById(
  pageId: string,
  options: { includeTrashed?: boolean; includeDrafts?: boolean } = {},
): Page | null {
  const target = store().pages.find((item) => item.id === pageId);
  if (!target) return null;
  if (!canIncludePage(target, options)) return null;
  return clonePage(target);
}

export function getPageBySlug(
  slug: string,
  options: { includeTrashed?: boolean; includeDrafts?: boolean } = {},
): Page | null {
  const normalized = slugify(slug);
  const target = store().pages.find((item) => item.slug === normalized);
  if (!target) return null;
  if (!canIncludePage(target, options)) return null;
  return clonePage(target);
}

export function addPage(input: PageInput): Page | null {
  const name = asSafeString(input.name);
  if (!name) return null;

  const pages = store().pages;
  const takenSlugs = new Set(pages.map((page) => page.slug));
  const baseSlug = slugify(asSafeString(input.slug) || name);
  const slug = nextUniquePageSlug(baseSlug, takenSlugs);
  const now = new Date().toISOString().slice(0, 10);

  const page: Page = {
    id: nextId("PGE"),
    name,
    slug,
    content: asSafeString(input.content),
    publishStatus: normalizePublicationStatus(input.publishStatus ?? "Draft"),
    trashedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  pages.unshift(page);
  return clonePage(page);
}

export function updatePage(pageId: string, input: PageInput): Page | null {
  const pages = store().pages;
  const target = pages.find((item) => item.id === pageId);
  if (!target) return null;

  const name = asSafeString(input.name);
  if (!name) return null;

  const takenSlugs = new Set(pages.filter((item) => item.id !== pageId).map((item) => item.slug));

  target.name = name;
  target.slug = nextUniquePageSlug(slugify(asSafeString(input.slug) || name), takenSlugs);
  target.content = asSafeString(input.content);
  if (input.publishStatus !== undefined) {
    target.publishStatus = normalizePublicationStatus(input.publishStatus);
  }
  target.updatedAt = new Date().toISOString().slice(0, 10);

  return clonePage(target);
}

export function trashPage(pageId: string): Page | null {
  const target = store().pages.find((item) => item.id === pageId);
  if (!target || target.trashedAt) return null;
  target.trashedAt = new Date().toISOString();
  target.updatedAt = new Date().toISOString().slice(0, 10);
  return clonePage(target);
}

export function restorePage(pageId: string): Page | null {
  const target = store().pages.find((item) => item.id === pageId);
  if (!target || !target.trashedAt) return null;
  target.trashedAt = null;
  target.updatedAt = new Date().toISOString().slice(0, 10);
  return clonePage(target);
}

export function deletePagePermanently(pageId: string): boolean {
  const pages = store().pages;
  const index = pages.findIndex((item) => item.id === pageId);
  if (index === -1) return false;
  pages.splice(index, 1);
  return true;
}

export function deletePage(pageId: string): boolean {
  return deletePagePermanently(pageId);
}

export function setPagePublishStatus(pageId: string, publishStatus: PublicationStatus): Page | null {
  const target = store().pages.find((item) => item.id === pageId);
  if (!target) return null;
  target.publishStatus = normalizePublicationStatus(publishStatus);
  target.updatedAt = new Date().toISOString().slice(0, 10);
  return clonePage(target);
}

export function upsertProductCategories(
  input: Array<{ name: string; slug?: string; description?: string; imageUrl?: string }>,
): ProductCategory[] {
  const s = store();
  for (const draft of input) {
    const name = asSafeString(draft.name);
    if (!name) continue;
    const slug = slugify(asSafeString(draft.slug) || name);
    const existing = s.productCategories.find((item) => item.slug === slug);
    if (existing) {
      existing.name = name;
      existing.description = asSafeString(draft.description);
      existing.imageUrl = asSafeString(draft.imageUrl);
      continue;
    }
    s.productCategories.push({
      id: `CAT-${slug}`,
      name,
      slug,
      description: asSafeString(draft.description),
      imageUrl: asSafeString(draft.imageUrl),
    });
  }

  normalizeProductCategoriesInPlace(s.productCategories);
  ensureTaxonomiesInPlace(s);
  return s.productCategories.map(cloneProductCategory);
}

export function deleteProductCategoryBySlug(slug: string): boolean {
  const s = store();
  const normalizedSlug = slugify(slug);
  const index = s.productCategories.findIndex((item) => item.slug === normalizedSlug);
  if (index === -1) return false;

  const removed = s.productCategories[index];
  s.productCategories.splice(index, 1);
  for (const product of s.products) {
    product.categories = product.categories.filter((name) => slugify(name) !== normalizedSlug);
    if (slugify(product.category) === normalizedSlug || product.category === removed.name) {
      product.category = product.categories[0] ?? "";
    }
  }

  normalizeProductsInPlace(s.products);
  ensureTaxonomiesInPlace(s);
  return true;
}

export function upsertProductTags(
  input: Array<{ name: string; slug?: string; description?: string }>,
): ProductTag[] {
  const s = store();
  for (const draft of input) {
    const name = asSafeString(draft.name);
    if (!name) continue;
    const slug = slugify(asSafeString(draft.slug) || name);
    const existing = s.productTags.find((item) => item.slug === slug);
    if (existing) {
      existing.name = name;
      existing.description = asSafeString(draft.description);
      continue;
    }

    s.productTags.push({
      id: `TAG-${slug}`,
      name,
      slug,
      description: asSafeString(draft.description),
    });
  }

  normalizeProductTagsInPlace(s.productTags);
  ensureTaxonomiesInPlace(s);
  return s.productTags.map(cloneProductTag);
}

export function deleteProductTagBySlug(slug: string): boolean {
  const s = store();
  const normalizedSlug = slugify(slug);
  const index = s.productTags.findIndex((item) => item.slug === normalizedSlug);
  if (index === -1) return false;

  s.productTags.splice(index, 1);
  for (const product of s.products) {
    product.tags = product.tags.filter((name) => slugify(name) !== normalizedSlug);
  }

  normalizeProductsInPlace(s.products);
  ensureTaxonomiesInPlace(s);
  return true;
}

export function addProduct(input: ProductInput): Product {
  const normalizedCategories = normalizeStringArray(input.categories);
  const fallbackCategory = asSafeString(input.category);
  if (normalizedCategories.length === 0 && fallbackCategory) {
    normalizedCategories.push(fallbackCategory);
  }
  if (normalizedCategories.length === 0) {
    normalizedCategories.push("Uncategorized");
  }

  const normalizedSalePrice = normalizeSalePrice(input.price, input.salePrice ?? null);
  const saleScheduleStartAt =
    normalizedSalePrice !== null ? normalizeSaleScheduleDate(input.saleScheduleStartAt ?? null) : null;
  let saleScheduleEndAt =
    normalizedSalePrice !== null ? normalizeSaleScheduleDate(input.saleScheduleEndAt ?? null) : null;
  if (saleScheduleStartAt && saleScheduleEndAt && Date.parse(saleScheduleEndAt) <= Date.parse(saleScheduleStartAt)) {
    saleScheduleEndAt = null;
  }

  const item: Product = {
    id: nextId("PRD"),
    name: asSafeString(input.name),
    category: normalizedCategories[0],
    categories: normalizedCategories,
    visibility: normalizeProductVisibility(input.visibility ?? "Public"),
    visibilityPassword: asSafeString(input.visibilityPassword),
    description: asSafeString(input.description),
    image: asSafeString(input.image),
    gallery: normalizeStringArray(input.gallery),
    tags: normalizeStringArray(input.tags),
    slug: asSafeString(input.slug) || asSafeString(input.name),
    price: money(input.price),
    salePrice: normalizedSalePrice,
    saleScheduleStartAt,
    saleScheduleEndAt,
    stock: input.stock,
    publishStatus: normalizePublicationStatus(input.publishStatus ?? "Draft"),
    trashedAt: null,
  };

  const s = store();
  s.products.unshift(item);
  normalizeProductsInPlace(s.products);
  ensureTaxonomiesInPlace(s);
  ensureProductMediaInLibraryInPlace(s);
  normalizeMediaInPlace(s.media);
  return cloneProduct(item);
}

export function updateProduct(productId: string, input: ProductInput): Product | null {
  const s = store();
  const target = s.products.find((item) => item.id === productId);
  if (!target) return null;

  target.name = asSafeString(input.name);
  const nextCategories = normalizeStringArray(input.categories);
  const fallbackCategory = asSafeString(input.category);
  if (nextCategories.length === 0 && fallbackCategory) {
    nextCategories.push(fallbackCategory);
  }
  target.categories = nextCategories.length > 0 ? nextCategories : target.categories;
  target.category = target.categories[0] ?? fallbackCategory;
  if (input.visibility !== undefined) {
    target.visibility = normalizeProductVisibility(input.visibility);
  }
  if (input.visibilityPassword !== undefined) {
    target.visibilityPassword =
      normalizeProductVisibility(target.visibility) === "Password" ? asSafeString(input.visibilityPassword) : "";
  }
  target.price = money(input.price);
  if (input.salePrice !== undefined) {
    target.salePrice = normalizeSalePrice(target.price, input.salePrice);
  } else {
    target.salePrice = normalizeSalePrice(target.price, target.salePrice);
  }
  if (input.saleScheduleStartAt !== undefined) {
    target.saleScheduleStartAt = normalizeSaleScheduleDate(input.saleScheduleStartAt);
  }
  if (input.saleScheduleEndAt !== undefined) {
    target.saleScheduleEndAt = normalizeSaleScheduleDate(input.saleScheduleEndAt);
  }
  if (
    target.saleScheduleStartAt &&
    target.saleScheduleEndAt &&
    Date.parse(target.saleScheduleEndAt) <= Date.parse(target.saleScheduleStartAt)
  ) {
    target.saleScheduleEndAt = null;
  }
  if (target.salePrice === null) {
    target.saleScheduleStartAt = null;
    target.saleScheduleEndAt = null;
  }
  target.stock = input.stock;

  if (input.slug !== undefined) {
    target.slug = asSafeString(input.slug) || target.name;
  }
  if (input.description !== undefined) {
    target.description = asSafeString(input.description);
  }
  if (input.image !== undefined) {
    target.image = asSafeString(input.image);
  }
  if (input.gallery !== undefined) {
    target.gallery = normalizeStringArray(input.gallery);
  }
  if (input.tags !== undefined) {
    target.tags = normalizeStringArray(input.tags);
  }
  if (input.publishStatus !== undefined) {
    target.publishStatus = normalizePublicationStatus(input.publishStatus);
  }

  normalizeProductsInPlace(s.products);
  ensureTaxonomiesInPlace(s);
  ensureProductMediaInLibraryInPlace(s);
  normalizeMediaInPlace(s.media);
  return cloneProduct(target);
}

export function setProductPublishStatus(productId: string, publishStatus: PublicationStatus): Product | null {
  const target = store().products.find((item) => item.id === productId);
  if (!target) return null;
  target.publishStatus = normalizePublicationStatus(publishStatus);
  return cloneProduct(target);
}

export function trashProduct(productId: string): Product | null {
  const target = store().products.find((item) => item.id === productId);
  if (!target || target.trashedAt) return null;

  target.trashedAt = new Date().toISOString();
  return cloneProduct(target);
}

export function restoreProduct(productId: string): Product | null {
  const target = store().products.find((item) => item.id === productId);
  if (!target || !target.trashedAt) return null;

  target.trashedAt = null;
  return cloneProduct(target);
}

export function deleteProductPermanently(productId: string): boolean {
  const items = store().products;
  const index = items.findIndex((item) => item.id === productId);
  if (index === -1) return false;

  items.splice(index, 1);
  return true;
}

export function addOrder(input: {
  customer: string;
  userId?: string | null;
  productId: string;
  quantity: number;
  status: OrderStatus;
  total?: number;
  discount?: number;
  couponCode?: string | null;
}): Order {
  const s = store();
  const product = s.products.find((item) => item.id === input.productId);
  const productPrice = product ? getEffectiveProductPricing(product).current : 0;
  const quantity = Math.max(1, Math.floor(input.quantity));
  const baseTotal = money(quantity * productPrice);
  const discount = money(input.discount ?? 0);
  const totalFromInput = input.total !== undefined ? money(input.total) : money(baseTotal - discount);

  const order: Order = {
    id: nextId("ORD"),
    customer: asSafeString(input.customer),
    userId: asSafeString(input.userId ?? "") || null,
    productId: input.productId,
    quantity,
    total: totalFromInput,
    discount,
    couponCode: input.couponCode ? normalizeCouponCode(input.couponCode) : null,
    status: input.status,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  s.orders.unshift(order);
  if (product) {
    product.stock = Math.max(0, product.stock - quantity);
  }
  if (s.settings.notifyAdminPaidOrder) {
    pushAdminNotification({
      type: "Order",
      title: "New order",
      message: `${order.id} from ${order.customer}`,
      href: `/dashboard/orders/${order.id}`,
    });
  }
  return order;
}

export function getOrderById(orderId: string): Order | null {
  const target = store().orders.find((item) => item.id === orderId);
  return target ? { ...target } : null;
}

export function updateOrder(orderId: string, input: OrderUpdateInput): Order | null {
  const target = store().orders.find((item) => item.id === orderId);
  if (!target) return null;

  const product = store().products.find((item) => item.id === input.productId);
  const productPrice = product ? getEffectiveProductPricing(product).current : 0;
  const quantity = Math.max(1, Math.floor(input.quantity));
  const baseTotal = money(quantity * productPrice);
  const discount = money(input.discount ?? 0);
  const totalFromInput = input.total !== undefined ? money(input.total) : money(baseTotal - discount);

  target.customer = asSafeString(input.customer);
  target.productId = asSafeString(input.productId);
  target.quantity = quantity;
  target.discount = discount;
  target.total = totalFromInput;
  target.couponCode = input.couponCode ? normalizeCouponCode(input.couponCode) : null;
  target.status = input.status;

  return { ...target };
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const target = store().orders.find((item) => item.id === orderId);
  if (!target) return;
  target.status = status;
}

export function bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): number {
  const uniqueIds = Array.from(new Set(orderIds.map((id) => asSafeString(id)).filter(Boolean)));
  let updatedCount = 0;

  for (const orderId of uniqueIds) {
    const target = store().orders.find((item) => item.id === orderId);
    if (!target) continue;
    target.status = status;
    updatedCount += 1;
  }

  return updatedCount;
}

function replaceMediaUrlInProductsInPlace(oldUrl: string, nextUrl: string): void {
  const safeOld = asSafeString(oldUrl);
  const safeNext = asSafeString(nextUrl);
  if (!safeOld || !safeNext || safeOld === safeNext) return;

  for (const product of store().products) {
    if (product.image === safeOld) {
      product.image = safeNext;
    }
    product.gallery = product.gallery.map((url) => (url === safeOld ? safeNext : url));
  }
}

export function listMedia(options: ListMediaOptions = {}): MediaAsset[] {
  const mediaItems = store().media.filter((media) => {
    if (options.onlyTrashed) return Boolean(media.trashedAt);
    if (!options.includeTrashed && media.trashedAt) return false;
    return true;
  });
  return [...mediaItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(cloneMedia);
}

export function getMediaById(
  mediaId: string,
  options: { includeTrashed?: boolean } = {},
): MediaAsset | null {
  const target = store().media.find((item) => item.id === mediaId);
  if (!target) return null;
  if (!options.includeTrashed && target.trashedAt) return null;
  return cloneMedia(target);
}

export function addMedia(input: MediaInput): MediaAsset | null {
  const url = asSafeString(input.url);
  if (!url) return null;

  const s = store();
  const existing = s.media.find((item) => item.url === url);
  if (existing) {
    if (input.alt !== undefined) existing.alt = asSafeString(input.alt);
    if (input.description !== undefined) existing.description = asSafeString(input.description);
    if (input.assignedTo !== undefined) {
      existing.assignedTo = normalizeMediaAssignedTo(input.assignedTo);
      existing.assignedToId = asSafeString(input.assignedToId) || null;
    }
    if (input.uploadedBy !== undefined && !existing.uploadedBy) {
      existing.uploadedBy = asSafeString(input.uploadedBy) || null;
    }
    existing.updatedAt = new Date().toISOString().slice(0, 10);
    return cloneMedia(existing);
  }

  const now = new Date().toISOString().slice(0, 10);
  const media: MediaAsset = {
    id: nextId("MDA"),
    url,
    originalUrl: null,
    assignedTo: normalizeMediaAssignedTo(input.assignedTo),
    assignedToId: asSafeString(input.assignedToId) || null,
    uploadedBy: asSafeString(input.uploadedBy) || null,
    alt: asSafeString(input.alt),
    description: asSafeString(input.description),
    createdAt: now,
    updatedAt: now,
    trashedAt: null,
  };
  s.media.unshift(media);
  normalizeMediaInPlace(s.media);
  return cloneMedia(media);
}

export function updateMedia(
  mediaId: string,
  input: Partial<MediaInput>,
): MediaAsset | null {
  const s = store();
  const target = s.media.find((item) => item.id === mediaId);
  if (!target) return null;

  const previousUrl = target.url;
  if (input.url !== undefined) {
    const nextUrl = asSafeString(input.url);
    if (nextUrl && nextUrl !== previousUrl && !target.originalUrl) {
      target.originalUrl = previousUrl;
    }
    target.url = nextUrl || target.url;
  }
  if (input.alt !== undefined) {
    target.alt = asSafeString(input.alt);
  }
  if (input.description !== undefined) {
    target.description = asSafeString(input.description);
  }
  if (input.assignedTo !== undefined) {
    target.assignedTo = normalizeMediaAssignedTo(input.assignedTo);
    target.assignedToId = asSafeString(input.assignedToId) || null;
  }
  target.updatedAt = new Date().toISOString().slice(0, 10);

  if (target.url && target.url !== previousUrl) {
    replaceMediaUrlInProductsInPlace(previousUrl, target.url);
  }

  normalizeProductsInPlace(s.products);
  normalizeMediaInPlace(s.media);
  return cloneMedia(target);
}

export function trashMedia(mediaId: string): MediaAsset | null {
  const target = store().media.find((item) => item.id === mediaId);
  if (!target || target.trashedAt) return null;
  target.trashedAt = new Date().toISOString();
  target.updatedAt = new Date().toISOString().slice(0, 10);
  return cloneMedia(target);
}

export function restoreMedia(mediaId: string): MediaAsset | null {
  const target = store().media.find((item) => item.id === mediaId);
  if (!target || !target.trashedAt) return null;
  target.trashedAt = null;
  target.updatedAt = new Date().toISOString().slice(0, 10);
  return cloneMedia(target);
}

export function deleteMediaPermanently(mediaId: string): boolean {
  const mediaItems = store().media;
  const index = mediaItems.findIndex((item) => item.id === mediaId);
  if (index === -1) return false;
  mediaItems.splice(index, 1);
  return true;
}

export function addSale(input: Omit<Sale, "id">): Sale {
  const sale: Sale = { id: nextId("SAL"), ...input };
  store().sales.unshift(sale);
  return sale;
}

export function addAdminAccount(input: Omit<AdminAccount, "id" | "createdAt">): AdminAccount {
  const account: AdminAccount = {
    id: nextId("ADM"),
    ...input,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store().accounts.unshift(account);
  return account;
}

export function dashboardStats() {
  const products = listProducts().length;
  const orders = store().orders.length;
  const paidOrdersValue = store()
    .orders.filter((item) => item.status === "Paid" || item.status === "Shipped")
    .reduce((sum, item) => sum + item.total, 0);
  const sales = store().sales.reduce((sum, item) => sum + item.amount, 0);
  const accounts = store().accounts.length;
  const users = store().users.length;

  return {
    products,
    orders,
    totalSales: paidOrdersValue + sales,
    accounts,
    users,
  };
}

export function findProductNameById(productId: string): string {
  return store().products.find((item) => item.id === productId)?.name ?? "Unknown Product";
}

export function getSiteSettings(): SiteSettings {
  return cloneSiteSettings(store().settings);
}

export function updateSiteSettings(input: Partial<SiteSettings>): SiteSettings {
  const target = store().settings;

  if (input.siteTitle !== undefined) {
    target.siteTitle = asSafeString(input.siteTitle);
  }
  if (input.brandName !== undefined) {
    target.brandName = asSafeString(input.brandName);
  }
  if (input.layoutMaxWidthPx !== undefined) {
    target.layoutMaxWidthPx = Math.max(0, Math.floor(Number(input.layoutMaxWidthPx) || 0));
  }
  if (input.mediaUploadMaxMb !== undefined) {
    target.mediaUploadMaxMb = Math.max(1, Math.floor(Number(input.mediaUploadMaxMb) || 1));
  }
  if (input.logoUrl !== undefined) {
    target.logoUrl = asSafeString(input.logoUrl);
  }
  if (input.iconUrl !== undefined) {
    target.iconUrl = asSafeString(input.iconUrl);
  }
  if (input.brandingVersion !== undefined) {
    target.brandingVersion = Math.max(1, Math.floor(Number(input.brandingVersion) || 1));
  }
  if (input.useLogoOnly !== undefined) {
    target.useLogoOnly = Boolean(input.useLogoOnly);
  }
  if (input.headerMenu !== undefined) {
    target.headerMenu = normalizeHeaderMenu(input.headerMenu);
  }
  if (input.homeSlides !== undefined) {
    target.homeSlides = normalizeHomeSlides(input.homeSlides);
  }
  if (input.sliderAutoplayMs !== undefined) {
    target.sliderAutoplayMs = Math.max(0, Math.floor(Number(input.sliderAutoplayMs) || 0));
  }
  if (input.sliderShowArrows !== undefined) {
    target.sliderShowArrows = Boolean(input.sliderShowArrows);
  }
  if (input.sliderShowDots !== undefined) {
    target.sliderShowDots = Boolean(input.sliderShowDots);
  }
  if (input.titleFont !== undefined) {
    target.titleFont = asSafeString(input.titleFont);
  }
  if (input.textFont !== undefined) {
    target.textFont = asSafeString(input.textFont);
  }
  if (input.buttonFont !== undefined) {
    target.buttonFont = asSafeString(input.buttonFont);
  }
  if (input.uiFont !== undefined) {
    target.uiFont = asSafeString(input.uiFont);
  }
  if (input.primaryColor !== undefined) {
    target.primaryColor = asSafeString(input.primaryColor);
  }
  if (input.secondaryColor !== undefined) {
    target.secondaryColor = asSafeString(input.secondaryColor);
  }
  if (input.accentColor !== undefined) {
    target.accentColor = asSafeString(input.accentColor);
  }
  if (input.backgroundColor !== undefined) {
    target.backgroundColor = asSafeString(input.backgroundColor);
  }
  if (input.emailProvider !== undefined) {
    target.emailProvider = input.emailProvider;
  }
  if (input.emailFromName !== undefined) {
    target.emailFromName = asSafeString(input.emailFromName);
  }
  if (input.emailFromAddress !== undefined) {
    target.emailFromAddress = toEmail(input.emailFromAddress);
  }
  if (input.mailHost !== undefined) {
    target.mailHost = asSafeString(input.mailHost);
  }
  if (input.mailPort !== undefined) {
    target.mailPort = Math.max(0, Math.floor(input.mailPort));
  }
  if (input.mailSecure !== undefined) {
    target.mailSecure = Boolean(input.mailSecure);
  }
  if (input.mailUsername !== undefined) {
    target.mailUsername = asSafeString(input.mailUsername);
  }
  if (input.mailPassword !== undefined) {
    target.mailPassword = asSafeString(input.mailPassword);
  }
  if (input.phpMailerPath !== undefined) {
    target.phpMailerPath = asSafeString(input.phpMailerPath);
  }
  if (input.reactEmailApiUrl !== undefined) {
    target.reactEmailApiUrl = asSafeString(input.reactEmailApiUrl);
  }
  if (input.reactEmailApiKey !== undefined) {
    target.reactEmailApiKey = asSafeString(input.reactEmailApiKey);
  }
  if (input.notifyCustomerOrderConfirmation !== undefined) {
    target.notifyCustomerOrderConfirmation = Boolean(input.notifyCustomerOrderConfirmation);
  }
  if (input.notifyAdminPaidOrder !== undefined) {
    target.notifyAdminPaidOrder = Boolean(input.notifyAdminPaidOrder);
  }
  if (input.notifyShippedOrder !== undefined) {
    target.notifyShippedOrder = Boolean(input.notifyShippedOrder);
  }
  if (input.notifyLowStock !== undefined) {
    target.notifyLowStock = Boolean(input.notifyLowStock);
  }
  if (input.paymentCadEnabled !== undefined) {
    target.paymentCadEnabled = Boolean(input.paymentCadEnabled);
  }
  if (input.paymentBankTransferEnabled !== undefined) {
    target.paymentBankTransferEnabled = Boolean(input.paymentBankTransferEnabled);
  }
  if (input.paymentStripeDemoEnabled !== undefined) {
    target.paymentStripeDemoEnabled = Boolean(input.paymentStripeDemoEnabled);
  }
  if (input.paymentBankTransferInstructions !== undefined) {
    target.paymentBankTransferInstructions = asSafeString(input.paymentBankTransferInstructions);
  }
  if (input.shippingStandardEnabled !== undefined) {
    target.shippingStandardEnabled = Boolean(input.shippingStandardEnabled);
  }
  if (input.shippingStandardLabel !== undefined) {
    target.shippingStandardLabel = asSafeString(input.shippingStandardLabel);
  }
  if (input.shippingStandardEta !== undefined) {
    target.shippingStandardEta = asSafeString(input.shippingStandardEta);
  }
  if (input.shippingStandardPrice !== undefined) {
    target.shippingStandardPrice = money(Number(input.shippingStandardPrice) || 0);
  }
  if (input.shippingExpressEnabled !== undefined) {
    target.shippingExpressEnabled = Boolean(input.shippingExpressEnabled);
  }
  if (input.shippingExpressLabel !== undefined) {
    target.shippingExpressLabel = asSafeString(input.shippingExpressLabel);
  }
  if (input.shippingExpressEta !== undefined) {
    target.shippingExpressEta = asSafeString(input.shippingExpressEta);
  }
  if (input.shippingExpressPrice !== undefined) {
    target.shippingExpressPrice = money(Number(input.shippingExpressPrice) || 0);
  }
  if (input.shippingFreeThreshold !== undefined) {
    target.shippingFreeThreshold = money(Number(input.shippingFreeThreshold) || 0);
  }

  normalizeSiteSettingsInPlace(target);
  return cloneSiteSettings(target);
}
