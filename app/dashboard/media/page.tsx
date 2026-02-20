import { AdminShell } from "@/components/admin-shell";
import { AdminMediaManager } from "@/components/admin-media-manager";
import { AdminMediaUploadAccordion } from "@/components/admin-media-upload-accordion";
import { getSiteSettings, listMedia, listProducts } from "@/lib/shop-store";

export default async function AdminMediaPage() {
  const media = listMedia({ includeTrashed: true });
  const products = listProducts({ includeTrashed: true, includeDrafts: true });
  const siteSettings = getSiteSettings();

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
      <AdminMediaUploadAccordion totalMedia={mediaRows.length} maxUploadMb={siteSettings.mediaUploadMaxMb} />

      <AdminMediaManager media={mediaRows} />
    </AdminShell>
  );
}
