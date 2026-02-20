import Link from "next/link";
import { getEffectiveProductPricing, getReviewSummary, listProducts } from "@/lib/shop-store";
import { AddToCartButton } from "@/components/add-to-cart-button";

type ShopPageProps = {
  searchParams?: Promise<{ search?: string }>;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = listProducts();
  const params = (await searchParams) ?? {};
  const search = (params.search ?? "").trim();
  const searchLower = search.toLowerCase();
  const filteredProducts = search
    ? products.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.slug.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      })
    : products;

  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Shop</p>
          <h1 className="mt-2 text-4xl font-bold">Produktet tona</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Kjo faqe merr produktet direkt nga paneli admin. Shto produkt te /dashboard/products dhe
            do shfaqet ketu.
          </p>
          <Link
            href="/collections"
            className="mt-5 inline-block rounded-xl site-primary-bg px-5 py-3 text-sm font-semibold text-white transition site-primary-bg-hover"
          >
            Shiko Collections
          </Link>

          {search ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700">
                Results for: <span className="font-semibold text-slate-900">{search}</span>
              </p>
              <Link
                href="/shop"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Clear search
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            (() => {
              const reviewSummary = getReviewSummary(product.id);
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
                  <p className="mt-1 text-xs text-slate-500">Stock: {product.stock}</p>
                  <p className="mt-1 text-xs text-amber-700">
                    {reviewSummary.count > 0
                      ? `${reviewSummary.average}/5 (${reviewSummary.count} reviews)`
                      : "No reviews yet"}
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">{formatCurrency(pricing.current)}</p>
                  {pricing.onSale ? (
                    <p className="text-sm text-slate-500 line-through">{formatCurrency(pricing.regular)}</p>
                  ) : null}
                  <Link
                    href={`/product/${product.slug}`}
                    className="mt-3 inline-block text-sm font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
                  >
                    Shiko detajet
                  </Link>
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={pricing.current}
                    image={product.image}
                    className="mt-4 rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                  />
                </article>
              );
            })()
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No products found for <span className="font-semibold text-slate-900">&quot;{search}&quot;</span>.
          </div>
        ) : null}
      </section>
    </main>
  );
}

