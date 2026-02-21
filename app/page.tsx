import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { HomeHero } from "@/components/home-hero";
import {
  getEffectiveProductPricing,
  getSiteSettings,
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

type CategoryIconId = "tech" | "fashion" | "home" | "sports" | "beauty" | "food" | "book" | "pet" | "generic";

function normalizeCategoryKey(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "product";
}

function resolveCategoryIcon(name: string): CategoryIconId {
  const value = name.toLowerCase();
  if (/(tech|electro|digital|phone|laptop|computer|gadget|audio)/.test(value)) return "tech";
  if (/(fashion|style|clothes|wear|shoe|sneaker|apparel)/.test(value)) return "fashion";
  if (/(home|living|decor|kitchen|furniture|house)/.test(value)) return "home";
  if (/(sport|fitness|gym|outdoor|run|bike)/.test(value)) return "sports";
  if (/(beauty|care|cosmetic|skin|hair|makeup)/.test(value)) return "beauty";
  if (/(food|drink|coffee|tea|snack)/.test(value)) return "food";
  if (/(book|office|school|stationery)/.test(value)) return "book";
  if (/(pet|animal|dog|cat)/.test(value)) return "pet";
  return "generic";
}

function CategoryIcon({ icon }: { icon: CategoryIconId }) {
  if (icon === "tech") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="16" height="10" rx="2" />
        <path d="M8 20h8M10 16v4M14 16v4" />
      </svg>
    );
  }
  if (icon === "fashion") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5l3 2 3-2 2 4-2 2v8H9v-8L7 9z" />
      </svg>
    );
  }
  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
    );
  }
  if (icon === "sports") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="7" />
        <path d="M5 12h14M12 5a10 10 0 0 1 0 14" />
      </svg>
    );
  }
  if (icon === "beauty") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l2.2 4.7L19 10l-4.8 2.3L12 17l-2.2-4.7L5 10l4.8-2.3z" />
      </svg>
    );
  }
  if (icon === "food") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3v8M10 3v8M7 7h3M16 3c-2 1-3 3-3 5v13M13 8h3" />
      </svg>
    );
  }
  if (icon === "book") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5a3 3 0 0 1 3-3h11v18H8a3 3 0 0 0-3 3z" />
      </svg>
    );
  }
  if (icon === "pet") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="14" r="4" />
        <circle cx="7" cy="8" r="1.5" />
        <circle cx="11" cy="6" r="1.5" />
        <circle cx="13" cy="6" r="1.5" />
        <circle cx="17" cy="8" r="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 10h16" />
    </svg>
  );
}

export default function Home() {
  const products = listProducts();
  const dashboardCategories = listProductCategories();
  const siteSettings = getSiteSettings();
  const featuredProducts = products.slice(0, 10);
  const productCountByCategorySlug = new Map<string, number>();

  for (const product of products) {
    const slug = normalizeCategoryKey(product.category);
    productCountByCategorySlug.set(slug, (productCountByCategorySlug.get(slug) ?? 0) + 1);
  }

  const categories = dashboardCategories.slice(0, 8).map((category) => ({
    ...category,
    productCount: productCountByCategorySlug.get(category.slug) ?? 0,
    icon: resolveCategoryIcon(category.name),
    manualIcon: (category.icon ?? "").trim(),
  }));

  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <HomeHero
          slides={siteSettings.homeSlides}
          autoplayMs={siteSettings.sliderAutoplayMs}
          showArrows={siteSettings.sliderShowArrows}
          showDots={siteSettings.sliderShowDots}
        />

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${encodeURIComponent(category.slug)}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    {category.manualIcon ? (
                      <span className="text-base leading-none">{category.manualIcon}</span>
                    ) : (
                      <CategoryIcon icon={category.icon} />
                    )}
                  </span>
                )}
                <p className="text-sm font-semibold text-slate-900">{category.name}</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">{category.productCount} produkte</p>
            </Link>
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
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(pricing.current)}</span>
                      {pricing.onSale ? (
                        <span className="text-sm text-slate-500 line-through">{formatCurrency(pricing.regular)}</span>
                      ) : null}
                    </div>
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

