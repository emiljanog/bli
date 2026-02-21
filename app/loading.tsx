export default function Loading() {
  const categorySkeletons = Array.from({ length: 8 });
  const productSkeletons = Array.from({ length: 10 });

  return (
    <main className="text-slate-900">
      <section className="site-container py-8 md:py-12">
        <div className="route-loading-shimmer mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-200/90" />

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="space-y-3">
              <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
              <div className="h-11 w-[92%] animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-[85%] animate-pulse rounded bg-slate-200" />
              <div className="pt-2 flex gap-3">
                <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
            <div className="route-loading-shimmer h-56 w-full overflow-hidden rounded-2xl bg-slate-200 md:h-72" />
          </div>
        </article>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorySkeletons.map((_, index) => (
            <article key={`category-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="route-loading-shimmer h-9 w-9 overflow-hidden rounded-lg bg-slate-200" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mt-3 h-3.5 w-24 animate-pulse rounded bg-slate-200" />
            </article>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-56 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {productSkeletons.map((_, index) => (
              <article key={`product-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="route-loading-shimmer h-36 w-full overflow-hidden rounded-xl bg-slate-200" />
                <div className="mt-3 h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-5 w-[82%] animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3.5 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-6 w-20 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-200" />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
