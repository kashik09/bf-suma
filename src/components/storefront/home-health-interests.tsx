"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { StorefrontCategory } from "@/types";

const categoryBenefitBySlug: Record<string, string> = {
  supplements: "Daily wellness essentials",
  beverages: "Natural energy and focus support",
  "womens-health": "Balanced support for women",
  "mens-health": "Strength and vitality support",
  "brain-health": "Support clarity and memory",
  skincare: "Healthy skin support essentials",
  "anti-aging": "Healthy aging support",
  "joint-health": "Comfort and mobility support",
  "bone-health": "Bone and joint support",
  "digestive-health": "Gentle digestive support",
  detox: "Everyday detox support"
};

function resolveCategoryBenefit(category: StorefrontCategory) {
  const mapped = categoryBenefitBySlug[category.slug];
  if (mapped) return mapped;
  return "Targeted wellness support";
}

export function HomeHealthInterests({ categories }: { categories: StorefrontCategory[] }) {
  const items = categories.slice(0, 8);
  const slides = [{ kind: "all" as const }, ...items.map((category) => ({ kind: "category" as const, category }))];
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);

  useEffect(() => {
    function syncSlidesPerView() {
      if (window.innerWidth >= 1280) {
        setSlidesPerView(3);
        return;
      }

      if (window.innerWidth >= 640) {
        setSlidesPerView(2);
        return;
      }

      setSlidesPerView(1);
    }

    syncSlidesPerView();
    window.addEventListener("resize", syncSlidesPerView);
    return () => window.removeEventListener("resize", syncSlidesPerView);
  }, []);

  const maxIndex = Math.max(0, slides.length - slidesPerView);
  const canSlide = maxIndex > 0;

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [canSlide, maxIndex]);

  function goNext() {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }

  function goPrev() {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Choose Your Wellness Focus"
        description="Start with one category, compare only relevant options, and get to checkout faster with less friction."
        action={(
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/shop">
            View all categories
          </Link>
        )}
      />

      <div className="space-y-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 p-3 shadow-soft sm:p-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-slate-700">Browse by category</p>
          {canSlide ? (
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous category"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                onClick={goPrev}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next category"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                onClick={goNext}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${(activeIndex * 100) / slidesPerView}%)` }}
          >
            {slides.map((slide) => (
              <div className="h-full w-full shrink-0 px-1 sm:w-1/2 xl:w-1/3" key={slide.kind === "all" ? "all" : slide.category.id}>
                {slide.kind === "all" ? (
                  <Link
                    className="group relative isolate block h-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-sky-700 p-5 shadow-soft"
                    href="/shop"
                  >
                    <div className="relative z-10 flex h-full min-h-64 flex-col justify-between">
                      <div>
                        <p className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                          Start here
                        </p>
                        <h3 className="mt-3 text-xl font-bold leading-tight text-white">Not sure what to choose?</h3>
                        <p className="mt-2 text-sm text-white/85">
                          Browse all categories first, then narrow by availability and price in the shop view.
                        </p>
                      </div>
                      <span className="mt-4 inline-flex h-10 w-fit items-center justify-center gap-1 rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-soft">
                        Browse all
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />
                  </Link>
                ) : (
                  <Link
                    className="group relative isolate block h-full min-h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-soft ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-card hover:ring-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    href={`/category/${slide.category.slug}`}
                  >
                    <div
                      className="h-full min-h-64 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${slide.category.image_url || "/catalog-images/placeholder.webp"})`
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-900/55 to-slate-900/10" />

                    <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end p-4 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-100/90">Focus area</p>
                      <h3 className="text-lg font-semibold leading-tight text-white">{slide.category.name}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-100/90">
                        {resolveCategoryBenefit(slide.category)}
                      </p>

                      <span className="mt-3 inline-flex h-10 w-fit items-center justify-center gap-1 rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-soft transition group-hover:bg-brand-50">
                        Explore Category
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {canSlide ? (
          <div className="flex items-center justify-center gap-2 pt-1">
            {Array.from({ length: maxIndex + 1 }).map((_, pageIndex) => (
              <button
                aria-label={`Go to slide ${pageIndex + 1}`}
                className={`h-2.5 rounded-full transition ${
                  activeIndex === pageIndex ? "w-6 bg-brand-700" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                key={pageIndex}
                onClick={() => setActiveIndex(pageIndex)}
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
