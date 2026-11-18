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
    text: "Parcourez nos rayons : épicerie, maison, mode, électronique, hygiène et bébé. Tout le quotidien au même endroit.",
  },
  {
    number: "02",
    title: "Commandez sans payer",
    text: "Ajoutez vos produits au panier et indiquez simplement votre adresse. Aucun paiement en ligne.",
  },
  {
    number: "03",
    title: "Recevez et réglez",
    text: "Nous livrons chez vous sous 24 à 72 h. Vous réglez au livreur, en espèces ou mobile money.",
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
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="shell grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-10 lg:py-14 xl:py-16">
          <div className="fade-up relative z-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-accent" />
              <p className="eyebrow">Nouveautés · 2026</p>
            </div>
            <h1 className="hero-title mt-6 max-w-[11ch]">
              Tout l&apos;essentiel, <em className="font-normal italic text-accent">au même endroit.</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-2 sm:text-lg">
              Major et fils réunit l&apos;alimentation, la maison, la mode,
              l&apos;électronique, l&apos;hygiène et les produits pour bébé.
              Des références fiables, à prix justes, livrées chez vous.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/catalogue" className="btn btn-primary">
                Découvrir la boutique <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Nous contacter
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-5 border-t border-line pt-5">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-3">
                  Paiement
                </dt>
                <dd className="mt-1.5 text-base font-medium">À la livraison</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-3">
                  Livraison
                </dt>
                <dd className="mt-1.5 text-base font-medium">24 – 72 h</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-3">
                  Retours
                </dt>
                <dd className="mt-1.5 text-base font-medium">Sous 7 jours</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[29rem] lg:max-w-none">
            {/* Carousel des promotions, sinon image du produit vedette */}
            {slides.length > 0 ? (
              <HeroCarousel slides={slides} />
            ) : (
              <div className="arch relative aspect-[4/5] overflow-hidden bg-surface-2">
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
                className="absolute -left-4 bottom-8 hidden w-52 border border-line bg-surface p-4 transition-colors hover:border-ink sm:block lg:-left-10"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                  Coup de cœur
                </p>
                <p className="mt-1.5 truncate font-display text-lg leading-tight">
                  {hero.name}
                </p>
                <p className="mt-1 text-xs font-semibold tabular-nums">
                  {formatPrice(hero.price)}
                </p>
              </Link>
            )}

            {heroSecondary && (
              <div className="absolute -right-3 -top-5 hidden h-28 w-24 overflow-hidden border-4 border-base sm:block lg:-right-6">
                <Image
                  src={heroSecondary.images[0]}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="stamp absolute -right-1 bottom-12 max-sm:h-24 max-sm:w-24 max-sm:text-[11px] lg:-right-4">
              <span>
                Payez
                <br />
                à la
                <br />
                livraison
                <br />
                <span className="mt-1 block text-[11px]">✳</span>
              </span>
            </div>

            <p className="absolute -left-7 top-16 hidden rotate-[-90deg] text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-3 lg:block">
              N° 01 — SÉLECTION DU QUOTIDIEN
            </p>
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="section">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Explorer</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                Six rayons, tout le quotidien
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
            >
              Tout le catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 lg:gap-6">
            {displayCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/catalogue?categorie=${category.slug}`}
                className={`group block ${index % 2 === 1 ? "lg:mt-10" : ""}`}
              >
                <div className="media aspect-[3/4]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-3">
                      0{index + 1}
                    </p>
                    <h3 className="mt-1 font-display text-2xl leading-tight">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {category.productCount} produit
                      {category.productCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-ink-3 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SÉLECTION */}
      <section className="border-t border-line bg-surface">
        <div className="shell section">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">La sélection</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                Nos produits du moment
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
            >
              Voir tout le catalogue
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {featured.length === 0 && (
            <div className="mt-10 border border-dashed border-line-strong p-12 text-center">
              <p className="font-display text-2xl">Le catalogue arrive bientôt.</p>
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
        <section className="bg-accent text-[#fffaf3]">
          <div className="shell relative overflow-hidden py-12 lg:py-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#fffaf3]/70">
              Offre en cours
            </p>
            <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <h2 className="font-display text-4xl leading-[0.98] sm:text-6xl lg:text-7xl">
                  {promotion.title}
                </h2>
                {promotion.description && (
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#fffaf3]/80">
                    {promotion.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-6">
                <p className="font-display text-5xl leading-none sm:text-6xl">
                  {promotion.type === "percent"
                    ? `-${promotion.value}%`
                    : `-${formatPrice(promotion.value)}`}
                </p>
                <Link
                  href={promoLink}
                  className="btn btn-light shrink-0"
                >
                  En profiter <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-10 select-none font-display text-[16rem] leading-none text-[#fffaf3]/10"
            >
              %
            </span>
          </div>
        </section>
      )}

      {/* COMMENT ÇA MARCHE */}
      <section className="section">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="relative">
            <div className="media aspect-[4/5] max-w-md">
              <Image
                src={
                  displayCategories[1]?.image ??
                  displayCategories[0]?.image ??
                  "/placeholder.svg"
                }
                alt="Produits Major et fils"
                fill
                sizes="(max-width: 1024px) 90vw, 36vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
              <Truck className="h-4 w-4 text-accent" strokeWidth={1.6} />
              Livraison offerte dès {formatPrice(siteConfig.freeShippingThreshold)}
            </div>
          </div>

          <div>
            <p className="eyebrow">Comment ça marche</p>
            <h2 className="display mt-3 max-w-lg text-4xl sm:text-5xl">
              Commander ici, payer chez vous.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-2">
              Pas de carte bancaire, pas de compte à créer. Une commande simple,
              une livraison suivie et un règlement au moment de la remise.
            </p>

            <ol className="mt-8 space-y-0 border-t border-line">
              {steps.map((step) => (
                <li
                  key={step.number}
                  className="grid gap-4 border-b border-line py-6 sm:grid-cols-[4rem_1fr] sm:gap-6"
                >
                  <span className="font-display text-3xl text-accent">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl">{step.title}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-2">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-ink-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" /> Sans compte
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" /> Sans paiement en ligne
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" /> Suivi par téléphone
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="border-y border-line bg-surface-2/60">
        <div className="shell section-sm grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-16">
          <blockquote>
            <p className="font-display text-3xl leading-[1.15] sm:text-4xl lg:text-5xl">
              « Le bon produit, au bon prix, sans détour. Le quotidien est plus
              simple quand tout est à portée de main. »
            </p>
            <footer className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              Amina Major, fondatrice
            </footer>
          </blockquote>
          <div className="lg:justify-self-end">
            <p className="max-w-sm text-base leading-relaxed text-ink-2">
              Nous sélectionnons des références fiables pour la maison, la
              cuisine, l&apos;hygiène et toute la famille. Des produits utiles,
              contrôlés, à des prix justes, livrés partout au Bénin.
            </p>
            <Link
              href="/contact"
              className="link-underline mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Nous écrire <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}