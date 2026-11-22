"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CatalogueFilters({
  categories,
  q,
  category,
  sort,
  total,
}: {
  categories: Category[];
  q: string;
  category: string;
  sort: string;
  total: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(q);

  const navigate = (next: {
    q?: string;
    category?: string;
    sort?: string;
  }) => {
    const params = new URLSearchParams();
    const nextQ = next.q ?? search;
    const nextCategory = next.category ?? category;
    const nextSort = next.sort ?? sort;
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextCategory && nextCategory !== "tout")
      params.set("categorie", nextCategory);
    if (nextSort && nextSort !== "nouveautes") params.set("tri", nextSort);
    const query = params.toString();
    router.push(query ? `/catalogue?${query}` : "/catalogue");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="relative w-full max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ q: search });
          }}
          role="search"
        >
          <label htmlFor="catalogue-search" className="sr-only">
            Rechercher un produit
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            strokeWidth={1.6}
          />
          <input
            id="catalogue-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un produit, une catégorie…"
            className="input h-12 pl-10 pr-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                navigate({ q: "" });
              }}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-ink-3 hover:text-ink"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-2" aria-live="polite">
            {total} produit{total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <label
              htmlFor="catalogue-sort"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
            >
              Trier
            </label>
            <select
              id="catalogue-sort"
              value={sort}
              onChange={(event) => navigate({ sort: event.target.value })}
              className="select h-10 min-h-10 w-auto py-0 text-xs"
            >
              <option value="nouveautes">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filtrer par catégorie">
        <span className="sr-only">Filtrer par catégorie</span>
        <button
          type="button"
          onClick={() => navigate({ category: "tout" })}
          aria-pressed={category === "tout"}
          className={cn(
            "border-2 px-3.5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
            category === "tout"
              ? "border-ink bg-ink text-white"
              : "border-ink bg-white text-ink hover:bg-accent hover:text-white",
          )}
        >
          Tout
        </button>
        {categories.map((entry) => (
          <button
            key={entry.slug}
            type="button"
            onClick={() => navigate({ category: entry.slug })}
            aria-pressed={category === entry.slug}
            className={cn(
              "border-2 px-3.5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
              category === entry.slug
                ? "border-ink bg-ink text-white"
                : "border-ink bg-white text-ink hover:bg-accent hover:text-white",
            )}
          >
            {entry.name}
            <span className="ml-1.5 opacity-60">{entry.productCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
