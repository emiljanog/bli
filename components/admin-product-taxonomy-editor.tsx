"use client";

import { UploadField } from "@/components/upload-field";
import { useMemo, useState } from "react";

export type ProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type ProductTagOption = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type EditableCategory = ProductCategoryOption & {
  deleted?: boolean;
  draft?: boolean;
  imageDataUrl?: string;
};

type EditableTag = ProductTagOption & {
  deleted?: boolean;
  draft?: boolean;
};

type AdminProductTaxonomyEditorProps = {
  defaultCategories: ProductCategoryOption[];
  defaultTags: ProductTagOption[];
  defaultSelectedCategoryNames?: string[];
  defaultSelectedTagNames?: string[];
  mediaItems?: Array<{
    id: string;
    url: string;
    label: string;
    uploadedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
  currentUsername?: string;
};

function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "item";
}

function nextUniqueSlug(baseSlug: string, taken: Set<string>): string {
  let candidate = baseSlug || "item";
  let index = 2;
  while (taken.has(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
  taken.add(candidate);
  return candidate;
}

function asUnique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function AdminProductTaxonomyEditor({
  defaultCategories,
  defaultTags,
  defaultSelectedCategoryNames = [],
  defaultSelectedTagNames = [],
  mediaItems = [],
  currentUsername = "",
}: AdminProductTaxonomyEditorProps) {
  const initialCategories = useMemo<EditableCategory[]>(() => {
    const takenSlugs = new Set<string>();
    return defaultCategories.map((item, index) => {
      const name = item.name.trim() || `Category ${index + 1}`;
      const slug = nextUniqueSlug(slugify(item.slug || name), takenSlugs);
      return {
        id: item.id || `CAT-${slug}`,
        name,
        slug,
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        deleted: false,
        draft: false,
      };
    });
  }, [defaultCategories]);

  const initialTags = useMemo<EditableTag[]>(() => {
    const takenSlugs = new Set<string>();
    return defaultTags.map((item, index) => {
      const name = item.name.trim() || `Tag ${index + 1}`;
      const slug = nextUniqueSlug(slugify(item.slug || name), takenSlugs);
      return {
        id: item.id || `TAG-${slug}`,
        name,
        slug,
        description: item.description || "",
        deleted: false,
        draft: false,
      };
    });
  }, [defaultTags]);

  const [categories, setCategories] = useState<EditableCategory[]>(initialCategories);
  const [tags, setTags] = useState<EditableTag[]>(initialTags);

  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(() => {
    const wanted = new Set(defaultSelectedCategoryNames.map((value) => slugify(value)));
    return asUnique(
      initialCategories
        .filter((item) => wanted.has(item.slug))
        .map((item) => item.slug),
    );
  });

  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(() => {
    const wanted = new Set(defaultSelectedTagNames.map((value) => slugify(value)));
    return asUnique(
      initialTags
        .filter((item) => wanted.has(item.slug))
        .map((item) => item.slug),
    );
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState("");
  const [categoryImageFieldKey, setCategoryImageFieldKey] = useState(0);

  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");

  const selectedCategoryNames = useMemo(() => {
    const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));
    return selectedCategorySlugs
      .map((slug) => categoryBySlug.get(slug))
      .filter((item): item is EditableCategory => item !== undefined)
      .filter((item) => !item.deleted)
      .map((item) => item.name);
  }, [categories, selectedCategorySlugs]);

  const selectedTagNames = useMemo(() => {
    const tagBySlug = new Map(tags.map((item) => [item.slug, item]));
    return selectedTagSlugs
      .map((slug) => tagBySlug.get(slug))
      .filter((item): item is EditableTag => item !== undefined)
      .filter((item) => !item.deleted)
      .map((item) => item.name);
  }, [tags, selectedTagSlugs]);

  const selectableCategorySlugs = useMemo(
    () => categories.filter((item) => !item.deleted).map((item) => item.slug),
    [categories],
  );
  const selectableTagSlugs = useMemo(
    () => tags.filter((item) => !item.deleted).map((item) => item.slug),
    [tags],
  );

  function toggleCategorySelection(slug: string) {
    setSelectedCategorySlugs((previous) => {
      if (previous.includes(slug)) {
        return previous.filter((value) => value !== slug);
      }
      return asUnique([...previous, slug]);
    });
  }

  function toggleTagSelection(slug: string) {
    setSelectedTagSlugs((previous) => {
      if (previous.includes(slug)) {
        return previous.filter((value) => value !== slug);
      }
      return asUnique([...previous, slug]);
    });
  }

  function toggleCategoryDeleted(slug: string) {
    setCategories((previous) =>
      previous.flatMap((item) => {
        if (item.slug !== slug) return [item];
        if (item.draft) return [];
        return [{ ...item, deleted: !item.deleted }];
      }),
    );
    setSelectedCategorySlugs((previous) => previous.filter((value) => value !== slug));
  }

  function toggleTagDeleted(slug: string) {
    setTags((previous) =>
      previous.flatMap((item) => {
        if (item.slug !== slug) return [item];
        if (item.draft) return [];
        return [{ ...item, deleted: !item.deleted }];
      }),
    );
    setSelectedTagSlugs((previous) => previous.filter((value) => value !== slug));
  }

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    const takenSlugs = new Set(categories.map((item) => item.slug));
    const slug = nextUniqueSlug(slugify(newCategorySlug || name), takenSlugs);
    const item: EditableCategory = {
      id: `CAT-${slug}`,
      name,
      slug,
      description: newCategoryDescription.trim(),
      imageUrl: newCategoryImageUrl.trim(),
      imageDataUrl: "",
      deleted: false,
      draft: true,
    };

    setCategories((previous) => [...previous, item]);
    setSelectedCategorySlugs((previous) => asUnique([...previous, slug]));

    setNewCategoryName("");
    setNewCategorySlug("");
    setNewCategoryDescription("");
    setNewCategoryImageUrl("");
    setCategoryImageFieldKey((previous) => previous + 1);
  }

  function handleAddTag() {
    const name = newTagName.trim();
    if (!name) return;

    const takenSlugs = new Set(tags.map((item) => item.slug));
    const slug = nextUniqueSlug(slugify(newTagSlug || name), takenSlugs);
    const item: EditableTag = {
      id: `TAG-${slug}`,
      name,
      slug,
      description: newTagDescription.trim(),
      deleted: false,
      draft: true,
    };

    setTags((previous) => [...previous, item]);
    setSelectedTagSlugs((previous) => asUnique([...previous, slug]));

    setNewTagName("");
    setNewTagSlug("");
    setNewTagDescription("");
  }

  return (
    <>
      <input type="hidden" name="category" value={selectedCategoryNames[0] ?? ""} />
      <input type="hidden" name="tags" value={selectedTagNames.join(", ")} />
      <input type="hidden" name="selectedCategorySlugs" value={JSON.stringify(selectedCategorySlugs)} />
      <input type="hidden" name="selectedTagSlugs" value={JSON.stringify(selectedTagSlugs)} />
      <input
        type="hidden"
        name="categoriesPayload"
        value={JSON.stringify(
          categories.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            imageUrl: item.imageUrl,
            imageDataUrl: item.imageDataUrl ?? "",
            deleted: Boolean(item.deleted),
          })),
        )}
      />
      <input
        type="hidden"
        name="tagsPayload"
        value={JSON.stringify(
          tags.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            deleted: Boolean(item.deleted),
          })),
        )}
      />

      <article className="rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3">
          <p className="text-3xl font-semibold text-slate-900">Product Categories</p>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedCategorySlugs(selectableCategorySlugs)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategorySlugs([])}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
            <span className="text-slate-500">Selected: {selectedCategoryNames.length}</span>
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            {categories.length === 0 ? (
              <p className="px-2 py-1 text-sm text-slate-500">No categories yet.</p>
            ) : (
              categories.map((item) => (
                <div
                  key={item.slug}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                    item.deleted ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategorySlugs.includes(item.slug)}
                    disabled={item.deleted}
                    onChange={() => toggleCategorySelection(item.slug)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {item.imageDataUrl || item.imageUrl ? (
                    <img
                      src={item.imageDataUrl || item.imageUrl}
                      alt={item.name}
                      className="h-8 w-8 rounded-md border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-500">
                      IMG
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{item.name}</span>
                    <span className="block truncate text-[11px] text-slate-500">/{item.slug}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCategoryDeleted(item.slug)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      item.deleted
                        ? "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "border border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200"
                    }`}
                  >
                    {item.deleted ? "Undo" : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add category</p>
            <input
              value={newCategoryName}
              onChange={(event) => {
                setNewCategoryName(event.target.value);
                if (!newCategorySlug.trim()) {
                  setNewCategorySlug(slugify(event.target.value));
                }
              }}
              placeholder="Category name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input
              value={newCategorySlug}
              onChange={(event) => setNewCategorySlug(slugify(event.target.value))}
              placeholder="category-slug"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <textarea
              rows={2}
              value={newCategoryDescription}
              onChange={(event) => setNewCategoryDescription(event.target.value)}
              placeholder="Description"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600">Category image</p>
              <UploadField
                key={categoryImageFieldKey}
                title="Category image"
                mediaItems={mediaItems}
                fileInputName="categoryImageTempFile"
                valueInputName="categoryImageTempUrl"
                triggerLabel="Set category image"
                currentUsername={currentUsername}
                onSelectionChange={(urls) => setNewCategoryImageUrl(urls[0] ?? "")}
              />
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              className="rounded-lg site-primary-bg px-3 py-1.5 text-sm font-semibold text-white transition site-primary-bg-hover"
            >
              Add category
            </button>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3">
          <p className="text-3xl font-semibold text-slate-900">Product Tags</p>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedTagSlugs(selectableTagSlugs)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelectedTagSlugs([])}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
            <span className="text-slate-500">Selected: {selectedTagNames.length}</span>
          </div>

          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            {tags.length === 0 ? (
              <p className="px-2 py-1 text-sm text-slate-500">No tags yet.</p>
            ) : (
              tags.map((item) => (
                <div
                  key={item.slug}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                    item.deleted ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTagSlugs.includes(item.slug)}
                    disabled={item.deleted}
                    onChange={() => toggleTagSelection(item.slug)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{item.name}</span>
                    <span className="block truncate text-[11px] text-slate-500">
                      /{item.slug} {item.description ? `- ${item.description}` : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTagDeleted(item.slug)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                      item.deleted
                        ? "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "border border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200"
                    }`}
                  >
                    {item.deleted ? "Undo" : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add tag</p>
            <input
              value={newTagName}
              onChange={(event) => {
                setNewTagName(event.target.value);
                if (!newTagSlug.trim()) {
                  setNewTagSlug(slugify(event.target.value));
                }
              }}
              placeholder="Tag name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <input
              value={newTagSlug}
              onChange={(event) => setNewTagSlug(slugify(event.target.value))}
              placeholder="tag-slug"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <textarea
              rows={2}
              value={newTagDescription}
              onChange={(event) => setNewTagDescription(event.target.value)}
              placeholder="Description"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-lg site-primary-bg px-3 py-1.5 text-sm font-semibold text-white transition site-primary-bg-hover"
            >
              Add tag
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
