"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { SUPPORT_WHATSAPP_PHONE } from "@/lib/constants";
import { buildWhatsAppGeneralHelpMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

interface HeroProps {
  heroHeadline?: string;
  heroSupportingText?: string;
}

export function Hero({ heroHeadline, heroSupportingText }: HeroProps) {
  const heroSlides = useMemo(
    () => [
      {
        ...HERO_SLIDES[0],
        headline: heroHeadline || HERO_SLIDES[0].headline,
        subhead: heroSupportingText || HERO_SLIDES[0].subhead
      },
      ...HERO_SLIDES.slice(1)
    ],
    [heroHeadline, heroSupportingText]
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const [pauseHero, setPauseHero] = useState(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  function clearFadeTimeout() {
    if (fadeTimeoutRef.current === null) return;
    window.clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = null;
  }

  function transitionToSlide(nextIndex: number) {
    clearFadeTimeout();
    setHeroFading(true);
    fadeTimeoutRef.current = window.setTimeout(() => {
      setActiveSlide((nextIndex + heroSlides.length) % heroSlides.length);
      setHeroFading(false);
      fadeTimeoutRef.current = null;
    }, 260);
  }

  function goToPrevSlide() {
    transitionToSlide(activeSlide - 1);
  }

  function goToNextSlide() {
    transitionToSlide(activeSlide + 1);
  }

  useEffect(() => {
    if (pauseHero || heroSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setHeroFading(true);
      clearFadeTimeout();
      fadeTimeoutRef.current = window.setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        setHeroFading(false);
        fadeTimeoutRef.current = null;
      }, 260);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [pauseHero, heroSlides.length]);

  useEffect(() => {
    return () => {
      clearFadeTimeout();
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const imagePaths = heroSlides.map((slideEntry) => slideEntry.image);
    const seen = new Set<string>();
    const duplicated = new Set<string>();

    imagePaths.forEach((path) => {
      if (seen.has(path)) duplicated.add(path);
      seen.add(path);
    });

    if (duplicated.size > 0) {
      console.warn(`[Hero] Duplicate hero image path(s): ${Array.from(duplicated).join(", ")}`);
    }

    const probes: HTMLImageElement[] = [];
    heroSlides.forEach((slideEntry) => {
      const probe = new window.Image();
      probe.onerror = () => {
        console.warn(`[Hero] Missing hero image asset for slide "${slideEntry.id}": ${slideEntry.image}`);
      };
      probe.src = slideEntry.image;
      probes.push(probe);
    });

    return () => {
      probes.forEach((probe) => {
        probe.onerror = null;
      });
    };
  }, [heroSlides]);

  const slide = heroSlides[activeSlide];

  return (
    <section
      className="group relative h-[85vh] min-h-[500px] w-full overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
      onMouseEnter={() => setPauseHero(true)}
      onMouseLeave={() => setPauseHero(false)}
    >
      {heroSlides.map((s, index) => (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          key={s.id}
        >
          <Image
            alt={`${s.badge} - ${s.headline}`}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="100vw"
            src={s.image}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30" />
        </div>
      ))}

      <div
        className={`relative z-10 flex h-full flex-col items-center justify-center px-4 text-center transition-opacity duration-300 ${
          heroFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
          {slide.badge}
        </p>
        <h1 className="mb-3 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {slide.headline}
        </h1>
        <p className="mb-6 max-w-xl text-sm font-medium text-white/80 sm:text-base md:text-lg">
          {slide.subhead}
        </p>

        <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
          <Link
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl sm:h-12 sm:px-7 sm:text-base"
            href="/shop"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Shop Now - Fast Delivery
          </Link>
          <a
            className="inline-flex h-12 items-center justify-center rounded-md border border-brand-200 bg-brand-50 px-6 text-sm font-semibold text-brand-800 shadow-soft transition hover:bg-brand-100 sm:h-12 sm:px-7 sm:text-base"
            href={buildWhatsAppUrl(buildWhatsAppGeneralHelpMessage("hero"), SUPPORT_WHATSAPP_PHONE)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Ask on WhatsApp
          </a>
        </div>
      </div>

      <button
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 transition duration-300 hover:scale-110 hover:bg-white/20 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-5"
        onClick={goToPrevSlide}
        type="button"
      >
        <ChevronLeft className="h-7 w-7 stroke-[2.5]" />
      </button>

      <button
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 transition duration-300 hover:scale-110 hover:bg-white/20 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-5"
        onClick={goToNextSlide}
        type="button"
      >
        <ChevronRight className="h-7 w-7 stroke-[2.5]" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6">
        <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
          {heroSlides.map((s, index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              className={`h-2 rounded-full transition ${
                index === activeSlide
                  ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              key={s.id}
              onClick={() => transitionToSlide(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
