import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Pencil, Plus, Tags } from "lucide-react";
import { getAdminCategories } from "@/lib/admin-data";
import { deleteCategory } from "@/lib/admin-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteForm } from "@/components/admin/delete-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Catégories",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  const featured = categories.filter((category) => category.featured).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Catégories"
        description={`${categories.length} univers · ${featured} mis en avant sur l'accueil. Les catégories structurent le catalogue et les promotions.`}
        actions={
          <Link href="/admin/categories/nouveau" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Nouvelle catégorie
          </Link>
        }
      />

      {categories.length === 0 ? (
        <div className="admin-card mt-8 flex flex-col items-center px-6 py-16 text-center">
          <Tags className="h-8 w-8 text-ink-3" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl">Aucune catégorie</p>
          <p className="mt-2 max-w-sm text-sm text-ink-2">
            Commencez par créer vos rayons — épicerie, maison, mode,
            électronique — avant d&apos;ajouter des produits.
          </p>
          <Link href="/admin/categories/nouveau" className="btn btn-primary mt-6">
            <Plus className="h-4 w-4" /> Créer la première catégorie
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="admin-card group overflow-hidden"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="badge bg-base/90 text-ink">
                    {category.productCount} produit
                    {category.productCount > 1 ? "s" : ""}
                  </span>
                  {category.featured && (
                    <span className="badge status-confirmed">En avant</span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-2xl leading-tight">
                      {category.name}
                    </h2>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-3">
                      /{category.slug}
                    </p>
                  </div>
                  <Link
                    href={`/catalogue?categorie=${category.slug}`}
                    target="_blank"
                    className="-mt-1.5 -mr-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:text-accent"
                    aria-label={`Voir ${category.name} dans la boutique`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-ink-2">
                  {category.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Link>
                  <DeleteForm
                    action={deleteCategory}
                    id={category.id}
                    label="Supprimer"
                    confirmText={
                      category.productCount > 0
                        ? `« ${category.name} » contient ${category.productCount} produit(s). La suppression sera bloquée tant que la catégorie n'est pas vide. Continuer ?`
                        : `Supprimer « ${category.name} » ? Cette action est définitive.`
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
