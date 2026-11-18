import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getAdminCategories,
  getProductOptions,
} from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PromotionForm } from "@/components/admin/promotion-form";
import { toDateInput } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Nouvelle promotion",
};

export default async function NewPromotionPage() {
  const [categories, products] = await Promise.all([
    getAdminCategories(),
    getProductOptions(),
  ]);

  const now = new Date();
  const defaultStartsAt = toDateInput(now);
  const defaultEndsAt = toDateInput(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Marketing"
        title="Nouvelle promotion"
        description="Définissez l'offre, sa cible et sa période. Les prix affichés et facturés sont recalculés automatiquement."
        actions={
          <Link href="/admin/promotions" className="btn btn-outline">
            <ArrowLeft className="h-4 w-4" /> Retour aux promotions
          </Link>
        }
      />
      <PromotionForm
        categories={categories}
        products={products}
        defaultStartsAt={defaultStartsAt}
        defaultEndsAt={defaultEndsAt}
      />
    </div>
  );
}
