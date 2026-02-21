import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { WhatsAppOrderButton } from "@/components/whatsapp-order-button";
import { ADMIN_COOKIE_NAME, ADMIN_ROLE_COOKIE_NAME, ADMIN_SESSION_VALUE, resolveAdminRole } from "@/lib/admin-auth";
import { getProductPreviewDraft } from "@/lib/product-preview-drafts";
import { getEffectiveProductPricing, getProductById, getProductBySlug, listProducts, listReviews, type Product } from "@/lib/shop-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type ProductPageProps = {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<{ preview?: string; access?: string; draftToken?: string }>;
};

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { productId: productHandle } = await params;
  const query = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const role = resolveAdminRole(cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value ?? "Customer");
  const isAdminViewer = isLoggedIn && role !== "Customer";
  const isPreviewMode = query.preview === "1" && isAdminViewer;
  const draftToken = (query.draftToken ?? "").trim();
  const previewDraft = isPreviewMode && draftToken ? getProductPreviewDraft(draftToken) : null;
  const accessPassword = (query.access ?? "").trim();

  const bySlug = getProductBySlug(productHandle, { includeDrafts: isPreviewMode });
  const baseProduct = previewDraft
    ? getProductById(previewDraft.productId, { includeDrafts: true, includeTrashed: true })
    : bySlug;

  if (baseProduct) {
    const product: Product =
      previewDraft && previewDraft.productId === baseProduct.id
        ? {
          ...baseProduct,
          ...previewDraft,
          categories: [...previewDraft.categories],
          gallery: [...previewDraft.gallery],
          tags: [...previewDraft.tags],
        }
        : baseProduct;

    if (product.visibility === "LoggedUsers" && !isLoggedIn) {
      redirect(`/login?next=/product/${product.slug}`);
    }

    if (product.visibility === "Password" && !isAdminViewer && accessPassword !== product.visibilityPassword) {
      return (
        <main className="text-slate-900">
          <section className="mx-auto w-[90%] max-w-[720px] py-10 md:py-14">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold text-slate-500">Protected Product</p>
              <h1 className="mt-2 text-3xl font-bold">Password Required</h1>
              <p className="mt-2 text-sm text-slate-600">
                This product is password protected. Enter password to continue.
              </p>
              <form method="get" className="mt-4 space-y-3">
                <input
                  type="password"
                  name="access"
                  placeholder="Product password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  required
                />
                {isPreviewMode ? <input type="hidden" name="preview" value="1" /> : null}
                {isPreviewMode && draftToken ? <input type="hidden" name="draftToken" value={draftToken} /> : null}
                <button
                  type="submit"
                  className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                >
                  View Product
                </button>
              </form>
            </article>
          </section>
        </main>
      );
    }

    const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
    const pricing = getEffectiveProductPricing(product);
    const reviews = listReviews({ productId: product.id, status: "Approved" });
    const normalizedCategories = Array.from(new Set([...product.categories, product.category].map((value) => value.trim()).filter(Boolean)));
    const relatedProducts = listProducts({ includeDrafts: isPreviewMode })
      .filter((candidate) => candidate.id !== product.id)
      .filter((candidate) => {
        if (candidate.visibility === "LoggedUsers" && !isLoggedIn) {
          return false;
        }
        if (candidate.visibility === "Password" && !isAdminViewer) {
          return false;
        }
        const candidateCategories = Array.from(
          new Set([...candidate.categories, candidate.category].map((value) => value.trim()).filter(Boolean)),
        );
        return candidateCategories.some((name) => normalizedCategories.includes(name));
      })
      .slice(0, 4);

    return (
      <main className="text-slate-900">
        <section className="site-container py-10 md:py-14">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/shop" className="transition hover:text-slate-700">
              Shop
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{product.slug}</span>
          </div>

          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.05fr_1fr] md:p-8">
            <div className="relative">
              {pricing.onSale ? (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">
                  Sale {pricing.discountPercent}%
                </div>
              ) : null}
              <ProductGallery images={gallery} name={product.name} />
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {product.category}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{product.name}</h1>
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm text-slate-600 md:text-base">
                {product.description}
              </p>

              <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  Product ID: <span className="font-semibold text-slate-800">{product.id}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Stock: <span className="font-semibold text-slate-800">{product.stock}</span>
                </p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(pricing.current)}</p>
                {pricing.onSale ? (
                  <p className="text-sm text-slate-500">
                    <span className="line-through">{formatCurrency(pricing.regular)}</span>
                    <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      Save {pricing.discountPercent}%
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  price={pricing.current}
                  image={product.image}
                  className="rounded-xl site-primary-bg px-5 py-3 text-sm font-semibold text-white transition site-primary-bg-hover"
                />
                <BuyNowButton
                  productId={product.id}
                  name={product.name}
                  price={pricing.current}
                  image={product.image}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                />
              </div>
              <div className="mt-5">
                <WhatsAppOrderButton
                  productPath={`/product/${encodeURIComponent(product.slug)}`}
                  className="inline-flex rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#25d366] transition hover:bg-slate-100 sm:px-4 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <ProductReviews productId={product.id} initialReviews={reviews} />

          {relatedProducts.length > 0 ? (
            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Produkte te tjera te rekomanduara</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => {
                  const relatedPricing = getEffectiveProductPricing(relatedProduct);
                  return (
                    <article key={relatedProduct.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <Link href={`/product/${encodeURIComponent(relatedProduct.slug)}`} className="block">
                        <div className="aspect-[4/3] w-full bg-slate-100">
                          {relatedProduct.image ? (
                            <div
                              className="h-full w-full bg-cover bg-center"
                              style={{ backgroundImage: `url('${relatedProduct.image}')` }}
                            />
                          ) : null}
                        </div>
                        <div className="space-y-1 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{relatedProduct.category}</p>
                          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{relatedProduct.name}</h3>
                          <p className="text-base font-bold text-slate-900">{formatCurrency(relatedPricing.current)}</p>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </section>
      </main>
    );
  }

  const byId = getProductById(productHandle, { includeDrafts: isPreviewMode });
  if (byId) {
    redirect(`/product/${byId.slug}`);
  }

  notFound();
}

