import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  AdminNewProductTaxonomyPicker,
  type NewProductCategoryOption,
  type NewProductTagOption,
} from "@/components/admin-new-product-taxonomy-picker";
import {
  trashProductAction,
  updateProductAction,
} from "@/app/dashboard/actions";
import { AdminNewProductPublishPanel } from "@/components/admin-new-product-publish-panel";
import { AdminProductDataEditor } from "@/components/admin-product-data-editor";
import { AdminProductDescriptionEditor } from "@/components/admin-product-description-editor";
import { AdminShell } from "@/components/admin-shell";
import { PersistentCollapsiblePanel } from "@/components/persistent-collapsible-panel";
import { UploadField } from "@/components/upload-field";
import { getAdminUsernameFromCookieStore } from "@/lib/admin-auth";
import { getProductById, getSiteSettings, listMedia, listProductCategories, listProductTags, listProducts } from "@/lib/shop-store";

type AdminProductEditPageProps = {
  params: Promise<{ productId: string }>;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const cookieStore = await cookies();
  const currentUsername = getAdminUsernameFromCookieStore(cookieStore);
  const maxUploadMb = getSiteSettings().mediaUploadMaxMb;
  const { productId } = await params;
  const product = getProductById(productId, { includeTrashed: true, includeDrafts: true });

  if (!product) {
    notFound();
  }

  const mediaItems = listMedia().map((item) => ({
    id: item.id,
    url: item.url,
    label: item.alt || item.url,
    uploadedBy: item.uploadedBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
  const usageCountByCategorySlug = new Map<string, number>();
  const products = listProducts({ includeTrashed: true, includeDrafts: true });
  for (const currentProduct of products) {
    for (const categoryName of currentProduct.categories) {
      const slug = slugify(categoryName);
      if (!slug) continue;
      usageCountByCategorySlug.set(slug, (usageCountByCategorySlug.get(slug) ?? 0) + 1);
    }
  }

  const categoryOptions: NewProductCategoryOption[] = listProductCategories().map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    usageCount: usageCountByCategorySlug.get(slugify(item.slug || item.name)) ?? 0,
    description: item.description,
    imageUrl: item.imageUrl,
  }));
  const tagOptions: NewProductTagOption[] = listProductTags().map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
  }));

  return (
    <AdminShell title={`Edit product: ${product.name}`} description="Manage product content, taxonomy and media.">
      <>
        <form
          id="edit-product-form"
          action={updateProductAction}
          className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"
        >
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="redirectTo" value={`/dashboard/products/${product.id}`} />

        <section className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-[#ececed] p-4">
            <input
              name="name"
              type="text"
              defaultValue={product.name}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-[25px] leading-tight text-slate-800 outline-none focus:border-[#2271b1]"
              required
            />

            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_260px]">
              <div className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600">
                Permalink: /product/{product.slug}
              </div>
              <input
                name="slug"
                type="text"
                defaultValue={product.slug}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#2271b1]"
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-[#ececed] p-4">
            <div className="rounded-xl border border-slate-300 bg-white">
              <div className="border-b border-slate-200 px-4 py-2">
                <p className="text-base font-semibold text-slate-800">Product description</p>
              </div>
              <div className="p-3">
                <AdminProductDescriptionEditor
                  name="description"
                  defaultValue={product.description}
                  placeholder="Shkruaj pershkrimin..."
                />
              </div>
            </div>
          </article>

          <AdminProductDataEditor
            defaultPrice={product.price}
            defaultSalePrice={product.salePrice}
            defaultSaleScheduleStartAt={product.saleScheduleStartAt}
            defaultSaleScheduleEndAt={product.saleScheduleEndAt}
            defaultStock={product.stock}
          />
        </section>

        <aside className="space-y-4">
          <PersistentCollapsiblePanel storageKey="admin-edit-product-panel-publish" title="Publish">
            <div>
              <AdminNewProductPublishPanel
                formId="edit-product-form"
                initialReservedId={product.id}
                initialProductId={product.id}
                initialSlug={product.slug}
                initialStatus={product.publishStatus}
                initialVisibility={product.visibility}
                initialVisibilityPassword={product.visibilityPassword}
                canMoveToTrash={!product.trashedAt}
                trashFormId="trash-product-form"
                embedded
              />
            </div>
          </PersistentCollapsiblePanel>

          <PersistentCollapsiblePanel
            storageKey="admin-edit-product-panel-image"
            title="Product image"
            bodyClassName="border-t border-slate-200 px-5 py-4"
          >
            <div>
              <UploadField
                title="Set product image"
                mediaItems={mediaItems}
                fileInputName="imageFile"
                valueInputName="image"
                defaultValue={product.image}
                triggerLabel="Set product image"
                dropzone
                maxUploadMb={maxUploadMb}
                currentUsername={currentUsername}
                emptyActionLabel="Add Image"
                filledActionLabel="Change photo"
              />
            </div>
          </PersistentCollapsiblePanel>

          <PersistentCollapsiblePanel
            storageKey="admin-edit-product-panel-gallery"
            title="Product gallery"
            bodyClassName="border-t border-slate-200 px-5 py-4"
          >
            <div>
              <UploadField
                title="Add product gallery images"
                mediaItems={mediaItems}
                fileInputName="galleryFiles"
                valueInputName="gallery"
                defaultValues={product.gallery}
                triggerLabel="Add product gallery images"
                dropzone
                maxUploadMb={maxUploadMb}
                multiple
                currentUsername={currentUsername}
                emptyActionLabel="Add Photo"
                filledActionLabel="Add more"
              />
            </div>
          </PersistentCollapsiblePanel>

          <AdminNewProductTaxonomyPicker
            defaultCategories={categoryOptions}
            defaultTags={tagOptions}
            defaultSelectedCategoryNames={product.categories}
            defaultSelectedTagNames={product.tags}
          />
        </aside>
        </form>

        <form id="trash-product-form" action={trashProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="redirectTo" value="/dashboard/products" />
        </form>
      </>
    </AdminShell>
  );
}
