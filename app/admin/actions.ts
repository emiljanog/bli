"use server";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import sharp from "sharp";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_SIDEBAR_COOKIE_NAME,
  ADMIN_USERNAME_COOKIE_NAME,
  getAdminRoleFromCookieStore,
  getAdminUsernameFromCookieStore,
} from "@/lib/admin-auth";
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
  bulkDeactivateUsers,
  bulkDeleteUsers,
  bulkMarkPasswordResetRequired,
  bulkUpdateOrderStatus,
  canCreateUserRole,
  canDeleteUser,
  deactivateUser,
  deleteMediaPermanently,
  deletePagePermanently,
  deleteUser,
  deleteReview,
  deleteProductPermanently,
  getPageById,
  getProductById,
  getProductBySlug,
  getUserById,
  type PublicationStatus,
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
  trashMedia,
  trashPage,
  trashProduct,
  updateMedia,
  updateOrder,
  updateSiteSettings,
  updateUser,
  updateReviewStatus,
  updateProduct,
  updatePage,
  updateOrderStatus,
} from "@/lib/shop-store";

function asString(input: FormDataEntryValue | null): string {
  return typeof input === "string" ? input.trim() : "";
}

function asNumber(input: FormDataEntryValue | null): number {
  const value = Number(asString(input));
  return Number.isFinite(value) ? value : 0;
}

function asBoolean(input: FormDataEntryValue | null): boolean {
  const value = asString(input).toLowerCase();
  return value === "1" || value === "true" || value === "on" || value === "yes";
}

function asPublicationStatus(input: FormDataEntryValue | null, fallback: PublicationStatus = "Draft"): PublicationStatus {
  const value = asString(input).toLowerCase();
  if (value === "published") return "Published";
  if (value === "draft") return "Draft";
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

function asLastString(values: FormDataEntryValue[]): string {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (typeof values[index] === "string") {
      return asString(values[index]);
    }
  }
  return "";
}

function normalizeAdminDestination(path: string): string {
  if (path.startsWith("/dashboard")) return path;
  if (path === "/admin") return "/dashboard";
  if (path.startsWith("/admin/")) {
    return `/dashboard${path.slice("/admin".length)}`;
  }
  return "";
}

function redirectToAdminDestination(path: string) {
  const normalized = normalizeAdminDestination(path);
  if (normalized) {
    redirect(normalized);
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

async function bufferToWebpPublicUrl(buffer: Buffer, subdir: string): Promise<string | null> {
  try {
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
  if (input.size > 10 * 1024 * 1024) return null;

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

function revalidateProductPaths(product?: Pick<Product, "id" | "slug">) {
  revalidatePath("/");
  revalidatePath("/product");
  revalidatePath("/shop");
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/products");
  revalidateAdminPath("/admin/media");

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

  redirect("/admin/login");
}

export async function updateBrandingSettingsAction(formData: FormData) {
  const siteTitle = asString(formData.get("siteTitle"));
  const brandName = asString(formData.get("brandName"));
  const useLogoOnly = asBoolean(formData.get("useLogoOnly"));
  const logoUrlInput = asString(formData.get("logoUrl"));
  const iconUrlInput = asString(formData.get("iconUrl"));
  const logoFromUpload = await asImageUploadWebpUrl(formData.get("logoFile"), "branding");
  const iconFromUpload = await asImageUploadWebpUrl(formData.get("iconFile"), "branding");
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  updateSiteSettings({
    siteTitle,
    brandName,
    useLogoOnly,
    logoUrl: logoFromUpload ?? logoUrlInput,
    iconUrl: iconFromUpload ?? iconUrlInput,
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product");
  revalidatePath("/my-account");
  revalidatePath("/user/login");
  revalidateAdminPath("/admin");
  revalidateAdminPath("/admin/settings");
  revalidateAdminPath("/admin/settings/branding");

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

export async function addProductAction(formData: FormData) {
  const cookieStore = await cookies();
  const uploadedBy = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const name = asString(formData.get("name"));
  const category = asString(formData.get("newCategory")) || asString(formData.get("category"));
  const price = asNumber(formData.get("price"));
  const stock = asNumber(formData.get("stock"));
  const slug = asString(formData.get("slug"));
  const description = asString(formData.get("description"));
  const imageFromUpload = await asImageUploadWebpUrl(formData.get("imageFile"), "products");
  const galleryFromUpload = await asImageUploadWebpUrlList(formData.getAll("galleryFiles"), "products");
  const image = imageFromUpload ?? asString(formData.get("image"));
  const gallery = galleryFromUpload.length > 0 ? galleryFromUpload : asList(formData.get("gallery"));
  const tags = asList(formData.get("tags"));
  const publishStatus = asPublicationStatus(asLastString(formData.getAll("publishStatus")), "Draft");
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  const isDraft = publishStatus === "Draft";
  const safeCategory = category || (isDraft ? "Uncategorized" : "");
  const safePrice = isDraft ? Math.max(0, price) : price;
  const safeStock = Math.max(0, stock);

  if (!name || !safeCategory) return;
  if (!isDraft && safePrice <= 0) return;
  if (!isDraft && stock < 0) return;

  const created = addProduct({
    name,
    category: safeCategory,
    price: safePrice,
    stock: safeStock,
    slug,
    description,
    image,
    gallery,
    tags,
    publishStatus,
  });

  attachUploadedProductMedia(created.id, uploadedBy, [imageFromUpload, ...galleryFromUpload]);

  revalidateProductPaths(created);

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
  const cookieStore = await cookies();
  const uploadedBy = getAdminUsernameFromCookieStore(cookieStore) || "admin";
  const productId = asString(formData.get("productId"));
  const name = asString(formData.get("name"));
  const category = asString(formData.get("newCategory")) || asString(formData.get("category"));
  const price = asNumber(formData.get("price"));
  const stock = asNumber(formData.get("stock"));
  const slug = asString(formData.get("slug"));
  const description = asString(formData.get("description"));
  const imageFromUpload = await asImageUploadWebpUrl(formData.get("imageFile"), "products");
  const galleryFromUpload = await asImageUploadWebpUrlList(formData.getAll("galleryFiles"), "products");
  const image = imageFromUpload ?? asString(formData.get("image"));
  const gallery = galleryFromUpload.length > 0 ? galleryFromUpload : asList(formData.get("gallery"));
  const tags = asList(formData.get("tags"));
  const publishStatus = asPublicationStatus(asLastString(formData.getAll("publishStatus")), "Draft");
  const redirectTo = asLastString(formData.getAll("redirectTo"));

  const isDraft = publishStatus === "Draft";
  const safeCategory = category || (isDraft ? "Uncategorized" : "");
  const safePrice = isDraft ? Math.max(0, price) : price;
  const safeStock = Math.max(0, stock);

  if (!productId || !name || !safeCategory) return;
  if (!isDraft && safePrice <= 0) return;
  if (!isDraft && stock < 0) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  const updated = updateProduct(productId, {
    name,
    category: safeCategory,
    price: safePrice,
    stock: safeStock,
    slug,
    description,
    image,
    gallery,
    tags,
    publishStatus,
  });

  if (updated) {
    attachUploadedProductMedia(updated.id, uploadedBy, [imageFromUpload, ...galleryFromUpload]);
  }

  revalidateProductPaths(previous ?? undefined);
  revalidateProductPaths(updated ?? undefined);

  redirectToAdminDestination(redirectTo);
}

export async function trashProductAction(formData: FormData) {
  const productId = asString(formData.get("productId"));
  const redirectTo = asLastString(formData.getAll("redirectTo"));
  if (!productId) return;

  const previous = getProductById(productId, { includeTrashed: true, includeDrafts: true });
  const updated = trashProduct(productId);
  revalidateProductPaths(previous ?? undefined);
  revalidateProductPaths(updated ?? undefined);

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
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));
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
    username,
    email,
    password,
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
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));
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
    username,
    email,
    password,
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
