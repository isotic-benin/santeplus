import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Nouvelle catégorie",
};

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Nouvelle catégorie"
        description="Un univers clair, une image forte et une courte description. Il apparaîtra dans la navigation du catalogue."
        actions={
          <Link href="/admin/categories" className="btn btn-outline">
            <ArrowLeft className="h-4 w-4" /> Retour aux catégories
          </Link>
        }
      />
      <CategoryForm />
    </div>
  );
}
