import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminPagesTable } from "@/components/admin-pages-table";
import { listPages } from "@/lib/shop-store";

export default function AdminPagesPage() {
  const pages = listPages({ includeDrafts: true, includeTrashed: true }).map((page) => ({
    id: page.id,
    name: page.name,
    slug: page.slug,
    content: page.content,
    updatedAt: page.updatedAt,
    publishStatus: page.publishStatus,
    trashedAt: page.trashedAt,
  }));

  return (
    <AdminShell title="Pages" description="Create and manage website pages.">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-2xl font-semibold">All Pages</p>
          <AdminPagesTable pages={pages} />
        </article>

        <aside className="space-y-4">
          <article className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Add New Page</p>
            <Link
              href="/dashboard/pages/new"
              className="mt-4 inline-block w-full rounded-xl bg-[#2ea2cc] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#2387aa]"
            >
              Add New Page
            </Link>
          </article>

          <article className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-2xl font-semibold">Quick Tips</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Leave URL empty to auto-generate from page name.</p>
              <p>Use short slugs for cleaner links.</p>
              <p>Use menu settings to show page in header.</p>
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
