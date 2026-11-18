import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminCategories, getAdminProductById } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteForm } from "@/components/admin/delete-form";
import { deleteProduct } from "@/lib/admin-actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Modifier un produit",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title={product.name}
        description={`Ajouté au catalogue le ${new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(product.createdAt))}.`}
        actions={
          <>
            <Link href="/admin/produits" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
            <Link
              href={`/catalogue/${product.slug}`}
              target="_blank"
              className="btn btn-outline"
            >
              Voir la fiche <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </>
        }
      />
      <ProductForm product={product} categories={categories} />

      <div className="mt-8 flex justify-end border-t border-line pt-6">
        <DeleteForm
          action={deleteProduct}
          id={product.id}
          label="Supprimer ce produit"
          confirmText={`Supprimer « ${product.name} » ? Cette action est définitive.`}
          className="text-xs"
        />
      </div>
    </div>
  );
}
