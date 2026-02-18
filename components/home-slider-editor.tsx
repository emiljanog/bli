"use client";

import { useMemo, useState } from "react";
import type { HomeSliderItem, HomeSliderPreset } from "@/lib/shop-store";

type HomeSliderEditorProps = {
  initialSlides?: HomeSliderItem[];
};

const PRESET_OPTIONS: Array<{ value: HomeSliderPreset; label: string }> = [
  { value: "sunset", label: "Sunset" },
  { value: "ocean", label: "Ocean" },
  { value: "forest", label: "Forest" },
  { value: "violet", label: "Violet" },
  { value: "sunrise", label: "Sunrise" },
];

function createSlide(): HomeSliderItem {
  const id = `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    badge: "New Slide",
    title: "Slide title",
    description: "Shkruaj pershkrimin e slider-it.",
    ctaPrimary: "Shop Now",
    ctaPrimaryHref: "/shop",
    ctaSecondary: "Collections",
    ctaSecondaryHref: "/collections",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    gradientPreset: "sunset",
  };
}

const defaultEditorSlides: HomeSliderItem[] = [
  {
    id: "slide-1",
    badge: "Collection 2026",
    title: "Stili i ri per sezonin e ardhshem",
    description: "Zbritje deri ne 40% per artikujt me te kerkuar. Furnizim i limituar per modelet premium.",
    ctaPrimary: "Shop Now",
    ctaPrimaryHref: "/shop",
    ctaSecondary: "Shiko koleksionin",
    ctaSecondaryHref: "/collections",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    gradientPreset: "sunset",
  },
  {
    id: "slide-2",
    badge: "Tech Essentials",
    title: "Aksesore modern per pune dhe gaming",
    description: "Produkte te zgjedhura per performance dhe komoditet, me dergese te shpejte ne gjithe vendin.",
    ctaPrimary: "Bli tani",
    ctaPrimaryHref: "/shop",
    ctaSecondary: "Shiko ofertat",
    ctaSecondaryHref: "/collections",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    gradientPreset: "ocean",
  },
  {
    id: "slide-3",
    badge: "Home Picks",
    title: "Transformo shtepine me detaje smart",
    description: "Nga dekor modern te pajisje praktike, gjithcka ne nje homepage te vetme per shop-in tend.",
    ctaPrimary: "Eksploro",
    ctaPrimaryHref: "/shop",
    ctaSecondary: "Produktet e reja",
    ctaSecondaryHref: "/collections",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    gradientPreset: "forest",
  },
];

export function HomeSliderEditor({ initialSlides }: HomeSliderEditorProps) {
  const [slides, setSlides] = useState<HomeSliderItem[]>(() =>
    Array.isArray(initialSlides) && initialSlides.length > 0 ? initialSlides : defaultEditorSlides,
  );
  const payload = useMemo(() => JSON.stringify(slides), [slides]);

  function updateSlide(index: number, patch: Partial<HomeSliderItem>) {
    setSlides((previous) =>
      previous.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function addSlide() {
    setSlides((previous) => (previous.length >= 12 ? previous : [...previous, createSlide()]));
  }

  function removeSlide(index: number) {
    setSlides((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveSlide(index: number, direction: "up" | "down") {
    setSlides((previous) => {
      const next = [...previous];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return previous;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="slidesPayload" value={payload} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addSlide}
          className="rounded-lg site-primary-bg px-3 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
        >
          Add Slide
        </button>
        <p className="text-xs text-slate-500">Maximum 12 slides.</p>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <article key={slide.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Slide {index + 1}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSlide(index, "up")}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(index, "down")}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="space-y-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Badge</span>
                  <input
                    type="text"
                    value={slide.badge}
                    onChange={(event) => updateSlide(index, { badge: event.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Title</span>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(event) => updateSlide(index, { title: event.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</span>
                  <textarea
                    rows={4}
                    value={slide.description}
                    onChange={(event) => updateSlide(index, { description: event.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary Button</span>
                    <input
                      type="text"
                      value={slide.ctaPrimary}
                      onChange={(event) => updateSlide(index, { ctaPrimary: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary Link</span>
                    <input
                      type="text"
                      value={slide.ctaPrimaryHref}
                      onChange={(event) => updateSlide(index, { ctaPrimaryHref: event.target.value })}
                      placeholder="/shop"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secondary Button</span>
                    <input
                      type="text"
                      value={slide.ctaSecondary}
                      onChange={(event) => updateSlide(index, { ctaSecondary: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secondary Link</span>
                    <input
                      type="text"
                      value={slide.ctaSecondaryHref}
                      onChange={(event) => updateSlide(index, { ctaSecondaryHref: event.target.value })}
                      placeholder="/collections"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image URL</span>
                  <input
                    type="text"
                    value={slide.imageUrl}
                    onChange={(event) => updateSlide(index, { imageUrl: event.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gradient Preset</span>
                  <select
                    value={slide.gradientPreset}
                    onChange={(event) => updateSlide(index, { gradientPreset: event.target.value as HomeSliderPreset })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  >
                    {PRESET_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img src={slide.imageUrl} alt={`Slide ${index + 1} preview`} className="h-40 w-full object-cover" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
