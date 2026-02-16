import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminMediaManager } from "@/components/admin-media-manager";
import { listMedia, listProducts } from "@/lib/shop-store";

export default async function AdminMediaPage() {
  const media = listMedia({ includeTrashed: true });
  const products = listProducts({ includeTrashed: true, includeDrafts: true });

  const usageCountByUrl = new Map<string, number>();
  for (const product of products) {
    const urls = [product.image, ...product.gallery].filter(Boolean);
    for (const url of urls) {
      usageCountByUrl.set(url, (usageCountByUrl.get(url) ?? 0) + 1);
    }
  }

  const mediaRows = media.map((item) => ({
    id: item.id,
    url: item.url,
    assignedTo: item.assignedTo,
    assignedToId: item.assignedToId,
    alt: item.alt,
    description: item.description,
    updatedAt: item.updatedAt,
    trashedAt: item.trashedAt,
    usageCount: usageCountByUrl.get(item.url) ?? 0,
  }));

  return (
    <AdminShell title="Media" description="Manage image library, metadata and usage.">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          Total media: <span className="font-semibold text-slate-900">{mediaRows.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/media/new"
            className="rounded-lg bg-[#2ea2cc] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2387aa]"
          >
            Add New Media
          </Link>
        </div>
      </div>

      <AdminMediaManager media={mediaRows} />
    </AdminShell>
  );
}
