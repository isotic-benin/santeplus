import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getAdminCategories,
  getAdminPromotionById,
  getProductOptions,
} from "@/lib/admin-data";
import { deletePromotion } from "@/lib/admin-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PromotionForm } from "@/components/admin/promotion-form";
import { DeleteForm } from "@/components/admin/delete-form";
import { getPromotionStatus, promotionStatusMeta, toDateInput } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Modifier une promotion",
};

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, categories, products] = await Promise.all([
    getAdminPromotionById(id),
    getAdminCategories(),
    getProductOptions(),
  ]);

  if (!promotion) notFound();

  const status = getPromotionStatus(promotion);
  const meta = promotionStatusMeta[status];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Marketing"
        title={promotion.title}
        description="Modifiez l'offre ou la période. Une promotion terminée reste consultable mais n'affecte plus les prix."
        actions={
          <>
            <span className={`badge ${meta.className}`}>{meta.label}</span>
            <Link href="/admin/promotions" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
          </>
        }
      />
      <PromotionForm
        promotion={promotion}
        categories={categories}
        products={products}
        defaultStartsAt={toDateInput(promotion.startsAt)}
        defaultEndsAt={toDateInput(promotion.endsAt)}
      />

      <div className="mt-8 flex max-w-4xl justify-end border-t border-line pt-6">
        <DeleteForm
          action={deletePromotion}
          id={promotion.id}
          label="Supprimer cette promotion"
          confirmText={`Supprimer la promotion « ${promotion.title} » ? Les prix reviendront à la normale.`}
          className="text-xs"
        />
      </div>
    </div>
  );
}
