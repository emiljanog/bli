export default function ContactPage() {
  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Contact</p>
            <h1 className="mt-2 text-4xl font-bold">Na kontakto</h1>
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              Per pyetje rreth porosive, dergesave ose bashkepunimeve, na shkruaj dhe ekipi yne do
              te pergjigjet sa me shpejt.
            </p>
            <div className="mt-5 space-y-1 text-sm text-slate-700">
              <p>Email: support@bli.al</p>
              <p>Phone: +355 69 334 2213</p>
              <p>Address: Tirane, Albania</p>
            </div>
          </div>

          <form className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Dergo mesazh</h2>
            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Emri"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              />
              <textarea
                placeholder="Mesazhi"
                rows={5}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              />
            </div>
            <button
              type="button"
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Dergo
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

