import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCategories } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Nouveau produit",
};

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Nouveau produit"
        description="Présentez un produit : visuels, description, prix et stock. Il sera visible immédiatement si vous l'activez."
        actions={
          <Link href="/admin/produits" className="btn btn-outline">
            <ArrowLeft className="h-4 w-4" /> Retour aux produits
          </Link>
        }
      />
      <ProductForm categories={categories} />
    </div>
  );
}
