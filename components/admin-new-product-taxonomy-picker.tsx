"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { PersistentCollapsiblePanel } from "@/components/persistent-collapsible-panel";

export type NewProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
  usageCount?: number;
  description?: string;
  imageUrl?: string;
};

export type NewProductTagOption = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

type AdminNewProductTaxonomyPickerProps = {
  defaultCategories: NewProductCategoryOption[];
  defaultTags: NewProductTagOption[];
  defaultSelectedCategoryNames?: string[];
  defaultSelectedTagNames?: string[];
};

type CategoryDraft = {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  description: string;
  imageUrl: string;
};

type TagDraft = {
  id: string;
  name: string;
  slug: string;
  description: string;
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

function asUnique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function AdminNewProductTaxonomyPicker({
  defaultCategories,
  defaultTags,
  defaultSelectedCategoryNames = [],
  defaultSelectedTagNames = [],
}: AdminNewProductTaxonomyPickerProps) {
  const initialCategories = useMemo<CategoryDraft[]>(() => {
    const seen = new Set<string>();
    const rows: CategoryDraft[] = [];
    for (const item of defaultCategories) {
      const name = item.name.trim();
      if (!name) continue;
      const slug = slugify(item.slug || name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      rows.push({
        id: item.id || `CAT-${slug}`,
        name,
        slug,
        usageCount: Math.max(0, Number(item.usageCount) || 0),
        description: (item.description || "").trim(),
        imageUrl: (item.imageUrl || "").trim(),
      });
    }
    return rows;
  }, [defaultCategories]);

  const initialTags = useMemo<TagDraft[]>(() => {
    const seen = new Set<string>();
    const rows: TagDraft[] = [];
    for (const item of defaultTags) {
      const name = item.name.trim();
      if (!name) continue;
      const slug = slugify(item.slug || name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      rows.push({
        id: item.id || `TAG-${slug}`,
        name,
        slug,
        description: (item.description || "").trim(),
      });
    }
    return rows;
  }, [defaultTags]);

  const [categories, setCategories] = useState<CategoryDraft[]>(initialCategories);
  const [tags, setTags] = useState<TagDraft[]>(initialTags);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentSlug, setNewCategoryParentSlug] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryTab, setCategoryTab] = useState<"most" | "all">("most");
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(() => {
    const wanted = new Set(defaultSelectedCategoryNames.map((value) => slugify(value)));
    return asUnique(initialCategories.filter((item) => wanted.has(item.slug)).map((item) => item.slug));
  });

  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(() => {
    const wanted = new Set(defaultSelectedTagNames.map((value) => slugify(value)));
    return asUnique(initialTags.filter((item) => wanted.has(item.slug)).map((item) => item.slug));
  });

  const selectedCategoryNames = useMemo(() => {
    const bySlug = new Map(categories.map((item) => [item.slug, item.name]));
    return selectedCategorySlugs.map((slug) => bySlug.get(slug) ?? "").filter(Boolean);
  }, [categories, selectedCategorySlugs]);

  const selectedTagNames = useMemo(() => {
    const bySlug = new Map(tags.map((item) => [item.slug, item.name]));
    return selectedTagSlugs.map((slug) => bySlug.get(slug) ?? "").filter(Boolean);
  }, [selectedTagSlugs, tags]);

  const mostUsedCategorySlugs = useMemo(() => {
    return [...categories]
      .sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name))
      .slice(0, 5)
      .map((item) => item.slug);
  }, [categories]);

  const visibleCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    const mostUsedSet = new Set(mostUsedCategorySlugs);
    const source = categoryTab === "most"
      ? categories.filter((item) => mostUsedSet.has(item.slug))
      : categories;
    if (!query) return source;
    return source.filter((item) => {
      const name = item.name.toLowerCase();
      const slug = item.slug.toLowerCase();
      return name.includes(query) || slug.includes(query);
    });
  }, [categories, categorySearch, categoryTab, mostUsedCategorySlugs]);

  function toggleCategorySelect(slug: string) {
    setSelectedCategorySlugs((previous) => {
      if (previous.includes(slug)) return previous.filter((item) => item !== slug);
      return asUnique([...previous, slug]);
    });
  }

  function toggleTagSelect(slug: string) {
    setSelectedTagSlugs((previous) => {
      if (previous.includes(slug)) return previous.filter((item) => item !== slug);
      return asUnique([...previous, slug]);
    });
  }

  function addCategoryInline() {
    const name = newCategoryName.trim();
    if (!name) return;
    const slug = slugify(name);
    const existing = categories.find((item) => item.slug === slug);
    if (existing) {
      setSelectedCategorySlugs((previous) => asUnique([...previous, existing.slug]));
      setNewCategoryName("");
      setNewCategoryParentSlug("");
      setShowCategoryForm(false);
      return;
    }

    const next: CategoryDraft = {
      id: `CAT-${slug}`,
      name,
      slug,
      usageCount: 0,
      description: "",
      imageUrl: "",
    };
    setCategories((previous) => [...previous, next]);
    setSelectedCategorySlugs((previous) => asUnique([...previous, next.slug]));
    setNewCategoryName("");
    setNewCategoryParentSlug("");
    setShowCategoryForm(false);
    setCategoryTab("all");
  }

  function addTagFromInput() {
    const name = newTagName.trim();
    if (!name) return;
    const slug = slugify(name);
    const existing = tags.find((item) => item.slug === slug);
    if (existing) {
      setSelectedTagSlugs((previous) => asUnique([...previous, existing.slug]));
      setNewTagName("");
      return;
    }
    const next: TagDraft = {
      id: `TAG-${slug}`,
      name,
      slug,
      description: "",
    };
    setTags((previous) => [...previous, next]);
    setSelectedTagSlugs((previous) => asUnique([...previous, next.slug]));
    setNewTagName("");
  }

  function handleTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addTagFromInput();
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
            imageDataUrl: "",
            deleted: false,
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
            deleted: false,
          })),
        )}
      />

      <PersistentCollapsiblePanel
        storageKey="admin-new-product-panel-categories"
        title="Product Categories"
        bodyClassName="space-y-3 border-t border-slate-200 px-5 py-4"
      >
        <input
          value={categorySearch}
          onChange={(event) => setCategorySearch(event.target.value)}
          placeholder="Search categories..."
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#2271b1]"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryTab("most")}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              categoryTab === "most"
                ? "site-primary-bg text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Most used
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab("all")}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              categoryTab === "all"
                ? "site-primary-bg text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All categories
          </button>
        </div>

        <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
          {visibleCategories.length === 0 ? (
            <p className="px-2 py-1 text-sm text-slate-500">No categories found.</p>
          ) : (
            visibleCategories.map((item) => (
              <label key={item.slug} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={selectedCategorySlugs.includes(item.slug)}
                  onChange={() => toggleCategorySelect(item.slug)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{item.name}</span>
                <span className="text-[11px] font-semibold text-slate-500">{item.usageCount}</span>
              </label>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCategoryForm((previous) => !previous)}
          className="cursor-pointer text-sm font-semibold text-[#2271b1] underline"
        >
          + Add new category
        </button>

        {showCategoryForm ? (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Category name"
              className="h-10 w-full rounded-md border border-[#2271b1] bg-white px-3 text-sm outline-none"
            />
            <select
              value={newCategoryParentSlug}
              onChange={(event) => setNewCategoryParentSlug(event.target.value)}
              className="h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#2271b1]"
            >
              <option value="">- Parent category -</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCategoryInline}
              className="h-10 cursor-pointer rounded-md border border-[#2271b1] bg-white px-4 text-sm font-semibold text-[#2271b1] transition hover:bg-[#f0f7ff]"
            >
              Add new category
            </button>
          </div>
        ) : null}
      </PersistentCollapsiblePanel>

      <PersistentCollapsiblePanel
        storageKey="admin-new-product-panel-tags"
        title="Product Tags"
        bodyClassName="space-y-3 border-t border-slate-200 px-5 py-4"
      >
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
          {tags.length === 0 ? (
            <p className="px-2 py-1 text-sm text-slate-500">No tags available.</p>
          ) : (
            tags.map((item) => {
              const selected = selectedTagSlugs.includes(item.slug);
              return (
                <div key={item.slug} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleTagSelect(item.slug)}
                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      selected
                        ? "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "border border-[#2271b1] bg-white text-[#2271b1] hover:bg-[#f0f7ff]"
                    }`}
                  >
                    {selected ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <input
          value={newTagName}
          onChange={(event) => setNewTagName(event.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Type tag name and press Enter"
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#2271b1]"
        />
      </PersistentCollapsiblePanel>
    </>
  );
}
