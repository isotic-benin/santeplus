import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Truck } from "lucide-react";
import {
  getActivePromotionBanner,
  getActivePromotionBanners,
  getCategories,
  getFeaturedProducts,
} from "@/lib/data";
import { ProductCard } from "@/components/store/product-card";
import { HeroCarousel, type HeroSlide } from "@/components/store/hero-carousel";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

const steps = [
  {
    number: "01",
    title: "Choisissez",
    text: "Épicerie, maison, mode, électronique, hygiène, bébé : tout le quotidien au même endroit.",
  },
  {
    number: "02",
    title: "Commandez",
    text: "Commandez le produit en un geste. Indiquez votre adresse, sans aucun paiement en ligne.",
  },
  {
    number: "03",
    title: "Recevez et réglez",
    text: "Livraison sous 24 à 72 h. Vous payez au livreur, en espèces ou par mobile money.",
  },
];

export default async function HomePage() {
  const [featured, categories, promotion, banners] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getActivePromotionBanner(),
    getActivePromotionBanners(),
  ]);

  const hero = featured[0];
  const heroSecondary = featured[1];
  const displayCategories = categories.slice(0, 6);

  const promoLink =
    promotion?.scope === "category" && promotion.categorySlug
      ? `/catalogue?categorie=${promotion.categorySlug}`
      : "/catalogue";

  const slides: HeroSlide[] = banners
    .filter((banner) => banner.image)
    .map((banner) => ({
      id: banner.id,
      image: banner.image,
      title: banner.title,
      description: banner.description,
      href:
        banner.scope === "category" && banner.categorySlug
          ? `/catalogue?categorie=${banner.categorySlug}`
          : "/catalogue",
    }));

  return (
    <>
      {/* HERO */}
      <section className="border-b-2 border-ink">
        <div className="shell grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12 lg:py-14">
          <div className="fade-up">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 bg-accent" />
              <p className="eyebrow">Major et fils · Édition 2026</p>
            </div>

            <h1 className="hero-title mt-6">
              Tout le quotidien.{" "}
              <span className="text-accent">Au bon prix.</span>
            </h1>

            <p className="mt-7 max-w-xl border-l-4 border-accent pl-5 text-lg leading-snug font-semibold text-ink-2">
              Alimentation, maison, mode, électronique, hygiène et bébé.
              Des produits fiables, sélectionnés pour vous, livrés partout au Bénin.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogue" className="btn btn-accent">
                Voir le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Nous contacter
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-1 border-t-2 border-ink sm:grid-cols-3">
              <div className="border-b-2 border-ink py-4 sm:border-b-0 sm:border-r-2 sm:pr-4">
                <dt className="meta">Paiement</dt>
                <dd className="mt-1.5 text-sm font-bold uppercase tracking-[-0.02em]">
                  À la livraison
                </dd>
              </div>
              <div className="border-b-2 border-ink py-4 sm:border-b-0 sm:border-r-2 sm:px-4">
                <dt className="meta">Livraison</dt>
                <dd className="mt-1.5 text-sm font-bold uppercase tracking-[-0.02em]">
                  24 – 72 h
                </dd>
              </div>
              <div className="py-4 sm:pl-4">
                <dt className="meta">Retours</dt>
                <dd className="mt-1.5 text-sm font-bold uppercase tracking-[-0.02em]">
                  Sous 7 jours
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            {slides.length > 0 ? (
              <HeroCarousel slides={slides} />
            ) : (
              <div className="relative aspect-[4/5] border-2 border-ink bg-surface-2">
                <Image
                  src={hero?.images?.[0] || "/placeholder.svg"}
                  alt={hero?.name ?? "Sélection Major et fils"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 38vw"
                  className="object-cover"
                />
              </div>
            )}

            {hero && (
              <Link
                href={`/catalogue/${hero.slug}`}
                className="group absolute -bottom-5 left-4 z-10 w-56 border-2 border-ink bg-white p-4 transition-colors hover:bg-accent hover:text-white sm:-left-6"
              >
                <p className="meta text-accent group-hover:text-white">Coup de cœur</p>
                <p className="mt-1.5 truncate text-xl font-extrabold uppercase leading-tight tracking-[-0.04em]">
                  {hero.name}
                </p>
                <p className="mt-2 price-tag">{formatPrice(hero.price)}</p>
              </Link>
            )}

            {heroSecondary && (
              <div className="absolute -right-3 -top-4 hidden h-24 w-24 border-4 border-white sm:block lg:-right-6">
                <Image
                  src={heroSecondary.images[0]}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="absolute -right-2 bottom-10 hidden h-24 w-24 place-items-center border-2 border-white bg-accent p-2 text-center font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-white sm:grid lg:-right-4">
              Payez à la livraison
            </div>
          </div>
        </div>
      </section>

      {/* RAYONS */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">01 / Explorer</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">
                Six rayons, tout le quotidien
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] hover:text-accent"
            >
              Tout le catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 border-l-2 border-t-2 border-ink md:grid-cols-3">
            {displayCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/catalogue?categorie=${category.slug}`}
                className="group flex flex-col border-b-2 border-r-2 border-ink p-4 transition-colors hover:bg-ink hover:text-white sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-accent">
                    0{index + 1}
                  </span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="media mt-4 aspect-[4/3] border-2 border-ink">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-2xl font-extrabold uppercase leading-none tracking-[-0.045em] sm:text-3xl">
                  {category.name}
                </h3>
                <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] opacity-60">
                  {category.productCount} produit
                  {category.productCount > 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SÉLECTION */}
      <section className="border-y-2 border-ink bg-surface">
        <div className="shell section">
          <div className="section-head">
            <div>
              <p className="eyebrow">02 / La sélection</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">
                Nos produits du moment
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] hover:text-accent"
            >
              Voir tout le catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {featured.length === 0 && (
            <div className="mt-10 panel px-6 py-14 text-center">
              <p className="text-3xl font-extrabold uppercase tracking-[-0.04em]">
                Le catalogue arrive bientôt.
              </p>
              <p className="mt-2 text-sm text-ink-2">
                Revenez dans quelques instants : de nouveaux produits sont
                ajoutés chaque semaine.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PROMOTION */}
      {promotion && (
        <section className="border-b-2 border-ink bg-accent text-white">
          <div className="shell py-12 lg:py-16">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              Offre en cours
            </p>
            <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <h2 className="text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                  {promotion.title}
                </h2>
                {promotion.description && (
                  <p className="mt-5 max-w-xl text-sm font-medium leading-relaxed text-white/80">
                    {promotion.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-5">
                <p className="font-mono text-5xl font-bold leading-none tracking-[-0.05em] sm:text-6xl">
                  {promotion.type === "percent"
                    ? `-${promotion.value}%`
                    : `-${formatPrice(promotion.value)}`}
                </p>
                <Link href={promoLink} className="btn btn-light">
                  En profiter <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-ink text-white">
        <div className="shell section">
          <div className="section-head border-white/40">
            <div>
              <p className="eyebrow text-accent-soft">03 / Comment ça marche</p>
              <h2 className="display mt-3 max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
                Commandez ici, payez chez vous.
              </h2>
            </div>
            <p className="max-w-sm font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-white/50">
              Pas de carte bancaire, pas de compte à créer. Une commande simple,
              une livraison suivie, un règlement à la remise.
            </p>
          </div>

          <ol className="mt-8 grid grid-cols-1 border-l-2 border-t-2 border-white/30 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="border-b-2 border-r-2 border-white/30 p-6"
              >
                <span className="font-mono text-4xl font-bold text-accent-soft">
                  {step.number}
                </span>
                <h3 className="mt-5 text-2xl font-extrabold uppercase tracking-[-0.04em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent-soft" strokeWidth={2.5} /> Sans compte
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent-soft" strokeWidth={2.5} /> Sans paiement en ligne
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent-soft" strokeWidth={2} /> Livraison offerte dès{" "}
              {formatPrice(siteConfig.freeShippingThreshold)}
            </li>
          </ul>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="section-sm">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16">
          <blockquote className="border-l-4 border-accent pl-6">
            <p className="text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Le bon produit, au bon prix, sans détour.
            </p>
            <footer className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
              Amina Major, fondatrice
            </footer>
          </blockquote>
          <div>
            <p className="max-w-md text-base font-medium leading-relaxed text-ink-2">
              Nous sélectionnons des références fiables pour la maison, la
              cuisine, l&apos;hygiène et toute la famille. Des produits utiles,
              contrôlés, à des prix justes, livrés partout au Bénin.
            </p>
            <Link
              href="/contact"
              className="link-underline mt-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              Nous écrire <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
