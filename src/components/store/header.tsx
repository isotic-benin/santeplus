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
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/contact", label: "Contact" },
];

const tickerItems = [
  "Paiement à la livraison",
  "Livraison offerte dès 50 000 FCFA",
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
 * boundary Suspense (voir `DesktopNav`). Le fallback statique affiche les mêmes
 * liens sans l'état actif pour que la coquille prerendue reste complète.
 */
function DesktopNav() {
  const isActive = useIsActive();

  return (
    <nav
      className="hidden items-center gap-9 md:flex"
      aria-label="Navigation principale"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="nav-link"
          data-active={isActive(link.href)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopNavFallback() {
  return (
    <nav
      className="hidden items-center gap-9 md:flex"
      aria-label="Navigation principale"
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="nav-link">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileMenu({
  onClose,
  closeRef,
  ready,
  count,
}: {
  onClose: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
  ready: boolean;
  count: number;
}) {
  const isActive = useIsActive();

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-base md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
    >
      <div className="flex h-[4.5rem] items-center justify-between border-b border-line px-5">
        <span className="font-display text-2xl">Major et fils</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </div>
      <nav
        className="flex flex-1 flex-col justify-center gap-2 px-6"
        aria-label="Navigation mobile"
      >
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-baseline gap-4 border-b border-line py-5 font-display text-4xl transition-colors hover:text-accent",
              isActive(link.href) ? "text-accent" : "text-ink",
            )}
          >
            <span className="text-[11px] font-sans font-semibold tracking-[0.2em] text-ink-3">
              0{index + 1}
            </span>
            {link.label}
          </Link>
        ))}
        <Link
          href="/panier"
          onClick={onClose}
          className="mt-8 flex items-center justify-between bg-ink px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-base"
        >
          Mon panier
          <span className="rounded-full bg-base px-2 py-0.5 text-[11px] text-ink">
            {ready ? count : 0}
          </span>
        </Link>
      </nav>
      <div className="border-t border-line px-6 py-6 text-xs text-ink-2">
        <p>Paiement à la livraison · Retours sous 7 jours</p>
        <Link
          href="/admin"
          onClick={onClose}
          className="mt-2 inline-block underline"
        >
          Espace administration
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <div className="bg-ink text-base">
        <div className="ticker py-2" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {tickerItems.map((item) => (
                  <span
                    key={`${copy}-${item}`}
                    className="flex items-center text-[11px] font-semibold uppercase tracking-[0.18em]"
                  >
                    {item}
                    <span className="mx-6 inline-block h-1 w-1 rotate-45 bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="sr-only">
          Paiement à la livraison. Livraison offerte dès 50 000 FCFA.
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-base">
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
          <Link
            href="/"
            className="group inline-flex flex-col leading-none"
            aria-label="Major et fils — accueil"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-3 transition-colors group-hover:text-accent">
              Major
            </span>
            <span className="mt-1 font-display text-[1.9rem] font-medium tracking-[-0.04em]">
              et fils
            </span>
          </Link>

          <Suspense fallback={<DesktopNavFallback />}>
            <DesktopNav />
          </Suspense>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/catalogue"
              aria-label="Rechercher un produit"
              className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-accent"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.6} />
            </Link>
            <Link
              href="/panier"
              className="relative grid h-10 w-10 place-items-center text-ink transition-colors hover:text-accent"
              aria-label={`Panier${ready && count > 0 ? `, ${count} article${count > 1 ? "s" : ""}` : " vide"}`}
            >
              <ShoppingBag className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.6} />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center text-ink md:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <MobileMenu
          onClose={() => setMenuOpen(false)}
          closeRef={closeRef}
          ready={ready}
          count={count}
        />
      )}
    </>
  );
}
