import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminCategories } from "@/lib/admin-data";
import { deleteCategory } from "@/lib/admin-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteForm } from "@/components/admin/delete-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Modifier une catégorie",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await getAdminCategories();
  const category = categories.find((entry) => entry.id === id);

  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title={category.name}
        description={`${category.productCount} produit${category.productCount > 1 ? "s" : ""} rattaché${category.productCount > 1 ? "s" : ""} à cet univers.`}
        actions={
          <>
            <Link href="/admin/categories" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
            <Link
              href={`/catalogue?categorie=${category.slug}`}
              target="_blank"
              className="btn btn-outline"
            >
              Voir dans la boutique <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </>
        }
      />
      <CategoryForm category={category} />

      <div className="mt-8 flex max-w-3xl justify-end border-t border-line pt-6">
        <DeleteForm
          action={deleteCategory}
          id={category.id}
          label="Supprimer cette catégorie"
          confirmText={
            category.productCount > 0
              ? `« ${category.name} » contient ${category.productCount} produit(s). La suppression sera bloquée tant que la catégorie n'est pas vide. Continuer ?`
              : `Supprimer « ${category.name} » ? Cette action est définitive.`
          }
          className="text-xs"
        />
      </div>
    </div>
  );
}
