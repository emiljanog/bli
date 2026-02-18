import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { getProductById, getProductBySlug, listReviews } from "@/lib/shop-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId: productHandle } = await params;
  const bySlug = getProductBySlug(productHandle);

  if (bySlug) {
    const gallery = bySlug.gallery.length > 0 ? bySlug.gallery : [bySlug.image];
    const reviews = listReviews({ productId: bySlug.id, status: "Approved" });

    return (
      <main className="text-slate-900">
        <section className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] py-10 md:py-14">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/shop" className="transition hover:text-slate-700">
              Shop
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">{bySlug.slug}</span>
          </div>

          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.05fr_1fr] md:p-8">
            <ProductGallery images={gallery} name={bySlug.name} />

            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {bySlug.category}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{bySlug.name}</h1>
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm text-slate-600 md:text-base">
                {bySlug.description || "Produkt i sinkronizuar nga paneli admin."}
              </p>

              <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  Product ID: <span className="font-semibold text-slate-800">{bySlug.id}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Stock: <span className="font-semibold text-slate-800">{bySlug.stock}</span>
                </p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(bySlug.price)}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AddToCartButton
                  productId={bySlug.id}
                  name={bySlug.name}
                  price={bySlug.price}
                  image={bySlug.image}
                  className="rounded-xl site-primary-bg px-5 py-3 text-sm font-semibold text-white transition site-primary-bg-hover"
                />
                <Link
                  href="/shop"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Kthehu te Shop
                </Link>
              </div>
            </div>
          </div>

          <ProductReviews productId={bySlug.id} initialReviews={reviews} />
        </section>
      </main>
    );
  }

  const byId = getProductById(productHandle);
  if (byId) {
    redirect(`/shop/${byId.slug}`);
  }

  notFound();
}

