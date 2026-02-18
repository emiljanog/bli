import Link from "next/link";

const collections = [
  {
    name: "Summer Drop",
    description: "Veshje dhe aksesore te lehte per sezonin e veres.",
  },
  {
    name: "Smart Living",
    description: "Pajisje praktike dhe dekor modern per shtepine.",
  },
  {
    name: "Urban Tech",
    description: "Produkte elektronike per pune, levizje dhe performance.",
  },
];

export default function CollectionsPage() {
  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] py-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Collections</p>
          <h1 className="mt-2 text-4xl font-bold">Koleksionet kryesore</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Koleksione te kuruara per stil, teknologji dhe shtepi. Kliko te shop per te pare
            produktet e plota.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Shko te Shop
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{collection.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{collection.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

