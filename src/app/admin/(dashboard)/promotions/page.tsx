import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, Pencil, Plus } from "lucide-react";
import { getAdminCategories, getAdminPromotions } from "@/lib/admin-data";
import { deletePromotion } from "@/lib/admin-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteForm } from "@/components/admin/delete-form";
import {
  formatDate,
  formatPrice,
  getPromotionStatus,
  promotionStatusMeta,
} from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Promotions",
};

export default async function AdminPromotionsPage() {
  const [promotions, categories] = await Promise.all([
    getAdminPromotions(),
    getAdminCategories(),
  ]);

  const categoryNames = new Map(
    categories.map((category) => [category.slug, category.name]),
  );
  const statuses = promotions.map((promotion) => getPromotionStatus(promotion));
  const liveCount = statuses.filter((status) => status === "active").length;
  const scheduledCount = statuses.filter(
    (status) => status === "scheduled",
  ).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Marketing"
        title="Promotions"
        description={`${promotions.length} opération${promotions.length > 1 ? "s" : ""} · ${liveCount} en cours · ${scheduledCount} planifiée${scheduledCount > 1 ? "s" : ""}. La meilleure remise active s'applique automatiquement au produit.`}
        actions={
          <Link href="/admin/promotions/nouveau" className="btn btn-primary">
            <Plus className="h-4 w-4" /> Nouvelle promotion
          </Link>
        }
      />

      {promotions.length === 0 ? (
        <div className="admin-card mt-8 flex flex-col items-center px-6 py-16 text-center">
          <BadgePercent className="h-8 w-8 text-ink-3" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl">Aucune promotion</p>
          <p className="mt-2 max-w-sm text-sm text-ink-2">
            Créez une remise en pourcentage ou en montant fixe sur toute la
            boutique, une catégorie ou une sélection de produits.
          </p>
          <Link
            href="/admin/promotions/nouveau"
            className="btn btn-primary mt-6"
          >
            <Plus className="h-4 w-4" /> Créer une promotion
          </Link>
        </div>
      ) : (
        <section className="admin-card mt-8 overflow-hidden">
          <div className="hidden overflow-x-auto xl:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Promotion</th>
                  <th>Remise</th>
                  <th>Cible</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  const meta = promotionStatusMeta[status];
                  const scopeLabel =
                    promotion.scope === "all"
                      ? "Toute la boutique"
                      : promotion.scope === "category"
                        ? (categoryNames.get(promotion.categorySlug ?? "") ??
                          "Catégorie")
                        : `${promotion.productIds.length} produit${
                            promotion.productIds.length > 1 ? "s" : ""
                          }`;
                  return (
                    <tr key={promotion.id}>
                      <td>
                        <Link
                          href={`/admin/promotions/${promotion.id}`}
                          className="block max-w-[22rem] font-medium hover:text-accent"
                        >
                          {promotion.title}
                        </Link>
                        {promotion.description && (
                          <p className="mt-0.5 line-clamp-1 max-w-[22rem] text-xs text-ink-3">
                            {promotion.description}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        <p className="font-display text-xl tabular-nums">
                          {promotion.type === "percent"
                            ? `-${promotion.value} %`
                            : `-${formatPrice(promotion.value)}`}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-3">
                          {promotion.type === "percent"
                            ? "Pourcentage"
                            : "Montant fixe"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap text-sm text-ink-2">
                        {scopeLabel}
                      </td>
                      <td className="whitespace-nowrap text-xs text-ink-2">
                        <p>Du {formatDate(promotion.startsAt)}</p>
                        <p className="text-ink-3">
                          au {formatDate(promotion.endsAt)}
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/promotions/${promotion.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Modifier
                          </Link>
                          <DeleteForm
                            action={deletePromotion}
                            id={promotion.id}
                            confirmText={`Supprimer la promotion « ${promotion.title} » ? Les prix reviendront à la normale.`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line xl:hidden">
            {promotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              const meta = promotionStatusMeta[status];
              const scopeLabel =
                promotion.scope === "all"
                  ? "Toute la boutique"
                  : promotion.scope === "category"
                    ? (categoryNames.get(promotion.categorySlug ?? "") ??
                      "Catégorie")
                    : `${promotion.productIds.length} produit${
                        promotion.productIds.length > 1 ? "s" : ""
                      }`;
              return (
                <li key={promotion.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/promotions/${promotion.id}`}
                        className="block font-medium leading-snug hover:text-accent"
                      >
                        {promotion.title}
                      </Link>
                      {promotion.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-ink-3">
                          {promotion.description}
                        </p>
                      )}
                    </div>
                    <span className={`badge shrink-0 ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
                    <div>
                      <dt className="text-ink-3">Remise</dt>
                      <dd className="mt-0.5 font-display text-lg tabular-nums text-ink">
                        {promotion.type === "percent"
                          ? `-${promotion.value} %`
                          : `-${formatPrice(promotion.value)}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Cible</dt>
                      <dd className="mt-0.5 text-ink-2">{scopeLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Début</dt>
                      <dd className="mt-0.5 text-ink-2">
                        {formatDate(promotion.startsAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-3">Fin</dt>
                      <dd className="mt-0.5 text-ink-2">
                        {formatDate(promotion.endsAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-2">
                    <Link
                      href={`/admin/promotions/${promotion.id}`}
                      className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Modifier
                    </Link>
                    <DeleteForm
                      action={deletePromotion}
                      id={promotion.id}
                      confirmText={`Supprimer la promotion « ${promotion.title} » ? Les prix reviendront à la normale.`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
