export default function ContactLoading() {
  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-11 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-[85%] animate-pulse rounded bg-slate-200" />
            <div className="mt-5 space-y-2">
              <div className="h-4 w-60 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 space-y-4">
              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-32 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="mt-5 h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
          </article>
        </div>
      </section>
    </main>
  );
}

