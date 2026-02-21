export default function CollectionsLoading() {
  const collectionCards = Array.from({ length: 3 });

  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-11 w-80 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-[70%] max-w-2xl animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-11 w-36 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {collectionCards.map((_, index) => (
            <article key={`collection-card-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-[82%] animate-pulse rounded bg-slate-200" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

