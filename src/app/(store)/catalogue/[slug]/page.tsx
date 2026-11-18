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
import { AddToCart } from "@/components/store/add-to-cart";
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
          <div className="skeleton h-6 w-32" />
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
    <div className="shell py-7 lg:py-10">
      <nav
        aria-label="Fil d'Ariane"
        className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-3"
      >
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalogue" className="hover:text-ink">
          Catalogue
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/catalogue?categorie=${product.categorySlug}`}
          className="hover:text-ink"
        >
          {product.categoryName ?? product.categorySlug}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink-2">{product.name}</span>
      </nav>

      <div className="mt-7 grid grid-cols-1 gap-9 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} name={product.name}>
          <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="badge bg-accent text-white">
                {discount > 0 ? `-${discount}%` : "Offre"}
              </span>
            )}
            {product.featured && (
              <span className="badge bg-surface text-ink">Coup de cœur</span>
            )}
          </div>
        </ProductGallery>

        <div>
          <p className="eyebrow">
            {product.categoryName ?? product.categorySlug}
          </p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display text-3xl tabular-nums">
              {formatPrice(product.price)}
            </p>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <p className="text-sm text-ink-3 line-through tabular-nums">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
            {product.promotionTitle && (
              <span className="badge bg-accent-soft text-accent-dark">
                {product.promotionTitle}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2">
            {product.description}
          </p>

          {product.details.length > 0 && (
            <ul className="mt-6 space-y-2 border-y border-line py-5 text-sm text-ink-2">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {detail}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7">
            <div className="mb-4 flex items-center gap-2 text-xs">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  product.stock > 0 ? "bg-[#4f7a55]" : "bg-[#9b2c2c]"
                }`}
              />
              <span className="text-ink-2">
                {product.stock > 0
                  ? product.stock <= 5
                    ? `En stock — plus que ${product.stock} unité${product.stock > 1 ? "s" : ""}`
                    : "En stock"
                  : "Temporairement épuisé"}
              </span>
            </div>
            <AddToCart product={product} variant="full" />
          </div>

          <dl className="mt-8 grid gap-4 border-t border-line pt-6 text-sm text-ink-2 sm:grid-cols-2">
            <div className="flex gap-3">
              <Truck className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <dt className="font-semibold text-ink">Livraison</dt>
                <dd>24–72 h à Cotonou et Porto-Novo, 3–5 jours ailleurs.</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <dt className="font-semibold text-ink">Paiement</dt>
                <dd>À la livraison, en espèces ou mobile money.</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <RotateCcw className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <dt className="font-semibold text-ink">Retours</dt>
                <dd>Échange ou remboursement sous 7 jours.</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Package className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <dt className="font-semibold text-ink">Emballage</dt>
                <dd>Protégé et soigné, prêt à offrir.</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 border border-line bg-surface p-4 text-sm text-ink-2">
            Livraison offerte dès{" "}
            <span className="font-semibold text-ink">
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
        <section className="mt-14 border-t border-line pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-3xl sm:text-4xl">Dans le même esprit</h2>
            <Link
              href={`/catalogue?categorie=${product.categorySlug}`}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
            >
              Voir tout
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
