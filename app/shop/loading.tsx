export default function ShopLoading() {
  const productSkeletons = Array.from({ length: 9 });

  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-11 w-72 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-[72%] max-w-2xl animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-11 w-44 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productSkeletons.map((_, index) => (
            <article key={`shop-card-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

