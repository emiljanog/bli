"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { HomeSliderItem, HomeSliderPreset } from "@/lib/shop-store";

type HomeHeroProps = {
  slides: HomeSliderItem[];
  autoplayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
};

const presetClassByName: Record<HomeSliderPreset, string> = {
  sunset: "from-amber-200 via-rose-200 to-fuchsia-300",
  ocean: "from-cyan-200 via-sky-200 to-indigo-300",
  forest: "from-emerald-200 via-teal-200 to-lime-300",
  violet: "from-violet-200 via-fuchsia-200 to-rose-300",
  sunrise: "from-orange-200 via-amber-200 to-yellow-300",
};

const fallbackSlides: HomeSliderItem[] = [
  {
    id: "fallback-1",
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
    id: "fallback-2",
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
    id: "fallback-3",
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

export function HomeHero({ slides, autoplayMs = 4500, showArrows = true, showDots = true }: HomeHeroProps) {
  const resolvedSlides = useMemo(() => (slides.length > 0 ? slides : fallbackSlides), [slides]);
  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = activeSlide >= resolvedSlides.length ? 0 : activeSlide;

  useEffect(() => {
    if (resolvedSlides.length <= 1) return undefined;
    const delay = Math.max(1500, Math.floor(autoplayMs || 4500));
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % resolvedSlides.length);
    }, delay);
    return () => clearInterval(intervalId);
  }, [autoplayMs, resolvedSlides.length]);

  const goNext = () => setActiveSlide((current) => (current + 1) % resolvedSlides.length);
  const goPrev = () => setActiveSlide((current) => (current - 1 + resolvedSlides.length) % resolvedSlides.length);

  return (
    <div
      id="home-slider"
      className="relative min-h-[36rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:min-h-[32rem]"
    >
      {resolvedSlides.map((slide, index) => (
        <article
          key={slide.id || slide.title}
          className={`absolute inset-0 grid gap-6 bg-gradient-to-br p-7 transition-opacity duration-700 md:grid-cols-2 md:p-10 ${
            index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
          } ${presetClassByName[slide.gradientPreset] ?? presetClassByName.sunset}`}
        >
          <div className="space-y-4">
            {slide.badge ? (
              <p className="inline-flex rounded-full border border-slate-900/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {slide.badge}
              </p>
            ) : null}
            <h2 className="max-w-lg text-3xl font-extrabold leading-tight md:text-5xl">{slide.title}</h2>
            <p className="max-w-lg text-sm text-slate-700 md:text-base">{slide.description}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={slide.ctaPrimaryHref || "/shop"}
                className="rounded-xl site-primary-bg px-5 py-3 text-sm font-semibold text-white transition site-primary-bg-hover"
              >
                {slide.ctaPrimary || "Shop Now"}
              </Link>
              <Link
                href={slide.ctaSecondaryHref || "/collections"}
                className="rounded-xl border border-slate-900/20 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                {slide.ctaSecondary || "Shiko koleksionin"}
              </Link>
            </div>
          </div>

          <div className="h-full rounded-2xl bg-white/70 p-4 backdrop-blur-sm">
            <div className="relative h-full min-h-56 overflow-hidden rounded-2xl border border-white/70">
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${slide.imageUrl}')` }} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
            {showDots ? (
              <div className="flex gap-2">
                {resolvedSlides.map((dotSlide, dotIndex) => (
                  <button
                    key={`${dotSlide.id}-dot`}
                    onClick={() => setActiveSlide(dotIndex)}
                    type="button"
                    className={`h-2.5 cursor-pointer rounded-full transition-all ${
                      dotIndex === currentSlide ? "site-primary-bg w-8" : "w-2.5 bg-slate-400/70"
                    }`}
                    aria-label={`Shko te slide ${dotIndex + 1}`}
                  />
                ))}
              </div>
            ) : (
              <div />
            )}

            {showArrows ? (
              <div className="flex gap-2">
                <button
                  onClick={goPrev}
                  type="button"
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Previous
                </button>
                <button
                  onClick={goNext}
                  type="button"
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
