"use server";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SIDEBAR_COOKIE_NAME,
  ADMIN_USERNAME_COOKIE_NAME,
  getAdminRoleFromCookieStore,
  getAdminUsernameFromCookieStore,
} from "@/lib/admin-auth";
import {
  createProductPreviewDraft,
  type ProductPreviewDraft,
} from "@/lib/product-preview-drafts";
import {
  addMedia,
  addCoupon,
  addReview,
  addAdminAccount,
  addOrder,
  addPage,
  addProduct,
  addSale,
  addUser,
  addSupportTicketReply,
  markAllAdminNotificationsAsRead,
  bulkDeactivateUsers,
  bulkDeleteUsers,
  bulkMarkPasswordResetRequired,
  bulkUpdateOrderStatus,
  canCreateUserRole,
  canDeleteUser,
  deactivateUser,
  deleteMediaPermanently,
  deleteProductCategoryBySlug,
  deleteProductTagBySlug,
  deletePagePermanently,
  deleteSupportTicket,
  deleteUser,
  deleteReview,
  deleteProductPermanently,
  getPageById,
  listProductCategories,
  listProductTags,
  getProductById,
  getProductBySlug,
  getSiteSettings,
  getUserById,
  type PublicationStatus,
  type ProductVisibility,
  type EmailProvider,
  type HomeSliderItem,
  type Product,
  type ReviewStatus,
  type UserRole,
  restoreMedia,
  restorePage,
  restoreProduct,
  setPagePublishStatus,
  setProductPublishStatus,
  type OrderStatus,
  setCouponStatus,
  setSupportTicketStatus,
  trashMedia,
  trashPage,
  trashProduct,
  updateMedia,
  updateOrder,
  upsertProductCategories,
  upsertProductTags,
  updateSiteSettings,
  updateUser,
  updateReviewStatus,
  updateProduct,
  updatePage,
  updateOrderStatus,
  type SupportTicketStatus,
} from "@/lib/shop-store";

function asString(input: FormDataEntryValue | null): string {
  return typeof input === "string" ? input.trim() : "";
}

function asNumber(input: FormDataEntryValue | null): number {
  const value = Number(asString(input));
  return Number.isFinite(value) ? value : 0;
}

function asInteger(input: FormDataEntryValue | null, fallback: number): number {
  const value = Math.floor(asNumber(input));
  return Number.isFinite(value) ? value : fallback;
}

function asBoolean(input: FormDataEntryValue | null): boolean {
  const value = asString(input).toLowerCase();
  return value === "1" || value === "true" || value === "on" || value === "yes";
}

function asEmailProvider(input: FormDataEntryValue | null): EmailProvider {
  const value = asString(input).toLowerCase();
  if (value === "phpmailer") return "phpmailer";
  if (value === "react-email") return "react-email";
  return "smtp";
}

function asPublicationStatus(input: FormDataEntryValue | null, fallback: PublicationStatus = "Draft"): PublicationStatus {
  const value = asString(input).toLowerCase();
  if (value === "published") return "Published";
  if (value === "draft") return "Draft";
  return fallback;
}

function asProductVisibility(
  input: FormDataEntryValue | null,
  fallback: ProductVisibility = "Public",
): ProductVisibility {
  const value = asString(input).toLowerCase();
  if (value === "loggedusers" || value === "logged_users" || value === "logged-users") return "LoggedUsers";
  if (value === "password") return "Password";
  if (value === "public") return "Public";
  return fallback;
}

function asOrderStatus(input: FormDataEntryValue | null, fallback: OrderStatus = "Pending"): OrderStatus {
  const value = asString(input);
  if (value === "Paid" || value === "Shipped" || value === "Cancelled") return value;
  if (value === "Pending") return "Pending";
  return fallback;
}

function asList(input: FormDataEntryValue | null): string[] {
  return asString(input)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asJsonArray(input: FormDataEntryValue | null): unknown[] {
  const raw = asString(input);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function asHomeSliderItems(input: FormDataEntryValue | null): HomeSliderItem[] {
  return asJsonArray(input).filter((item) => typeof item === "object" && item !== null) as HomeSliderItem[];
}

function asLastString(values: FormDataEntryValue[]): string {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (typeof values[index] === "string") {
      return asString(values[index]);
    }
  }
  return "";
}

function asIsoDateTimeOrNull(input: FormDataEntryValue | null): string | null {
  const value = asString(input);
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

function normalizeAdminDestination(path: string): string {
  if (path.startsWith("/dashboard")) return path;
  if (path === "/admin") return "/dashboard";
  if (path.startsWith("/admin/")) {
    return `/dashboard${path.slice("/admin".length)}`;
  }
  return "";
}

function withSuccessNotice(path: string, message: string): string {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("__ok", "1");
  params.set("__msg", message);
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function withQueryParams(path: string, entries: Record<string, string | null | undefined>): string {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
      continue;
    }
    params.set(key, value);
  }
  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

function redirectToAdminDestination(path: string, message = "Veprimi u ruajt me sukses.") {
  const normalized = normalizeAdminDestination(path);
  if (normalized) {
    redirect(withSuccessNotice(normalized, message));
  }
}

function revalidateAdminPath(path: string) {
  revalidatePath(path);
  if (path === "/admin") {
    revalidatePath("/dashboard");
    return;
  }
  if (path.startsWith("/admin/")) {
    revalidatePath(`/dashboard${path.slice("/admin".length)}`);
  }
}

async function ensureUploadSubdir(subdir: string): Promise<{ absolute: string; publicBase: string }> {
  const normalizedSubdir = subdir.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const absolute = path.join(process.cwd(), "public", "uploads", normalizedSubdir);
  await mkdir(absolute, { recursive: true });
  return {
    absolute,
    publicBase: `/uploads/${normalizedSubdir}`,
  };
}

async function asSvgMarkupPublicUrl(
  input: FormDataEntryValue | null,
  subdir = "branding",
): Promise<string | null> {
  const markup = asString(input);
  if (!markup) return null;
  if (markup.length > 200_000) return null;

  const compact = markup.toLowerCase().replace(/\s+/g, " ");
  if (!compact.includes("<svg") || !compact.includes("</svg>")) return null;

  const uploadDir = await ensureUploadSubdir(subdir);
  const filename = `${Date.now()}-${randomUUID()}.svg`;
  const targetPath = path.join(uploadDir.absolute, filename);
  await writeFile(targetPath, markup, "utf8");
  return `${uploadDir.publicBase}/${filename}`;
}

async function bufferToWebpPublicUrl(buffer: Buffer, subdir: string): Promise<string | null> {
  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default;
    const uploadDir = await ensureUploadSubdir(subdir);
    const filename = `${Date.now()}-${randomUUID()}.webp`;
    const targetPath = path.join(uploadDir.absolute, filename);

    await sharp(buffer)
      .rotate()
      .webp({ quality: 84 })
      .toFile(targetPath);

    return `${uploadDir.publicBase}/${filename}`;
  } catch {
    return null;
  }
}

async function asImageUploadWebpUrl(
  input: FormDataEntryValue | null,
  subdir = "media",
): Promise<string | null> {
  if (!(input instanceof File) || input.size <= 0) return null;
  if (!input.type.startsWith("image/")) return null;

  const configuredMaxMbRaw = Number(getSiteSettings().mediaUploadMaxMb);
  const configuredMaxMb = Number.isFinite(configuredMaxMbRaw)
    ? Math.min(100, Math.max(1, Math.floor(configuredMaxMbRaw)))
    : 10;
  if (input.size > configuredMaxMb * 1024 * 1024) return null;

  const buffer = Buffer.from(await input.arrayBuffer());
  return bufferToWebpPublicUrl(buffer, subdir);
}

async function asImageUploadWebpUrlList(
  inputs: FormDataEntryValue[],
  subdir = "media",
): Promise<string[]> {
  const items = await Promise.all(inputs.map((item) => asImageUploadWebpUrl(item, subdir)));
  return items.filter((item): item is string => Boolean(item));
}

async function asWebpUrlFromDataUrl(dataUrl: string, subdir = "media"): Promise<string | null> {
  const raw = dataUrl.trim();
  if (!raw.startsWith("data:image/")) return null;
  const match = raw.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) return null;

  try {
    const buffer = Buffer.from(match[1], "base64");
    return bufferToWebpPublicUrl(buffer, subdir);
  } catch {
    return null;
  }
}

type ProductCategoryDraft = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageDataUrl: string;
  deleted: boolean;
};

type ProductTagDraft = {
  name: string;
  slug: string;
  description: string;
  deleted: boolean;
};

function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asProductCategoryDrafts(input: FormDataEntryValue | null): ProductCategoryDraft[] {
  const output: ProductCategoryDraft[] = [];
  for (const rawItem of asJsonArray(input)) {
    if (typeof rawItem !== "object" || rawItem === null) continue;
    const item = rawItem as Record<string, unknown>;
    const name = asString((item.name ?? "") as FormDataEntryValue | null);
    const slug = slugifyValue(asString((item.slug ?? "") as FormDataEntryValue | null) || name);
    const description = asString((item.description ?? "") as FormDataEntryValue | null);
    const imageUrl = asString((item.imageUrl ?? "") as FormDataEntryValue | null);
    const imageDataUrl = asString((item.imageDataUrl ?? "") as FormDataEntryValue | null);
    const deleted = Boolean(item.deleted);

    if (!slug) continue;
    output.push({
      name,
      slug,
      description,
      imageUrl,
      imageDataUrl,
      deleted,
    });
  }
  return output;
}

function asProductTagDrafts(input: FormDataEntryValue | null): ProductTagDraft[] {
  const output: ProductTagDraft[] = [];
  for (const rawItem of asJsonArray(input)) {
    if (typeof rawItem !== "object" || rawItem === null) continue;
    const item = rawItem as Record<string, unknown>;
    const name = asString((item.name ?? "") as FormDataEntryValue | null);
    const slug = slugifyValue(asString((item.slug ?? "") as FormDataEntryValue | null) || name);
    const description = asString((item.description ?? "") as FormDataEntryValue | null);
    const deleted = Boolean(item.deleted);
    if (!slug) continue;
    output.push({
      name,
      slug,
      description,
      deleted,
    });
  }
  return output;
}

async function resolveProductTaxonomySelection(formData: FormData): Promise<{
  categoryNames: string[];
  tagNames: string[];
}> {
  const categoryDrafts = asProductCategoryDrafts(formData.get("categoriesPayload"));
  const tagDrafts = asProductTagDrafts(formData.get("tagsPayload"));
  const selectedCategorySlugs = asJsonArray(formData.get("selectedCategorySlugs"))
    .map((item) => slugifyValue(asString(item as FormDataEntryValue | null)))
    .filter(Boolean);
  const selectedTagSlugs = asJsonArray(formData.get("selectedTagSlugs"))
    .map((item) => slugifyValue(asString(item as FormDataEntryValue | null)))
    .filter(Boolean);

  const categoryUpserts: Array<{ name: string; slug: string; description: string; imageUrl: string }> = [];
  for (const draft of categoryDrafts) {
    if (draft.deleted || !draft.name) continue;
    const imageFromDataUrl = draft.imageDataUrl
      ? await asWebpUrlFromDataUrl(draft.imageDataUrl, "categories")
      : null;
    categoryUpserts.push({
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
      imageUrl: imageFromDataUrl || draft.imageUrl,
    });
  }

  if (categoryUpserts.length > 0) {
    upsertProductCategories(categoryUpserts);
  }
  for (const draft of categoryDrafts) {
    if (draft.deleted) {
      deleteProductCategoryBySlug(draft.slug);
    }
  }

  const tagUpserts: Array<{ name: string; slug: string; description: string }> = [];
  for (const draft of tagDrafts) {
    if (draft.deleted || !draft.name) continue;
    tagUpserts.push({
      name: draft.name,
      slug: draft.slug,
      description: draft.description,
    });
  }
  if (tagUpserts.length > 0) {
    upsertProductTags(tagUpserts);
  }
  for (const draft of tagDrafts) {
    if (draft.deleted) {
      deleteProductTagBySlug(draft.slug);
    }
  }

  const categoryNameBySlug = new Map(
    listProductCategories().map((item) => [slugifyValue(item.slug), item.name]),
  );
  const tagNameBySlug = new Map(
    listProductTags().map((item) => [slugifyValue(item.slug), item.name]),
  );

  const categoryNames = Array.from(
    new Set(
      selectedCategorySlugs
        .map((slug) => categoryNameBySlug.get(slug) || "")
        .filter(Boolean),
    ),
  );
  const tagNames = Array.from(
    new Set(
      selectedTagSlugs
        .map((slug) => tagNameBySlug.get(slug) || "")
        .filter(Boolean),
    ),
  );

  return {
    categoryNames,
    tagNames,
  };
}

function resolveSelectedTaxonomyNamesWithoutMutations(formData: FormData): {
  categoryNames: string[];
  tagNames: string[];
} {
  const selectedCategorySlugs = asJsonArray(formData.get("selectedCategorySlugs"))
    .map((item) => slugifyValue(asString(item as FormDataEntryValue | null)))
    .filter(Boolean);
  const selectedTagSlugs = asJsonArray(formData.get("selectedTagSlugs"))
    .map((item) => slugifyValue(asString(item as FormDataEntryValue | null)))
    .filter(Boolean);

  const categoryNameBySlug = new Map(
    listProductCategories().map((item) => [slugifyValue(item.slug), item.name]),
  );
  const tagNameBySlug = new Map(
    listProductTags().map((item) => [slugifyValue(item.slug), item.name]),
  );

  return {
    categoryNames: Array.from(
      new Set(
        selectedCategorySlugs
          .map((slug) => categoryNameBySlug.get(slug) || "")
          .filter(Boolean),
      ),
    ),
    tagNames: Array.from(
      new Set(
        selectedTagSlugs
          .map((slug) => tagNameBySlug.get(slug) || "")
          .filter(Boolean),
      ),
    ),
  };
}

function revalidateProductPaths(product?: Pick<Product, "id" | "slug">) {
  revalidatePath("/");
  revalidatePath("/product");
  revalidatePath("/shop");
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/products");
  revalidateAdminPath("/admin/media");
  revalidateAdminPath("/admin/categories");
  revalidateAdminPath("/admin/tags");

  if (product) {
    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/shop/${product.slug}`);
    revalidateAdminPath(`/admin/products/${product.id}`);
  }
}

function revalidatePagePaths(page?: { id: string; slug: string }) {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidateAdminPath("/admin/pages");
  revalidateAdminPath("/admin/pages/new");

  if (page) {
    revalidatePath(`/${page.slug}`);
    revalidateAdminPath(`/admin/pages/${page.id}`);
  }
}

function revalidateOrderPaths(orderId?: string) {
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/orders");
  revalidatePath("/checkout");
  revalidatePath("/cart");
  if (orderId) {
    revalidateAdminPath(`/admin/orders/${orderId}`);
  }
}

function revalidateMediaPaths(mediaId?: string) {
  revalidateAdminPath("/admin/media");
  revalidateAdminPath("/admin/media/new");
  if (mediaId) {
    revalidateAdminPath(`/admin/media/${mediaId}`);
  }
}

function revalidateSupportTicketPaths() {
  revalidateAdminPath("/admin/help-tickets");
  revalidatePath("/my-account");
}

function uniqueNonEmptyUrls(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function attachUploadedProductMedia(
  productId: string,
  uploadedBy: string,
  urls: Array<string | null | undefined>,
) {
  for (const url of uniqueNonEmptyUrls(urls)) {
    addMedia({
      url,
      assignedTo: "Product",
      assignedToId: productId,
      uploadedBy,
    });
  }
}

type PersistProductOptions = {
  forcePublishStatus?: PublicationStatus;
  allowDraftWithoutName?: boolean;
};

async function buildProductPreviewDraftFromFormData(formData: FormData): Promise<{
  ok: boolean;
  draft?: ProductPreviewDraft;
  message?: string;
}> {
  const productId = asString(formData.get("productId"));
  if (!productId) {
    return { ok: false, message: "Product was not found." };
  }

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  if (!previous) {
    return { ok: false, message: "Product was not found." };
  }

  const { categoryNames: selectedCategoryNames, tagNames: selectedTagNames } =
    resolveSelectedTaxonomyNamesWithoutMutations(formData);
  const fallbackCategory = asString(formData.get("newCategory")) || asString(formData.get("category"));
  const fallbackCategories = asList(formData.get("categories"));
  const categories = selectedCategoryNames.length > 0
    ? selectedCategoryNames
    : fallbackCategory
      ? [fallbackCategory]
      : fallbackCategories.length > 0
        ? fallbackCategories
        : previous.categories;
  const category = categories[0] || previous.category || "Uncategorized";

  const rawName = asString(formData.get("name"));
  const name = rawName || previous.name;
  if (!name) {
    return { ok: false, message: "Product name is required." };
  }

  const rawSlug = asString(formData.get("slug"));
  const slug = rawSlug || previous.slug;
  if (!slug) {
    return { ok: false, message: "Product slug is required." };
  }

  const visibility = asProductVisibility(formData.get("visibility"), previous.visibility);
  const visibilityPassword = visibility === "Password"
    ? asString(formData.get("visibilityPassword")) || previous.visibilityPassword || ""
    : "";
  if (visibility === "Password" && !visibilityPassword) {
    return { ok: false, message: "Password is required for protected visibility." };
  }

  const imageFromUpload = await asImageUploadWebpUrl(formData.get("imageFile"), "products");
  const galleryFromUpload = await asImageUploadWebpUrlList(formData.getAll("galleryFiles"), "products");
  const selectedImage = asString(formData.get("image"));
  const selectedGallery = asList(formData.get("gallery"));

  const image = (imageFromUpload ?? selectedImage) || previous.image;
  const gallery = galleryFromUpload.length > 0
    ? galleryFromUpload
    : selectedGallery.length > 0
      ? selectedGallery
      : previous.gallery;
  const tags = selectedTagNames.length > 0 ? selectedTagNames : asList(formData.get("tags"));
  const safePrice = Math.max(0, asNumber(formData.get("price")));
  const rawSalePrice = asNumber(formData.get("salePrice"));
  const safeSalePrice = rawSalePrice > 0 && rawSalePrice < safePrice ? rawSalePrice : null;
  const hasSaleScheduleStartAtInput = formData.has("saleScheduleStartAt");
  const hasSaleScheduleEndAtInput = formData.has("saleScheduleEndAt");
  const parsedSaleScheduleStartAt = asIsoDateTimeOrNull(formData.get("saleScheduleStartAt"));
  const parsedSaleScheduleEndAt = asIsoDateTimeOrNull(formData.get("saleScheduleEndAt"));
  const saleScheduleStartAt = safeSalePrice !== null
    ? (hasSaleScheduleStartAtInput ? parsedSaleScheduleStartAt : previous.saleScheduleStartAt)
    : null;
  let saleScheduleEndAt = safeSalePrice !== null
    ? (hasSaleScheduleEndAtInput ? parsedSaleScheduleEndAt : previous.saleScheduleEndAt)
    : null;
  if (
    saleScheduleStartAt &&
    saleScheduleEndAt &&
    Date.parse(saleScheduleEndAt) <= Date.parse(saleScheduleStartAt)
  ) {
    saleScheduleEndAt = null;
  }
  const safeStock = Math.max(0, asNumber(formData.get("stock")));

  return {
    ok: true,
    draft: {
      productId: previous.id,
      slug,
      name,
      category,
      categories: categories.length > 0 ? categories : [category],
      visibility,
      visibilityPassword,
      description: asString(formData.get("description")),
      image,
      gallery,
      tags,
      price: safePrice,
      salePrice: safeSalePrice,
      saleScheduleStartAt,
      saleScheduleEndAt,
      stock: safeStock,
    },
  };
}

async function persistProductFromFormData(
  formData: FormData,
  options: PersistProductOptions = {},
): Promise<{
  ok: boolean;
  product: Product | null;
  created: boolean;
  message?: string;
}> {
  const cookieStore = await cookies();
  const uploadedBy = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const productId = asString(formData.get("productId"));
  const previous = productId
    ? getProductById(productId, { includeTrashed: true, includeDrafts: true })
    : null;
  const rawName = asString(formData.get("name"));
  const fallbackCategory = asString(formData.get("newCategory")) || asString(formData.get("category"));
  const price = asNumber(formData.get("price"));
  const salePrice = asNumber(formData.get("salePrice"));
  const stock = asNumber(formData.get("stock"));
  const slug = asString(formData.get("slug"));
  const description = asString(formData.get("description"));
  const visibility = asProductVisibility(formData.get("visibility"), previous?.visibility ?? "Public");
  const visibilityPassword = visibility === "Password"
    ? asString(formData.get("visibilityPassword")) || previous?.visibilityPassword || ""
    : "";
  const imageFromUpload = await asImageUploadWebpUrl(formData.get("imageFile"), "products");
  const galleryFromUpload = await asImageUploadWebpUrlList(formData.getAll("galleryFiles"), "products");
  const image = imageFromUpload ?? asString(formData.get("image"));
  const gallery = galleryFromUpload.length > 0 ? galleryFromUpload : asList(formData.get("gallery"));
  const { categoryNames: selectedCategoryNames, tagNames: selectedTagNames } =
    await resolveProductTaxonomySelection(formData);
  const categories = selectedCategoryNames.length > 0
    ? selectedCategoryNames
    : fallbackCategory
      ? [fallbackCategory]
      : [];
  const tags = selectedTagNames.length > 0 ? selectedTagNames : asList(formData.get("tags"));

  const requestedStatus =
    options.forcePublishStatus ??
    asPublicationStatus(asLastString(formData.getAll("publishStatus")), "Draft");
  const isDraft = requestedStatus === "Draft";

  let name = rawName;
  if (!name && isDraft && options.allowDraftWithoutName) {
    name = "Untitled product";
  }

  const safeCategory = categories[0] || (isDraft ? "Uncategorized" : "");
  const safeCategories = categories.length > 0 ? categories : safeCategory ? [safeCategory] : [];
  const safePrice = Math.max(0, price);
  const safeSalePrice = salePrice > 0 && salePrice < safePrice ? salePrice : null;
  const hasSaleScheduleStartAtInput = formData.has("saleScheduleStartAt");
  const hasSaleScheduleEndAtInput = formData.has("saleScheduleEndAt");
  const parsedSaleScheduleStartAt = asIsoDateTimeOrNull(formData.get("saleScheduleStartAt"));
  const parsedSaleScheduleEndAt = asIsoDateTimeOrNull(formData.get("saleScheduleEndAt"));
  const saleScheduleStartAt = safeSalePrice !== null
    ? (hasSaleScheduleStartAtInput ? parsedSaleScheduleStartAt : previous?.saleScheduleStartAt ?? null)
    : null;
  let saleScheduleEndAt = safeSalePrice !== null
    ? (hasSaleScheduleEndAtInput ? parsedSaleScheduleEndAt : previous?.saleScheduleEndAt ?? null)
    : null;
  if (
    saleScheduleStartAt &&
    saleScheduleEndAt &&
    Date.parse(saleScheduleEndAt) <= Date.parse(saleScheduleStartAt)
  ) {
    saleScheduleEndAt = null;
  }
  const safeStock = Math.max(0, stock);

  if (!name || !safeCategory) {
    return { ok: false, product: null, created: false, message: "Product name and category are required." };
  }
  if (!isDraft && stock < 0) {
    return { ok: false, product: null, created: false, message: "Stock cannot be negative." };
  }
  if (visibility === "Password" && !visibilityPassword) {
    return { ok: false, product: null, created: false, message: "Password is required for protected visibility." };
  }

  let saved: Product | null = null;
  let created = false;

  if (productId) {
    saved = updateProduct(productId, {
      name,
      category: safeCategory,
      categories: safeCategories,
      visibility,
      visibilityPassword,
      price: safePrice,
      salePrice: safeSalePrice,
      saleScheduleStartAt,
      saleScheduleEndAt,
      stock: safeStock,
      slug,
      description,
      image,
      gallery,
      tags,
      publishStatus: requestedStatus,
    });
  } else {
    saved = addProduct({
      name,
      category: safeCategory,
      categories: safeCategories,
      visibility,
      visibilityPassword,
      price: safePrice,
      salePrice: safeSalePrice,
      saleScheduleStartAt,
      saleScheduleEndAt,
      stock: safeStock,
      slug,
      description,
      image,
      gallery,
      tags,
      publishStatus: requestedStatus,
    });
    created = Boolean(saved);
  }

  if (!saved) {
    return { ok: false, product: null, created: false, message: "Could not save product." };
  }

  attachUploadedProductMedia(saved.id, uploadedBy, [imageFromUpload, ...galleryFromUpload]);

  revalidateProductPaths(previous ?? undefined);
  revalidateProductPaths(saved);

  return { ok: true, product: saved, created };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  for (const cookieName of [
    ADMIN_COOKIE_NAME,
    ADMIN_ROLE_COOKIE_NAME,
    ADMIN_USERNAME_COOKIE_NAME,
    ADMIN_SIDEBAR_COOKIE_NAME,
  ]) {
    cookieStore.delete(cookieName);
    cookieStore.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  redirect("/login");
}

export async function updateBrandingSettingsAction(formData: FormData) {
  const siteTitle = asString(formData.get("siteTitle"));
  const brandName = asString(formData.get("brandName"));
  const layoutMaxWidthPx = asInteger(formData.get("layoutMaxWidthPx"), 1440);
  const mediaUploadMaxMb = asInteger(formData.get("mediaUploadMaxMb"), 10);
  const logoUrlInput = asString(formData.get("logoUrl"));
  const iconUrlInput = asString(formData.get("iconUrl"));
  const logoSourceUrl = asString(formData.get("logoSourceUrl"));
  const iconSourceUrl = asString(formData.get("iconSourceUrl"));
  const logoMediaUrl = asString(formData.get("logoMediaUrl"));
  const iconMediaUrl = asString(formData.get("iconMediaUrl"));
  const logoFromUpload = await asImageUploadWebpUrl(formData.get("logoFile"), "branding");
  const iconFromUpload = await asImageUploadWebpUrl(formData.get("iconFile"), "branding");
  const logoFromMarkup = await asSvgMarkupPublicUrl(formData.get("logoMarkup"), "branding");
  const iconFromMarkup = await asSvgMarkupPublicUrl(formData.get("iconMarkup"), "branding");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const finalLogoUrl = logoFromUpload ?? logoFromMarkup ?? logoSourceUrl ?? logoMediaUrl ?? logoUrlInput;
  const finalIconUrl = iconFromUpload ?? iconFromMarkup ?? iconSourceUrl ?? iconMediaUrl ?? iconUrlInput;

  updateSiteSettings({
    siteTitle,
    brandName,
    layoutMaxWidthPx,
    mediaUploadMaxMb,
    useLogoOnly: Boolean(finalLogoUrl),
    logoUrl: finalLogoUrl,
    iconUrl: finalIconUrl,
    brandingVersion: Date.now(),
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product");
  revalidatePath("/my-account");
  revalidatePath("/login");
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/media");
  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/general");

  redirectToAdminDestination(redirectTo);
}

export async function updateEmailSettingsAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  updateSiteSettings({
    emailProvider: asEmailProvider(formData.get("emailProvider")),
    emailFromName: asString(formData.get("emailFromName")),
    emailFromAddress: asString(formData.get("emailFromAddress")),
    mailHost: asString(formData.get("mailHost")),
    mailPort: asInteger(formData.get("mailPort"), 587),
    mailSecure: asBoolean(formData.get("mailSecure")),
    mailUsername: asString(formData.get("mailUsername")),
    mailPassword: asString(formData.get("mailPassword")),
    phpMailerPath: asString(formData.get("phpMailerPath")),
    reactEmailApiUrl: asString(formData.get("reactEmailApiUrl")),
    reactEmailApiKey: asString(formData.get("reactEmailApiKey")),
    notifyCustomerOrderConfirmation: asBoolean(formData.get("notifyCustomerOrderConfirmation")),
    notifyAdminPaidOrder: asBoolean(formData.get("notifyAdminPaidOrder")),
    notifyShippedOrder: asBoolean(formData.get("notifyShippedOrder")),
    notifyLowStock: asBoolean(formData.get("notifyLowStock")),
  });

  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/emails");

  redirectToAdminDestination(redirectTo);
}

export async function updateBrandThemeSettingsAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  updateSiteSettings({
    titleFont: asString(formData.get("titleFont")),
    textFont: asString(formData.get("textFont")),
    buttonFont: asString(formData.get("buttonFont")),
    uiFont: asString(formData.get("uiFont")),
    primaryColor: asString(formData.get("primaryColor")),
    secondaryColor: asString(formData.get("secondaryColor")),
    accentColor: asString(formData.get("accentColor")),
    backgroundColor: asString(formData.get("backgroundColor")),
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/brand");

  redirectToAdminDestination(redirectTo);
}

export async function updateCheckoutPaymentSettingsAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  updateSiteSettings({
    paymentCadEnabled: asBoolean(formData.get("paymentCadEnabled")),
    paymentBankTransferEnabled: asBoolean(formData.get("paymentBankTransferEnabled")),
    paymentStripeDemoEnabled: asBoolean(formData.get("paymentStripeDemoEnabled")),
    paymentBankTransferInstructions: asString(formData.get("paymentBankTransferInstructions")),
  });

  revalidatePath("/checkout");
  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/payments");

  redirectToAdminDestination(redirectTo);
}

export async function updateCheckoutShippingSettingsAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  updateSiteSettings({
    shippingStandardEnabled: asBoolean(formData.get("shippingStandardEnabled")),
    shippingStandardLabel: asString(formData.get("shippingStandardLabel")),
    shippingStandardEta: asString(formData.get("shippingStandardEta")),
    shippingStandardPrice: Math.max(0, asNumber(formData.get("shippingStandardPrice"))),
    shippingExpressEnabled: asBoolean(formData.get("shippingExpressEnabled")),
    shippingExpressLabel: asString(formData.get("shippingExpressLabel")),
    shippingExpressEta: asString(formData.get("shippingExpressEta")),
    shippingExpressPrice: Math.max(0, asNumber(formData.get("shippingExpressPrice"))),
    shippingFreeThreshold: Math.max(0, asNumber(formData.get("shippingFreeThreshold"))),
  });

  revalidatePath("/checkout");
  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/shipping");

  redirectToAdminDestination(redirectTo);
}

export async function updateMenuSettingsAction(formData: FormData) {
  const labels = formData.getAll("menuLabel");
  const hrefs = formData.getAll("menuHref");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const headerMenu = labels
    .map((value, index) => ({
      label: asString(value),
      href: asString(hrefs[index] ?? null),
    }))
    .filter((item) => Boolean(item.label));

  updateSiteSettings({
    headerMenu,
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/contact");
  revalidatePath("/my-account");
  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/menu");

  redirectToAdminDestination(redirectTo);
}

export async function updateHomeSliderSettingsAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  updateSiteSettings({
    homeSlides: asHomeSliderItems(formData.get("slidesPayload")),
    sliderAutoplayMs: asInteger(formData.get("sliderAutoplayMs"), 4500),
    sliderShowArrows: asBoolean(formData.get("sliderShowArrows")),
    sliderShowDots: asBoolean(formData.get("sliderShowDots")),
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/slider");

  redirectToAdminDestination(redirectTo);
}

export async function addProductAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const result = await persistProductFromFormData(formData);
  if (!result.ok || !result.product) return;

  redirectToAdminDestination(redirectTo);
}

export async function addPageAction(formData: FormData) {
  const name = asString(formData.get("name"));
  const slug = asString(formData.get("slug"));
  const content = asString(formData.get("content"));
  const publishStatus = asPublicationStatus(asLastString(formData.getAll("publishStatus")), "Draft");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!name) return;

  const created = addPage({
    name,
    slug,
    content,
    publishStatus,
  });
  if (created) {
    revalidatePagePaths(created);
  }

  redirectToAdminDestination(redirectTo);
}

export async function updatePageAction(formData: FormData) {
  const pageId = asString(formData.get("pageId"));
  const name = asString(formData.get("name"));
  const slug = asString(formData.get("slug"));
  const content = asString(formData.get("content"));
  const publishStatus = asPublicationStatus(asLastString(formData.getAll("publishStatus")), "Draft");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!pageId || !name) return;

  const previous = getPageById(pageId, { includeDrafts: true, includeTrashed: true });
  const updated = updatePage(pageId, {
    name,
    slug,
    content,
    publishStatus,
  });

  if (previous) {
    revalidatePagePaths(previous);
  }
  if (updated) {
    revalidatePagePaths(updated);
  }

  redirectToAdminDestination(redirectTo);
}

export async function deletePageAction(formData: FormData) {
  const pageId = asString(formData.get("pageId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!pageId) return;

  const previous = getPageById(pageId, { includeDrafts: true, includeTrashed: true });
  const deleted = deletePagePermanently(pageId);
  if (!deleted) return;
  if (previous) {
    revalidatePagePaths(previous);
  }
  revalidatePagePaths();

  redirectToAdminDestination(redirectTo);
}

export async function trashPageAction(formData: FormData) {
  const pageId = asString(formData.get("pageId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!pageId) return;

  const previous = getPageById(pageId, { includeDrafts: true, includeTrashed: true });
  const updated = trashPage(pageId);
  if (previous) {
    revalidatePagePaths(previous);
  }
  if (updated) {
    revalidatePagePaths(updated);
  }
  revalidatePagePaths();

  redirectToAdminDestination(redirectTo);
}

export async function restorePageAction(formData: FormData) {
  const pageId = asString(formData.get("pageId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!pageId) return;

  const previous = getPageById(pageId, { includeDrafts: true, includeTrashed: true });
  const updated = restorePage(pageId);
  if (previous) {
    revalidatePagePaths(previous);
  }
  if (updated) {
    revalidatePagePaths(updated);
  }
  revalidatePagePaths();

  redirectToAdminDestination(redirectTo);
}

export async function setPagePublishStatusAction(formData: FormData) {
  const pageId = asString(formData.get("pageId"));
  const publishStatus = asPublicationStatus(asLastString(formData.getAll("publishStatus")), "Draft");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!pageId) return;

  const previous = getPageById(pageId, { includeDrafts: true, includeTrashed: true });
  const updated = setPagePublishStatus(pageId, publishStatus);
  if (previous) {
    revalidatePagePaths(previous);
  }
  if (updated) {
    revalidatePagePaths(updated);
  }
  revalidatePagePaths();

  redirectToAdminDestination(redirectTo);
}

export async function bulkPageAction(formData: FormData) {
  const action = asString(formData.get("bulkAction"));
  const selectedIdsRaw = asString(formData.get("selectedPageIds"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const pageIds = selectedIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!action || pageIds.length === 0) return;

  for (const pageId of pageIds) {
    if (action === "publish") {
      setPagePublishStatus(pageId, "Published");
    } else if (action === "draft") {
      setPagePublishStatus(pageId, "Draft");
    } else if (action === "trash") {
      trashPage(pageId);
    } else if (action === "restore") {
      restorePage(pageId);
    } else if (action === "delete_permanently") {
      deletePagePermanently(pageId);
    }
  }

  revalidatePagePaths();
  redirectToAdminDestination(redirectTo);
}

export async function updateProductAction(formData: FormData) {
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const result = await persistProductFromFormData(formData);
  if (!result.ok || !result.product) return;

  redirectToAdminDestination(redirectTo);
}

export async function saveProductDraftSilentlyAction(formData: FormData): Promise<{
  ok: boolean;
  productId?: string;
  slug?: string;
  publishStatus?: PublicationStatus;
  message?: string;
}> {
  const result = await persistProductFromFormData(formData, {
    forcePublishStatus: "Draft",
    allowDraftWithoutName: true,
  });

  if (!result.ok || !result.product) {
    return {
      ok: false,
      message: result.message || "Draft could not be saved.",
    };
  }

  return {
    ok: true,
    productId: result.product.id,
    slug: result.product.slug,
    publishStatus: result.product.publishStatus,
  };
}

export async function publishProductSilentlyAction(formData: FormData): Promise<{
  ok: boolean;
  productId?: string;
  slug?: string;
  publishStatus?: PublicationStatus;
  message?: string;
}> {
  const result = await persistProductFromFormData(formData, {
    forcePublishStatus: "Published",
    allowDraftWithoutName: false,
  });

  if (!result.ok || !result.product) {
    return {
      ok: false,
      message: result.message || "Product could not be published.",
    };
  }

  return {
    ok: true,
    productId: result.product.id,
    slug: result.product.slug,
    publishStatus: result.product.publishStatus,
  };
}

export async function createProductPreviewSilentlyAction(formData: FormData): Promise<{
  ok: boolean;
  slug?: string;
  draftToken?: string;
  message?: string;
}> {
  const built = await buildProductPreviewDraftFromFormData(formData);
  if (!built.ok || !built.draft) {
    return {
      ok: false,
      message: built.message || "Preview is unavailable.",
    };
  }

  const draftToken = createProductPreviewDraft(built.draft);
  return {
    ok: true,
    slug: built.draft.slug,
    draftToken,
  };
}

export async function trashProductAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  const updated = trashProduct(productId);
  revalidateProductPaths(previous ?? undefined);
  revalidateProductPaths(updated ?? undefined);

  const normalizedRedirectTo = normalizeAdminDestination(redirectTo);
  if (normalizedRedirectTo.startsWith("/dashboard/products") && updated) {
    const undoUntil = String(Date.now() + 15_000);
    redirect(
      withQueryParams(normalizedRedirectTo, {
        trash: "1",
        trashedProductId: updated.id,
        undoUntil,
      }),
    );
  }

  redirectToAdminDestination(redirectTo);
}

export async function restoreProductAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  const updated = restoreProduct(productId);
  revalidateProductPaths(previous ?? undefined);
  revalidateProductPaths(updated ?? undefined);

  redirectToAdminDestination(redirectTo);
}

export async function deleteProductPermanentlyAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  deleteProductPermanently(productId);
  revalidateProductPaths(previous ?? undefined);

  redirectToAdminDestination(redirectTo);
}

export async function setProductPublishStatusAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const publishStatus = asPublicationStatus(formData.get("publishStatus"), "Draft");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  const updated = setProductPublishStatus(productId, publishStatus);
  revalidateProductPaths(previous ?? undefined);
  revalidateProductPaths(updated ?? undefined);

  redirectToAdminDestination(redirectTo);
}

export async function updateProductStockInlineAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const nextStock = Math.max(0, Math.floor(asNumber(formData.get("stock"))));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  if (!previous) return;

  const updated = updateProduct(productId, {
    name: previous.name,
    category: previous.category,
    categories: previous.categories,
    visibility: previous.visibility,
    visibilityPassword: previous.visibilityPassword,
    price: previous.price,
    salePrice: previous.salePrice,
    saleScheduleStartAt: previous.saleScheduleStartAt,
    saleScheduleEndAt: previous.saleScheduleEndAt,
    stock: nextStock,
    slug: previous.slug,
    description: previous.description,
    image: previous.image,
    gallery: previous.gallery,
    tags: previous.tags,
    publishStatus: previous.publishStatus,
  });

  revalidateProductPaths(previous);
  revalidateProductPaths(updated ?? undefined);
  redirectToAdminDestination(redirectTo || "/dashboard/products", "Stock updated.");
}

export async function updateProductPricingInlineAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const nextPrice = Math.max(0, asNumber(formData.get("price")));
  const rawSalePrice = asNumber(formData.get("salePrice"));
  const nextSalePrice = rawSalePrice > 0 && rawSalePrice < nextPrice ? rawSalePrice : null;
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  if (!previous) return;

  const updated = updateProduct(productId, {
    name: previous.name,
    category: previous.category,
    categories: previous.categories,
    visibility: previous.visibility,
    visibilityPassword: previous.visibilityPassword,
    price: nextPrice,
    salePrice: nextSalePrice,
    saleScheduleStartAt: nextSalePrice !== null ? previous.saleScheduleStartAt : null,
    saleScheduleEndAt: nextSalePrice !== null ? previous.saleScheduleEndAt : null,
    stock: previous.stock,
    slug: previous.slug,
    description: previous.description,
    image: previous.image,
    gallery: previous.gallery,
    tags: previous.tags,
    publishStatus: previous.publishStatus,
  });

  revalidateProductPaths(previous);
  revalidateProductPaths(updated ?? undefined);
  redirectToAdminDestination(redirectTo || "/dashboard/products", "Pricing updated.");
}

export async function bulkProductAction(formData: FormData) {
  const action = asString(formData.get("bulkAction"));
  const selectedIdsRaw = asString(formData.get("selectedProductIds"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const productIds = selectedIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!action || productIds.length === 0) return;

  for (const productId of productIds) {
    if (action === "publish") {
      setProductPublishStatus(productId, "Published");
    } else if (action === "draft") {
      setProductPublishStatus(productId, "Draft");
    } else if (action === "trash") {
      trashProduct(productId);
    } else if (action === "restore") {
      restoreProduct(productId);
    } else if (action === "delete_permanently") {
      deleteProductPermanently(productId);
    }
  }

  revalidateProductPaths();
  redirectToAdminDestination(redirectTo);
}

export async function addOrderAction(formData: FormData) {
  const customer = asString(formData.get("customer"));
  const productId = asString(formData.get("productId"));
  const quantity = Math.max(1, asNumber(formData.get("quantity")));
  const status = asOrderStatus(formData.get("status"), "Pending");
  const total = asNumber(formData.get("total"));
  const discount = asNumber(formData.get("discount"));
  const couponCode = asString(formData.get("couponCode"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  if (!customer || !productId) return;

  addOrder({
    customer,
    productId,
    quantity,
    status,
    total: total > 0 ? total : undefined,
    discount: discount > 0 ? discount : undefined,
    couponCode: couponCode || null,
  });

  revalidateOrderPaths();
  redirectToAdminDestination(redirectTo);
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = asString(formData.get("orderId"));
  const status = asOrderStatus(formData.get("status"), "Pending");
  if (!orderId) return;

  updateOrderStatus(orderId, status);
  revalidateOrderPaths(orderId);
}

export async function updateOrderAction(formData: FormData) {
  const orderId = asString(formData.get("orderId"));
  const customer = asString(formData.get("customer"));
  const productId = asString(formData.get("productId"));
  const quantity = Math.max(1, asNumber(formData.get("quantity")));
  const status = asOrderStatus(formData.get("status"), "Pending");
  const total = asNumber(formData.get("total"));
  const discount = asNumber(formData.get("discount"));
  const couponCode = asString(formData.get("couponCode"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!orderId || !customer || !productId) return;

  updateOrder(orderId, {
    customer,
    productId,
    quantity,
    status,
    total: total > 0 ? total : undefined,
    discount: discount > 0 ? discount : undefined,
    couponCode: couponCode || null,
  });

  revalidateOrderPaths(orderId);
  redirectToAdminDestination(redirectTo);
}

export async function bulkOrderAction(formData: FormData) {
  const selectedIdsRaw = asString(formData.get("selectedOrderIds"));
  const status = asOrderStatus(formData.get("status"), "Pending");
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const orderIds = selectedIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (orderIds.length === 0) return;

  bulkUpdateOrderStatus(orderIds, status);
  revalidateOrderPaths();
  redirectToAdminDestination(redirectTo);
}

export async function replySupportTicketAction(formData: FormData) {
  const cookieStore = await cookies();
  const actor = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const ticketId = asString(formData.get("ticketId"));
  const message = asString(formData.get("message"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!ticketId || !message) return;

  addSupportTicketReply(ticketId, actor, message);
  revalidateSupportTicketPaths();
  redirectToAdminDestination(redirectTo, "Ticket reply saved.");
}

export async function setSupportTicketStatusAction(formData: FormData) {
  const ticketId = asString(formData.get("ticketId"));
  const statusRaw = asString(formData.get("status"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!ticketId) return;

  const status: SupportTicketStatus = statusRaw === "Closed" ? "Closed" : "Open";
  setSupportTicketStatus(ticketId, status);
  revalidateSupportTicketPaths();
  redirectToAdminDestination(redirectTo, "Ticket status updated.");
}

export async function deleteSupportTicketAction(formData: FormData) {
  const cookieStore = await cookies();
  const currentRole = getAdminRoleFromCookieStore(cookieStore);
  if (currentRole !== "Super Admin") return;

  const ticketId = asString(formData.get("ticketId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!ticketId) return;

  deleteSupportTicket(ticketId);
  revalidateSupportTicketPaths();
  redirectToAdminDestination(redirectTo, "Ticket deleted.");
}

export async function markAllNotificationsReadAction() {
  const updated = markAllAdminNotificationsAsRead();
  if (updated > 0) {
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/help-tickets");
  }
}

export async function addMediaAction(formData: FormData) {
  const cookieStore = await cookies();
  const uploadedBy = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const imageFromUpload = await asImageUploadWebpUrl(formData.get("mediaFile"), "media");
  const url = imageFromUpload ?? asString(formData.get("url"));
  const alt = asString(formData.get("alt"));
  const description = asString(formData.get("description"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!url) return;

  const created = addMedia({
    url,
    assignedTo: "Unassigned",
    assignedToId: "",
    uploadedBy,
    alt,
    description,
  });
  revalidateMediaPaths(created?.id);
  revalidateProductPaths();

  redirectToAdminDestination(redirectTo);
}

export async function addMediaBatchAction(formData: FormData) {
  const cookieStore = await cookies();
  const uploadedBy = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const uploadedUrls = await asImageUploadWebpUrlList(formData.getAll("mediaFiles"), "media");
  const alt = asString(formData.get("alt"));
  const description = asString(formData.get("description"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (uploadedUrls.length === 0) return;

  for (const url of uploadedUrls) {
    addMedia({
      url,
      assignedTo: "Unassigned",
      assignedToId: "",
      uploadedBy,
      alt,
      description,
    });
  }

  revalidateMediaPaths();
  revalidateProductPaths();

  const successMessage = uploadedUrls.length === 1 ? "1 media uploaded successfully." : `${uploadedUrls.length} media uploaded successfully.`;
  redirectToAdminDestination(redirectTo, successMessage);
}

export async function uploadMediaSilentlyAction(formData: FormData): Promise<{
  ok: boolean;
  items?: Array<{
    id: string;
    url: string;
    label: string;
    uploadedBy: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  message?: string;
}> {
  const cookieStore = await cookies();
  const uploadedBy = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const uploadedUrls = await asImageUploadWebpUrlList(formData.getAll("mediaFiles"), "media");
  if (uploadedUrls.length === 0) {
    return {
      ok: false,
      message: "No valid image was uploaded.",
    };
  }

  const createdItems: Array<{
    id: string;
    url: string;
    label: string;
    uploadedBy: string | null;
    createdAt: string;
    updatedAt: string;
  }> = [];

  for (const url of uploadedUrls) {
    const created = addMedia({
      url,
      assignedTo: "Unassigned",
      assignedToId: "",
      uploadedBy,
    });
    if (!created) continue;
    createdItems.push({
      id: created.id,
      url: created.url,
      label: created.alt || created.url,
      uploadedBy: created.uploadedBy ?? null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  revalidateMediaPaths();
  revalidateProductPaths();

  return {
    ok: createdItems.length > 0,
    items: createdItems,
    message: createdItems.length > 0 ? undefined : "Upload failed.",
  };
}

export async function updateMediaAction(formData: FormData) {
  const mediaId = asString(formData.get("mediaId"));
  const imageFromUpload = await asImageUploadWebpUrl(formData.get("mediaFile"), "media");
  const croppedImage = asString(formData.get("croppedImage"));
  const croppedImageFromEditor = await asWebpUrlFromDataUrl(croppedImage, "media");
  const urlFromText = asString(formData.get("url"));
  const url = croppedImageFromEditor || imageFromUpload || urlFromText;
  const alt = asString(formData.get("alt"));
  const description = asString(formData.get("description"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!mediaId) return;

  const updated = updateMedia(mediaId, {
    url: url || undefined,
    alt,
    description,
  });

  revalidateMediaPaths(updated?.id ?? mediaId);
  revalidateProductPaths();

  redirectToAdminDestination(redirectTo);
}

export async function trashMediaAction(formData: FormData) {
  const mediaId = asString(formData.get("mediaId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!mediaId) return;

  const updated = trashMedia(mediaId);
  revalidateMediaPaths(updated?.id ?? mediaId);
  redirectToAdminDestination(redirectTo);
}

export async function restoreMediaAction(formData: FormData) {
  const mediaId = asString(formData.get("mediaId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!mediaId) return;

  const updated = restoreMedia(mediaId);
  revalidateMediaPaths(updated?.id ?? mediaId);
  redirectToAdminDestination(redirectTo);
}

export async function deleteMediaPermanentlyAction(formData: FormData) {
  const mediaId = asString(formData.get("mediaId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!mediaId) return;

  deleteMediaPermanently(mediaId);
  revalidateMediaPaths();
  redirectToAdminDestination(redirectTo);
}

export async function bulkMediaAction(formData: FormData) {
  const action = asString(formData.get("bulkAction"));
  const selectedIdsRaw = asString(formData.get("selectedMediaIds"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const mediaIds = selectedIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!action || mediaIds.length === 0) return;

  for (const mediaId of mediaIds) {
    if (action === "trash") {
      trashMedia(mediaId);
    } else if (action === "restore") {
      restoreMedia(mediaId);
    } else if (action === "delete_permanently") {
      deleteMediaPermanently(mediaId);
    }
  }

  revalidateMediaPaths();
  revalidateProductPaths();
  redirectToAdminDestination(redirectTo);
}

export async function addSaleAction(formData: FormData) {
  const source = asString(formData.get("source"));
  const amount = asNumber(formData.get("amount"));
  const createdAt = asString(formData.get("createdAt")) || new Date().toISOString().slice(0, 10);
  if (!source || amount <= 0) return;

  addSale({
    source,
    amount,
    createdAt,
  });

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/sales");
}

export async function registerAccountAction(formData: FormData) {
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email"));
  const role = asString(formData.get("role")) || "Staff";
  if (!name || !email) return;

  addAdminAccount({
    name,
    email,
    role,
  });

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/register-account");
}

export async function registerUserAction(formData: FormData) {
  const cookieStore = await cookies();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const name = asString(formData.get("name"));
  const surname = asString(formData.get("surname"));
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));
  const avatarUrlInput = asString(formData.get("avatarUrl"));
  const avatarSourceUrl = asString(formData.get("avatarSourceUrl"));
  const avatarFromUpload = await asImageUploadWebpUrl(formData.get("avatarFile"), "users");
  const avatarUrl = avatarFromUpload ?? avatarSourceUrl ?? avatarUrlInput;
  const role = asString(formData.get("role")) as UserRole;
  const phone = asString(formData.get("phone"));
  const city = asString(formData.get("city"));
  const address = asString(formData.get("address"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  const safeRole = (role || "Customer") as UserRole;
  if (!name || !email || password.length < 6) return;
  if (!canCreateUserRole(currentRole, safeRole)) return;

  addUser({
    name,
    surname,
    username,
    email,
    password,
    avatarUrl,
    role: safeRole,
    phone,
    city,
    address,
    source: "Admin",
  });

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/users");
  revalidateAdminPath("/admin/customers");

  redirectToAdminDestination(redirectTo);
}

export async function updateUserAction(formData: FormData) {
  const cookieStore = await cookies();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const userId = asString(formData.get("userId"));
  const name = asString(formData.get("name"));
  const surname = asString(formData.get("surname"));
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));
  const avatarUrlInput = asString(formData.get("avatarUrl"));
  const avatarSourceUrl = asString(formData.get("avatarSourceUrl"));
  const avatarFromUpload = await asImageUploadWebpUrl(formData.get("avatarFile"), "users");
  const avatarUrl = avatarFromUpload ?? avatarSourceUrl ?? avatarUrlInput;
  const role = asString(formData.get("role")) as UserRole;
  const phone = asString(formData.get("phone"));
  const city = asString(formData.get("city"));
  const address = asString(formData.get("address"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  if (!userId || !name || !email || !role) return;
  const existingUser = getUserById(userId);
  if (!existingUser) return;

  if (existingUser.role === "Super Admin" && currentRole !== "Super Admin") return;
  if (!canCreateUserRole(currentRole, role)) return;

  updateUser(userId, {
    name,
    surname,
    username,
    email,
    password,
    avatarUrl,
    role,
    phone,
    city,
    address,
  });

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/users");
  revalidateAdminPath(`/admin/users/${userId}`);
  revalidateAdminPath("/admin/customers");

  redirectToAdminDestination(redirectTo);
}

export async function deleteUserAction(formData: FormData) {
  const userId = asString(formData.get("userId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!userId) return;

  const cookieStore = await cookies();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const targetUser = getUserById(userId);
  if (!targetUser) return;

  if (!canDeleteUser(currentRole, targetUser.role)) return;

  const deleted = deleteUser(userId, currentRole);
  if (!deleted) return;

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/users");
  revalidateAdminPath("/admin/customers");

  redirectToAdminDestination(redirectTo);
}

export async function deactivateUserAction(formData: FormData) {
  const userId = asString(formData.get("userId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!userId) return;

  const cookieStore = await cookies();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;
  const targetUser = getUserById(userId);
  if (!targetUser) return;

  if (!canDeleteUser(currentRole, targetUser.role)) return;

  const updated = deactivateUser(userId, currentRole);
  if (!updated) return;

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/users");
  revalidateAdminPath(`/admin/users/${userId}`);
  revalidateAdminPath("/admin/customers");

  redirectToAdminDestination(redirectTo);
}

export async function bulkUserAction(formData: FormData) {
  const action = asString(formData.get("bulkAction"));
  const selectedIdsRaw = asString(formData.get("selectedUserIds"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  const userIds = selectedIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!action || userIds.length === 0) return;

  const cookieStore = await cookies();
  const currentRole = getAdminRoleFromCookieStore(cookieStore) as UserRole;

  if (action === "delete") {
    bulkDeleteUsers(userIds, currentRole);
  } else if (action === "deactivate") {
    bulkDeactivateUsers(userIds, currentRole);
  } else if (action === "send_password_reset") {
    bulkMarkPasswordResetRequired(userIds, currentRole);
  } else {
    return;
  }

  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/users");
  revalidateAdminPath("/admin/customers");

  redirectToAdminDestination(redirectTo);
}

export async function addCouponAction(formData: FormData) {
  const code = asString(formData.get("code"));
  const description = asString(formData.get("description"));
  const type = asString(formData.get("type")) === "fixed" ? "fixed" : "percent";
  const value = asNumber(formData.get("value"));
  const minSubtotal = asNumber(formData.get("minSubtotal"));
  const isActive = asBoolean(formData.get("isActive"));

  if (!code || value <= 0) return;

  addCoupon({
    code,
    description,
    type,
    value,
    minSubtotal,
    isActive,
  });

  revalidateAdminPath("/admin/coupons");
  revalidatePath("/checkout");
  revalidatePath("/cart");
}

export async function setCouponStatusAction(formData: FormData) {
  const couponId = asString(formData.get("couponId"));
  const isActive = asBoolean(formData.get("isActive"));
  if (!couponId) return;

  setCouponStatus(couponId, isActive);
  revalidateAdminPath("/admin/coupons");
  revalidatePath("/checkout");
}

export async function addReviewAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const author = asString(formData.get("author"));
  const rating = asNumber(formData.get("rating"));
  const comment = asString(formData.get("comment"));
  const statusRaw = asString(formData.get("status")) as ReviewStatus;
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  if (!productId || !author || rating < 1 || rating > 5 || !comment) return;

  const safeStatus: ReviewStatus =
    statusRaw === "Pending" || statusRaw === "Hidden" ? statusRaw : "Approved";

  const created = addReview({
    productId,
    author,
    rating,
    comment,
    status: safeStatus,
  });

  if (created) {
    const product = getProductById(created.productId, { includeTrashed: true, includeDrafts: true });
    if (product) {
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/shop/${product.slug}`);
      revalidateAdminPath(`/admin/products/${product.id}`);
    }
  }

  revalidateAdminPath("/admin/reviews");

  redirectToAdminDestination(redirectTo);
}

export async function updateReviewStatusAction(formData: FormData) {
  const reviewId = asString(formData.get("reviewId"));
  const statusRaw = asString(formData.get("status")) as ReviewStatus;
  if (!reviewId) return;

  const safeStatus: ReviewStatus =
    statusRaw === "Pending" || statusRaw === "Hidden" ? statusRaw : "Approved";

  const updated = updateReviewStatus(reviewId, safeStatus);
  if (updated) {
    const product = getProductById(updated.productId, { includeTrashed: true, includeDrafts: true });
    if (product) {
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/shop/${product.slug}`);
    }
  }

  revalidateAdminPath("/admin/reviews");
}

export async function deleteReviewAction(formData: FormData) {
  const reviewId = asString(formData.get("reviewId"));
  const productSlug = asString(formData.get("productSlug"));
  if (!reviewId) return;

  deleteReview(reviewId);
  if (productSlug) {
    const product = getProductBySlug(productSlug, { includeTrashed: true, includeDrafts: true });
    if (product) {
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/shop/${product.slug}`);
    }
  }

  revalidateAdminPath("/admin/reviews");
}
