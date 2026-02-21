import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  getEffectiveProductPricing,
  getProductById,
  getProductBySlug,
  listProductCategories,
  listProducts,
} from "@/lib/shop-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "item";
}

type ShopDynamicPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ShopDynamicPage({ params }: ShopDynamicPageProps) {
  const { productId: handle } = await params;
  const normalizedHandle = slugify(handle);
  const categories = listProductCategories();
  const activeCategory = categories.find((item) => slugify(item.slug || item.name) === normalizedHandle) ?? null;

  if (activeCategory) {
    const products = listProducts().filter((product) => {
      if (slugify(product.category) === normalizedHandle) return true;
      return product.categories.some((categoryName) => slugify(categoryName) === normalizedHandle);
    });

    return (
      <main className="text-slate-900">
        <section className="site-container py-10 md:py-14">
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/shop" className="transition hover:text-slate-700">
                Shop
              </Link>
              <span>/</span>
              <span className="font-medium text-slate-700">{activeCategory.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {activeCategory.imageUrl ? (
                <img
                  src={activeCategory.imageUrl}
                  alt={activeCategory.name}
                  width={52}
                  height={52}
                  className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl">
                  {(activeCategory.icon ?? "").trim() || "🏷️"}
                </span>
              )}
              <div>
                <h1 className="text-3xl font-bold md:text-4xl">{activeCategory.name}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {products.length} produkte ne kete kategori
                </p>
              </div>
            </div>
            {activeCategory.description ? (
              <p className="mt-4 max-w-2xl text-sm text-slate-600 md:text-base">{activeCategory.description}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const pricing = getEffectiveProductPricing(product);
              return (
                <article
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="mb-4 block h-44 rounded-xl bg-slate-100 bg-cover bg-center"
                    style={{ backgroundImage: `url('${product.image}')` }}
                    aria-label={`Shiko produktin ${product.name}`}
                  />
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {product.category}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    <Link href={`/product/${product.slug}`} className="transition hover:text-slate-600">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-base font-bold text-slate-900">{formatCurrency(pricing.current)}</p>
                  {pricing.onSale ? (
                    <p className="text-sm text-slate-500 line-through">{formatCurrency(pricing.regular)}</p>
                  ) : null}
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={pricing.current}
                    image={product.image}
                    className="mt-4 rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                  />
                </article>
              );
            })}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Nuk ka produkte ne kete kategori ende.
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  const bySlug = getProductBySlug(handle);
  if (bySlug) {
    redirect(`/product/${bySlug.slug}`);
  }

  const byId = getProductById(handle);
  if (byId) {
    redirect(`/product/${byId.slug}`);
  }

  notFound();
}
