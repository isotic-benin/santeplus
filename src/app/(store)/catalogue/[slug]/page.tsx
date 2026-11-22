import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ChevronRight,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="shell py-10">
      <div className="skeleton h-4 w-64" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="skeleton aspect-[4/5] w-full" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-12 w-3/4" />
          <div className="skeleton h-16 w-40" />
          <div className="skeleton h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id, 4);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="shell pb-32 pt-8 lg:pb-10 lg:pt-10">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3"
      >
        <Link href="/" className="hover:text-accent">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalogue" className="hover:text-accent">
          Catalogue
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/catalogue?categorie=${product.categorySlug}`}
          className="hover:text-accent"
        >
          {product.categoryName ?? product.categorySlug}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name}>
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="badge bg-accent text-white">
                {discount > 0 ? `-${discount}%` : "Offre"}
              </span>
            )}
            {product.featured && (
              <span className="badge border-2 border-ink bg-white text-ink">
                Coup de cœur
              </span>
            )}
          </div>
        </ProductGallery>

        <div>
          <div className="border-2 border-ink bg-ink p-5 text-white sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent-soft">
                  {product.categoryName ?? product.categorySlug}
                </p>
                <h1 className="mt-2 max-w-xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.055em] sm:text-4xl sm:font-extrabold sm:tracking-[-0.05em] lg:text-5xl">
                  {product.name}
                </h1>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-accent font-mono text-xs font-bold">
                MF
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2 border-t-2 border-white/30 pt-5">
              <p className="font-mono text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                {formatPrice(product.price)}
              </p>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <p className="font-mono text-sm text-white/50 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}
              {product.promotionTitle && (
                <span className="badge bg-accent text-white">
                  {product.promotionTitle}
                </span>
              )}
            </div>
          </div>

          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-ink-2">
            {product.description}
          </p>

          {product.details.length > 0 && (
            <ul className="mt-6 space-y-2 border-y-2 border-ink py-5 text-sm text-ink-2">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 bg-accent" />
                  {detail}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7">
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
              <span
                className={`h-2.5 w-2.5 ${product.stock > 0 ? "bg-accent" : "bg-ink-3"}`}
                aria-hidden="true"
              />
              <span className="text-ink-2">
                {product.stock > 0
                  ? product.stock <= 5
                    ? `En stock — plus que ${product.stock} unité${product.stock > 1 ? "s" : ""}`
                    : "En stock"
                  : "Temporairement épuisé"}
              </span>
            </div>
            <ProductPurchase product={product} />
          </div>

          <dl className="mt-8 grid gap-0 border-t-2 border-ink text-sm text-ink-2 sm:grid-cols-2">
            <div className="flex gap-3 border-b-2 border-ink py-4 sm:border-r-2 sm:pr-4">
              <Truck className="h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  Livraison
                </dt>
                <dd className="mt-1">24–72 h à Cotonou et Porto-Novo, 3–5 jours ailleurs.</dd>
              </div>
            </div>
            <div className="flex gap-3 border-b-2 border-ink py-4 sm:px-4">
              <ShieldCheck className="h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  Paiement
                </dt>
                <dd className="mt-1">À la livraison, en espèces ou mobile money.</dd>
              </div>
            </div>
            <div className="flex gap-3 border-b-2 border-ink py-4 sm:border-r-2 sm:pr-4">
              <RotateCcw className="h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  Retours
                </dt>
                <dd className="mt-1">Échange ou remboursement sous 7 jours.</dd>
              </div>
            </div>
            <div className="flex gap-3 border-b-2 border-ink py-4 sm:px-4">
              <Package className="h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                  Emballage
                </dt>
                <dd className="mt-1">Protégé et soigné, prêt à offrir.</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 border-2 border-ink bg-surface p-4 text-sm text-ink-2">
            Livraison offerte dès{" "}
            <span className="font-mono font-bold text-ink">
              {formatPrice(siteConfig.freeShippingThreshold)}
            </span>{" "}
            d&apos;achat. Une question ?{" "}
            <Link href="/contact" className="underline hover:text-accent">
              Écrivez-nous
            </Link>
            .
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t-2 border-ink pt-8">
          <div className="section-head border-t-0 pt-0">
            <h2 className="display text-3xl sm:text-4xl">
              Dans le même esprit
            </h2>
            <Link
              href={`/catalogue?categorie=${product.categorySlug}`}
              className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] hover:text-accent"
            >
              Voir tout
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
