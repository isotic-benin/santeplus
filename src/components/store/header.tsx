"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/contact", label: "Contact" },
];

const tickerItems = [
  "Paiement à la livraison",
  "Livraison offerte sur toutes les commandes",
  "Alimentation, maison, mode et quotidien",
  "Retours acceptés sous 7 jours",
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Liens de navigation principaux. `usePathname()` est une donnée d'URL : elle
 * n'est disponible qu'à l'exécution, donc ce composant est rendu dans un
 * boundary Suspense (voir `DesktopNavFallback`). Le fallback statique affiche
 * les mêmes liens sans l'état actif pour que la coquille prerendue reste complète.
 */
function DesktopNav() {
  const isActive = useIsActive();

  return (
    <nav
      className="hidden items-center gap-8 md:flex"
      aria-label="Navigation principale"
    >
      {links.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          className="nav-link"
          data-active={isActive(link.href)}
        >
          <span className="mr-2 text-accent">0{index + 1}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopNavFallback() {
  return (
    <nav
      className="hidden items-center gap-8 md:flex"
      aria-label="Navigation principale"
    >
      {links.map((link, index) => (
        <Link key={link.href} href={link.href} className="nav-link">
          <span className="mr-2 text-accent">0{index + 1}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileMenu({
  onClose,
  closeRef,
  dialogRef,
}: {
  onClose: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
}) {
  const isActive = useIsActive();

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex flex-col bg-white md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
    >
      <div className="flex h-[4.5rem] items-center justify-between border-b-2 border-ink px-5">
        <span className="text-2xl font-extrabold uppercase tracking-[-0.06em]">
          Et fils
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center border-2 border-ink"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
      <nav
        className="flex flex-1 flex-col justify-center px-6"
        aria-label="Navigation mobile"
      >
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-baseline gap-4 border-b-2 border-ink py-5 text-4xl font-extrabold uppercase tracking-[-0.05em]",
              isActive(link.href) ? "text-accent" : "text-ink",
            )}
          >
            <span className="font-mono text-xs font-bold tracking-[0.12em] text-ink-3">
              0{index + 1}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t-2 border-ink px-6 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2">
        <p>Paiement à la livraison · Retours sous 7 jours</p>
        <Link href="/admin" onClick={onClose} className="mt-2 inline-block underline">
          Espace administration
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <div className="bg-ink text-white">
        <div className="ticker py-2" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {tickerItems.map((item) => (
                  <span
                    key={`${copy}-${item}`}
                    className="flex items-center font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
                  >
                    {item}
                    <span className="mx-6 inline-block h-1.5 w-1.5 bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="sr-only">
          Paiement à la livraison. Livraison offerte sur toutes les commandes.
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-ink bg-white">
        <div className="shell flex h-[4.5rem] items-center justify-between gap-5">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="Major et fils — accueil"
          >
            <span className="grid h-9 w-9 place-items-center bg-accent font-mono text-xs font-bold text-white">
              MF
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink-3 group-hover:text-accent">
                MAJOR
              </span>
              <span className="mt-1 text-2xl font-extrabold uppercase tracking-[-0.06em]">
                et fils
              </span>
            </span>
          </Link>

          <Suspense fallback={<DesktopNavFallback />}>
            <DesktopNav />
          </Suspense>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/catalogue"
              aria-label="Rechercher un produit"
              className="grid h-11 w-11 place-items-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-white"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-11 w-11 place-items-center border-2 border-ink text-ink md:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <MobileMenu
          onClose={() => setMenuOpen(false)}
          closeRef={closeRef}
          dialogRef={dialogRef}
        />
      )}
    </>
  );
}
