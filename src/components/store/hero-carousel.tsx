"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description?: string;
  href: string;
}

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  const active = slides[index];

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden bg-surface-2"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions en cours"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") goTo(index - 1);
        if (event.key === "ArrowRight") goTo(index + 1);
      }}
    >
      {slides.map((slide, slideIndex) => (
        <Link
          key={slide.id}
          href={slide.href}
          aria-hidden={slideIndex !== index}
          tabIndex={slideIndex === index ? 0 : -1}
          aria-label={slide.title}
          className={cn(
            "absolute inset-0 block transition-opacity duration-700 ease-out",
            slideIndex === index
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={slideIndex === 0}
            sizes="(max-width: 1024px) 90vw, 38vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-6 pb-8 sm:p-8">
            {slide.description && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {slide.description}
              </p>
            )}
            <p className="mt-2 max-w-[22ch] font-display text-2xl leading-tight text-white sm:text-3xl">
              {slide.title}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
              En profiter
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Promotion précédente"
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Promotion suivante"
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Afficher la promotion ${slideIndex + 1} sur ${count}`}
                aria-current={slideIndex === index}
                className={cn(
                  "h-2.5 w-2.5 rounded-full border border-white/70 transition-all",
                  slideIndex === index
                    ? "scale-125 bg-accent"
                    : "bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {active.title}
      </p>
    </div>
  );
}
