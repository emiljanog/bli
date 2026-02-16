"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const heroSlides = [
  {
    badge: "Collection 2026",
    title: "Stili i ri per sezonin e ardhshem",
    description:
      "Zbritje deri ne 40% per artikujt me te kerkuar. Furnizim i limituar per modelet premium.",
    ctaPrimary: "Shop Now",
    ctaSecondary: "Shiko koleksionin",
    gradient: "from-amber-200 via-rose-200 to-fuchsia-300",
  },
  {
    badge: "Tech Essentials",
    title: "Aksesore modern per pune dhe gaming",
    description:
      "Produkte te zgjedhura per performance dhe komoditet, me dergese te shpejte ne gjithe vendin.",
    ctaPrimary: "Bli tani",
    ctaSecondary: "Shiko ofertat",
    gradient: "from-cyan-200 via-sky-200 to-indigo-300",
  },
  {
    badge: "Home Picks",
    title: "Transformo shtepine me detaje smart",
    description:
      "Nga dekor modern te pajisje praktike, gjithcka ne nje homepage te vetme per shop-in tend.",
    ctaPrimary: "Eksploro",
    ctaSecondary: "Produktet e reja",
    gradient: "from-emerald-200 via-teal-200 to-lime-300",
  },
];

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  const goNext = () => setActiveSlide((current) => (current + 1) % heroSlides.length);
  const goPrev = () => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="relative min-h-[36rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:min-h-[32rem]">
      {heroSlides.map((slide, index) => (
        <article
          key={slide.title}
          className={`absolute inset-0 grid gap-6 bg-gradient-to-br p-7 pb-24 transition-opacity duration-700 md:grid-cols-2 md:p-10 md:pb-24 ${
            index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"
          } ${slide.gradient}`}
        >
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-slate-900/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {slide.badge}
            </p>
            <h2 className="max-w-lg text-3xl font-extrabold leading-tight md:text-5xl">{slide.title}</h2>
            <p className="max-w-lg text-sm text-slate-700 md:text-base">{slide.description}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {slide.ctaPrimary}
              </Link>
              <Link
                href="/collections"
                className="rounded-xl border border-slate-900/20 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                {slide.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className="h-full rounded-2xl bg-white/70 p-4 backdrop-blur-sm">
            <div className="relative h-full min-h-56 overflow-hidden rounded-2xl border border-white/70">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />
            </div>
          </div>
        </article>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-6 pb-6 md:px-10">
        <div className="flex gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.badge}
              onClick={() => setActiveSlide(index)}
              type="button"
              className={`pointer-events-auto h-2.5 rounded-full transition-all ${
                index === activeSlide ? "w-8 bg-slate-900" : "w-2.5 bg-slate-400/70"
              }`}
              aria-label={`Shko te slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            type="button"
            className="pointer-events-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Previous
          </button>
          <button
            onClick={goNext}
            type="button"
            className="pointer-events-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
