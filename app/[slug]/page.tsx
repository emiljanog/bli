import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/shop-store";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) {
    return {};
  }

  return {
    title: page.name,
    description: page.content.slice(0, 140) || page.name,
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="text-slate-900">
      <section className="mx-auto w-[90%] max-w-[1440px] py-10 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-bold">{page.name}</h1>
          <p className="mt-2 text-sm text-slate-500">/{page.slug}</p>
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700 md:text-base">
            {page.content || "No content added yet."}
          </div>
        </article>
      </section>
    </main>
  );
}

