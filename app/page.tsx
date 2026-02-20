import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { HomeHero } from "@/components/home-hero";
import { getEffectiveProductPricing, getReviewSummary, getSiteSettings, listProducts } from "@/lib/shop-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Home() {
  const products = listProducts();
  const siteSettings = getSiteSettings();
  const featuredProducts = products.slice(0, 10);
  const categoryMap = new Map<string, number>();

  for (const product of products) {
    categoryMap.set(product.category, (categoryMap.get(product.category) ?? 0) + 1);
  }

  const categories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] py-10 md:py-14">
        <HomeHero
          slides={siteSettings.homeSlides}
          autoplayMs={siteSettings.sliderAutoplayMs}
          showArrows={siteSettings.sliderShowArrows}
          showDots={siteSettings.sliderShowDots}
        />

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(([categoryName, count]) => (
            <article key={categoryName} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{categoryName}</p>
              <p className="mt-1 text-sm text-slate-600">{count} produkte</p>
            </article>
          ))}
        </section>

        <section id="products" className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Featured from Admin</p>
              <h3 className="text-2xl font-bold">{products.length} Produkte aktive</h3>
            </div>
            <Link
              href="/shop"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Shiko te gjitha
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featuredProducts.map((product) => (
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
                      className="mb-4 block h-36 rounded-xl bg-slate-100 bg-cover bg-center"
                      style={{ backgroundImage: `url('${product.image}')` }}
                      aria-label={`Shiko produktin ${product.name}`}
                    />
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{product.category}</p>
                    <h4 className="mt-1 text-base font-semibold">
                      <Link href={`/product/${product.slug}`} className="transition hover:text-slate-600">
                        {product.name}
                      </Link>
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">Stock: {product.stock}</p>
                    <p className="mt-1 text-xs text-amber-700">
                      {reviewSummary.count > 0
                        ? `${reviewSummary.average}/5 (${reviewSummary.count} reviews)`
                        : "No reviews yet"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(pricing.current)}</span>
                      {pricing.onSale ? (
                        <span className="text-sm text-slate-500 line-through">{formatCurrency(pricing.regular)}</span>
                      ) : null}
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-2 inline-block text-sm font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
                    >
                      Shiko detajet
                    </Link>
                    <AddToCartButton
                      productId={product.id}
                      name={product.name}
                      price={pricing.current}
                      image={product.image}
                      className="mt-4 w-full rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                    />
                  </article>
                );
              })()
            ))}
          </div>
          {products.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Nuk ka produkte ende. Shto nje produkt te <span className="font-semibold">/dashboard/products</span>.
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

