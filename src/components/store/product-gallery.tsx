"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTOPLAY_DELAY = 4500;

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
  const [paused, setPaused] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [wideScreen, setWideScreen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const current = images[active] ?? images[0] ?? "/placeholder.svg";

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideQuery = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setReduceMotion(reduceQuery.matches);
      setWideScreen(wideQuery.matches);
    };
    sync();
    reduceQuery.addEventListener("change", sync);
    wideQuery.addEventListener("change", sync);
    return () => {
      reduceQuery.removeEventListener("change", sync);
      wideQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const sync = () => setPageVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(total - 1, index));
      const scroller = scrollerRef.current;
      if (scroller) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches;
        scroller.scrollTo({
          left: next * scroller.clientWidth,
          behavior: reduce ? "auto" : "smooth",
        });
      }
      setActive(next);
    },
    [total],
  );

  useEffect(() => {
    if (
      total <= 1 ||
      wideScreen ||
      reduceMotion ||
      paused ||
      userActive ||
      !pageVisible
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      goTo(active === total - 1 ? 0 : active + 1);
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [active, total, wideScreen, reduceMotion, paused, userActive, pageVisible, goTo]);

  const syncActive = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActive(Math.max(0, Math.min(total - 1, index)));
  };

  const autoplayOn = !wideScreen && !reduceMotion && !paused && total > 1;
  const pauseLabel = reduceMotion
    ? "Carrousel en pause — mouvement réduit"
    : paused
      ? "Reprendre le carrousel"
      : "Mettre le carrousel en pause";

  return (
    <div className="relative">
      {/* Carrousel mobile — défilement natif, snapping, autoplay et pause. */}
      <div
        className="lg:hidden"
        onMouseEnter={() => setUserActive(true)}
        onMouseLeave={() => setUserActive(false)}
        onFocus={() => setUserActive(true)}
        onBlur={() => setUserActive(false)}
        onTouchStart={() => setUserActive(true)}
        onTouchEnd={() => setUserActive(false)}
      >
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

        <div className="mt-3 flex items-center gap-3">
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
            className="flex-1 text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2 tabular-nums"
            aria-live={autoplayOn && !userActive ? "off" : "polite"}
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
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            disabled={reduceMotion || total <= 1}
            aria-label={pauseLabel}
            aria-pressed={paused}
            className="grid h-11 w-11 shrink-0 place-items-center border-2 border-ink bg-ink text-white disabled:opacity-30"
          >
            {paused ? (
              <Play className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Pause className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Version large : une image + vignettes, sans défilement automatique. */}
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
