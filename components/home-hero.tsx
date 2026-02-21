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
  const nextSlide = resolvedSlides.length > 0 ? (currentSlide + 1) % resolvedSlides.length : 0;

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
      className="relative h-[44rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:h-[46rem] md:h-[38rem] lg:h-[34rem]"
    >
      {resolvedSlides.map((slide, index) => (
        <article
          key={slide.id || slide.title}
          className={`absolute inset-0 grid gap-6 bg-gradient-to-br p-7 pb-24 transition-opacity duration-700 md:grid-cols-2 md:p-10 md:pb-8 ${
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

          <div className="rounded-2xl bg-white/70 p-4 backdrop-blur-sm">
            <div className="relative h-full min-h-44 overflow-hidden rounded-2xl border border-white/70 md:min-h-[19rem]">
              {index === 0 || index === currentSlide || index === nextSlide ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title || `Slide ${index + 1}`}
                  width={1200}
                  height={900}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="(min-width: 1024px) 40vw, (min-width: 768px) 45vw, 100vw"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-200/60" aria-hidden />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 px-7 pb-6 md:relative md:inset-auto md:col-span-2 md:mt-auto md:px-0 md:pb-0">
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
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 md:px-3 md:py-2 md:text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={goNext}
                  type="button"
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 md:px-3 md:py-2 md:text-sm"
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
