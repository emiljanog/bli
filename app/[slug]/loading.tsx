export default function PublicContentPageLoading() {
  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-11 w-80 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-[95%] animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-[90%] animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-[88%] animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-[76%] animate-pulse rounded bg-slate-200" />
          </div>
        </article>
      </section>
    </main>
  );
}

