import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-data";
import { deleteProduct } from "@/lib/admin-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteForm } from "@/components/admin/delete-form";
import { formatPrice } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Produits",
};

interface SearchParams {
  q?: string | string[];
  categorie?: string | string[];
  statut?: string | string[];
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const category = first(params.categorie) || "tout";
  const status = first(params.statut) || "tous";

  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  const term = query.toLowerCase();
  const filtered = products.filter((product) => {
    if (category !== "tout" && product.categorySlug !== category) return false;
    if (status === "actifs" && !product.active) return false;
    if (status === "inactifs" && product.active) return false;
    if (status === "stock" && product.stock > 5) return false;
    if (status === "vedettes" && !product.featured) return false;
    if (term) {
      const haystack = [
        product.name,
        product.slug,
        product.categoryName ?? product.categorySlug,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const hasFilters =
    query.length > 0 || category !== "tout" || status !== "tous";
  const activeCount = products.filter((product) => product.active).length;
  const lowStockCount = products.filter(
    (product) => product.active && product.stock <= 5,
  ).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Produits"
        description={`${products.length} produit${products.length > 1 ? "s" : ""} au total · ${activeCount} visible${activeCount > 1 ? "s" : ""} en boutique · ${lowStockCount} stock faible.`}
        actions={
          <Link href="/admin/produits/nouveau" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Nouveau produit
          </Link>
        }
      />

      <form
        action="/admin/produits"
        className="mt-8 grid gap-3 border border-line bg-surface p-4 sm:grid-cols-[1fr_12rem_11rem_auto]"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            strokeWidth={1.6}
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            className="input h-11 min-h-11 pl-9 text-sm"
            placeholder="Rechercher un nom, un slug…"
            aria-label="Rechercher un produit"
          />
        </div>
        <select
          name="categorie"
          defaultValue={category}
          className="select h-11 min-h-11 text-sm"
          aria-label="Filtrer par catégorie"
        >
          <option value="tout">Toutes les catégories</option>
          {categories.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </select>
        <select
          name="statut"
          defaultValue={status}
          className="select h-11 min-h-11 text-sm"
          aria-label="Filtrer par statut"
        >
          <option value="tous">Tous les statuts</option>
          <option value="actifs">Visibles</option>
          <option value="inactifs">Masqués</option>
          <option value="vedettes">Coups de cœur</option>
          <option value="stock">Stock faible</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary h-11 min-h-11 flex-1">
            Filtrer
          </button>
          {hasFilters && (
            <Link href="/admin/produits" className="btn btn-outline h-11 min-h-11">
              Effacer
            </Link>
          )}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-3">
        <p>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          {hasFilters ? " avec les filtres actifs" : ""}.
        </p>
        <Link
          href="/catalogue"
          target="_blank"
          className="inline-flex min-h-9 shrink-0 items-center gap-1 font-semibold uppercase tracking-[0.12em] hover:text-ink"
        >
          Voir la boutique <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <section className="admin-card mt-4 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <PackageOpen className="h-8 w-8 text-ink-3" strokeWidth={1.4} />
            <p className="mt-4 font-display text-2xl">Aucun produit trouvé</p>
            <p className="mt-2 max-w-sm text-sm text-ink-2">
              Ajustez vos filtres ou créez un nouveau produit pour remplir le
              catalogue.
            </p>
            <Link href="/admin/produits/nouveau" className="btn btn-primary mt-6">
              <Plus className="h-4 w-4" /> Créer un produit
            </Link>
          </div>
        ) : (
          <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-surface-2">
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produits/${product.id}`}
                            className="block max-w-[20rem] truncate font-medium hover:text-accent"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
                            <span className="truncate">{product.slug}</span>
                            {product.featured && (
                              <span className="inline-flex items-center gap-1 text-accent">
                                <Sparkles className="h-3 w-3" /> Coup de cœur
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-ink-2">
                      {product.categoryName ?? product.categorySlug}
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="font-semibold tabular-nums">
                        {formatPrice(product.price)}
                      </p>
                      {product.promotionTitle && (
                        <p className="text-[11px] text-accent">
                          {product.promotionTitle}
                        </p>
                      )}
                      {!product.promotionTitle && product.compareAtPrice && (
                        <p className="text-xs text-ink-3 line-through tabular-nums">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          product.stock === 0
                            ? "status-cancelled"
                            : product.stock <= 5
                              ? "status-pending"
                              : "status-delivered"
                        }`}
                      >
                        {product.stock} en stock
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          product.active ? "status-confirmed" : "status-cancelled"
                        }`}
                      >
                        {product.active ? "Visible" : "Masqué"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Modifier
                        </Link>
                        <DeleteForm
                          action={deleteProduct}
                          id={product.id}
                          label="Supprimer"
                          confirmText={`Supprimer « ${product.name} » ? Cette action est définitive.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 p-3 md:grid-cols-2 xl:hidden">
            {filtered.map((product) => (
              <li key={product.id} className="admin-card p-4">
                <div className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface-2">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="block font-medium leading-snug hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-3">
                      {product.categoryName ?? product.categorySlug} · /{product.slug}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatPrice(product.price)}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-ink-3 line-through tabular-nums">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`badge ${
                          product.stock === 0
                            ? "status-cancelled"
                            : product.stock <= 5
                              ? "status-pending"
                              : "status-delivered"
                        }`}
                      >
                        {product.stock} en stock
                      </span>
                      <span
                        className={`badge ${
                          product.active ? "status-confirmed" : "status-cancelled"
                        }`}
                      >
                        {product.active ? "Visible" : "Masqué"}
                      </span>
                      {product.featured && (
                        <span className="badge bg-surface-2 text-ink-2">
                          <Sparkles className="h-3 w-3" /> Coup de cœur
                        </span>
                      )}
                    </div>

                    {product.promotionTitle && (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                        {product.promotionTitle}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-2">
                      <Link
                        href={`/admin/produits/${product.id}`}
                        className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Modifier
                      </Link>
                      <DeleteForm
                        action={deleteProduct}
                        id={product.id}
                        label="Supprimer"
                        confirmText={`Supprimer « ${product.name} » ? Cette action est définitive.`}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          </>
        )}
      </section>
    </div>
  );
}
