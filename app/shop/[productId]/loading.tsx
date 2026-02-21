export default function ShopCategoryLoading() {
  const productSkeletons = Array.from({ length: 6 });

  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 flex items-center gap-3">
            <div className="route-loading-shimmer h-12 w-12 overflow-hidden rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-9 w-60 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productSkeletons.map((_, index) => (
            <article key={`shop-category-card-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="route-loading-shimmer h-44 w-full overflow-hidden rounded-xl bg-slate-200" />
              <div className="mt-4 h-3.5 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-6 w-[82%] animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3.5 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3.5 w-36 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-6 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-200" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

