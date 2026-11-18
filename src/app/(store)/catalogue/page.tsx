import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getCatalogueProducts } from "@/lib/data";
import { CatalogueFilters } from "@/components/store/catalogue-filters";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Alimentation, maison et cuisine, mode, électronique, hygiène et bébé : découvrez tout le catalogue Major et fils. Commande sans paiement en ligne, règlement à la livraison.",
};

interface SearchParams {
  q?: string | string[];
  categorie?: string | string[];
  tri?: string | string[];
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<CatalogueSkeleton />}>
      <CatalogueContent searchParams={searchParams} />
    </Suspense>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="shell py-9 lg:py-12">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-4 h-14 w-72" />
      <div className="skeleton mt-10 h-12 w-full max-w-md" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] w-full" />
            <div className="skeleton mt-4 h-4 w-2/3" />
            <div className="skeleton mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function CatalogueContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = first(params.q);
  const category = first(params.categorie) || "tout";
  const sort = first(params.tri) || "nouveautes";

  const { products, categories, total } = await getCatalogueProducts({
    q,
    category,
    sort,
  });

  const selectedCategory = categories.find((entry) => entry.slug === category);

  return (
    <div className="shell py-9 lg:py-12">
      <div className="max-w-3xl">
        <p className="eyebrow">Le catalogue</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">
          {selectedCategory ? selectedCategory.name : "La boutique"}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2">
          {selectedCategory
            ? selectedCategory.description
            : "Tous les essentiels du quotidien réunis au même endroit : alimentation, maison, mode, électronique et plus encore. Commandez aujourd'hui, payez à la livraison."}
        </p>
      </div>

      <div className="mt-8 border-y border-line py-5">
        <CatalogueFilters
          categories={categories}
          q={q}
          category={category}
          sort={sort}
          total={total}
        />
      </div>

      {products.length > 0 ? (
        <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-9 border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="font-display text-3xl">Aucun produit trouvé</p>
          <p className="mx-auto mt-3 max-w-md text-base text-ink-2">
            Essayez un autre rayon ou une recherche plus large. Le catalogue
            s&apos;enrichit régulièrement.
          </p>
          <Link href="/catalogue" className="btn btn-outline mt-7">
            Réinitialiser les filtres
          </Link>
        </div>
      )}

      <div className="mt-12 grid gap-6 border-t border-line pt-7 text-sm text-ink-2 sm:grid-cols-3">
        <p>
          <span className="block font-semibold uppercase tracking-[0.14em] text-ink">
            Paiement à la livraison
          </span>
          Aucun prépaiement, aucun compte requis.
        </p>
        <p>
          <span className="block font-semibold uppercase tracking-[0.14em] text-ink">
            Livraison suivie
          </span>
          24 à 72 h à Cotonou et Porto-Novo, 3 à 5 jours ailleurs.
        </p>
        <p>
          <span className="block font-semibold uppercase tracking-[0.14em] text-ink">
            Retours simples
          </span>
          Échange ou remboursement sous 7 jours.
        </p>
      </div>
    </div>
  );
}
