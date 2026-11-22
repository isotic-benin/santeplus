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
      className="relative aspect-[4/5] border-2 border-ink bg-surface-2"
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
            "absolute inset-0 block transition-opacity duration-300 linear",
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
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-ink p-5 text-white sm:p-6">
            {slide.description && (
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent-soft">
                {slide.description}
              </p>
            )}
            <p className="mt-2 max-w-[22ch] text-2xl font-extrabold uppercase leading-[0.95] tracking-[-0.04em] sm:text-3xl">
              {slide.title}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
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
            className="absolute left-3 top-4 z-10 grid h-10 w-10 place-items-center border-2 border-white bg-ink text-white transition-colors hover:bg-accent focus-visible:outline-white"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Promotion suivante"
            className="absolute right-3 top-4 z-10 grid h-10 w-10 place-items-center border-2 border-white bg-ink text-white transition-colors hover:bg-accent focus-visible:outline-white"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="absolute bottom-3 left-3 z-10 flex gap-1">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Afficher la promotion ${slideIndex + 1} sur ${count}`}
                aria-current={slideIndex === index}
                className={cn(
                  "grid h-7 w-7 place-items-center border-2 border-white font-mono text-[11px] font-bold text-white transition-colors",
                  slideIndex === index
                    ? "bg-accent"
                    : "bg-ink/70 hover:bg-ink",
                )}
              >
                {String(slideIndex + 1).padStart(2, "0")}
              </button>
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
