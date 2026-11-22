"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  children,
}: {
  images: string[];
  name: string;
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const current = images[active] ?? images[0] ?? "/placeholder.svg";
  const total = images.length;

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(total - 1, index));
    const scroller = scrollerRef.current;
    if (scroller) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scroller.scrollTo({
        left: next * scroller.clientWidth,
        behavior: reduce ? "auto" : "smooth",
      });
    }
    setActive(next);
  };

  const syncActive = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActive(Math.max(0, Math.min(total - 1, index)));
  };

  return (
    <div className="relative">
      {/* Carrousel mobile — défilement natif, snapping, flèches et compteur. */}
      <div className="lg:hidden">
        <div
          ref={scrollerRef}
          onScroll={syncActive}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(active - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(active + 1);
            }
          }}
          tabIndex={0}
          role="region"
          aria-roledescription="carrousel"
          aria-label={`Images de ${name}`}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto border-2 border-ink bg-surface"
        >
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${total}`}
              className="relative h-[min(68vh,28rem)] w-full shrink-0 snap-center sm:h-[32rem]"
            >
              <Image
                src={image}
                alt={`${name} — vue ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-contain p-3"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Image précédente"
            className="grid h-11 w-11 shrink-0 place-items-center border-2 border-ink disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <p
            className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2 tabular-nums"
            aria-live="polite"
          >
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active === total - 1}
            aria-label="Image suivante"
            className="grid h-11 w-11 shrink-0 place-items-center border-2 border-ink disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Version large : une image + vignettes. */}
      <div className="hidden lg:block">
        <div className="media aspect-[4/5] border-2 border-ink">
          <Image
            src={current}
            alt={name}
            fill
            priority
            sizes="48vw"
            className="object-contain p-4"
          />
        </div>

        {total > 1 && (
          <div
            className="mt-3 grid grid-cols-4 gap-3"
            role="tablist"
            aria-label="Images du produit"
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`Image ${index + 1} de ${name}`}
                onClick={() => setActive(index)}
                className={cn(
                  "media aspect-square border-2 transition-colors",
                  active === index ? "border-accent" : "border-ink",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="15vw"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {children && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {children}
        </div>
      )}
    </div>
  );
}
