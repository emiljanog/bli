import Link from "next/link";
import { getReviewSummary, listProducts } from "@/lib/shop-store";
import { AddToCartButton } from "@/components/add-to-cart-button";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ShopPage() {
  const products = listProducts();

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
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            (() => {
              const reviewSummary = getReviewSummary(product.id);
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
                  <p className="mt-2 text-base font-bold text-slate-900">{formatCurrency(product.price)}</p>
                  <Link
                    href={`/product/${product.slug}`}
                    className="mt-3 inline-block text-sm font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
                  >
                    Shiko detajet
                  </Link>
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    className="mt-4 rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                  />
                </article>
              );
            })()
          ))}
        </div>
      </section>
    </main>
  );
}

