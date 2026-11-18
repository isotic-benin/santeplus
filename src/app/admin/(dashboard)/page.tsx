import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Mail,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, formatPrice, orderStatusMeta } from "@/lib/utils";

export const instant = false;

export default async function AdminDashboardPage() {
  const [admin, data] = await Promise.all([requireAdmin(), getDashboardData()]);

  const maxCount = Math.max(1, ...data.week.map((day) => day.count));
  const weekRevenue = data.week.reduce((sum, day) => sum + day.total, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Vue d'ensemble"
        title={`Bonjour, ${admin.name.split(" ")[0]}.`}
        description="Voici l'état de la boutique aujourd'hui. Les commandes sont à confirmer par téléphone avant expédition."
        actions={
          <>
            <Link href="/admin/produits/nouveau" className="btn btn-primary">
              <Plus className="h-4 w-4" /> Nouveau produit
            </Link>
            <Link href="/admin/commandes" className="btn btn-outline">
              Voir les commandes
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card p-5">
          <p className="eyebrow">CA du mois</p>
          <p className="mt-3 font-display text-3xl tabular-nums sm:text-4xl">
            {formatPrice(data.monthRevenue)}
          </p>
          <p className="mt-1 text-xs text-ink-3">
            {data.monthOrders} commande{data.monthOrders > 1 ? "s" : ""} ce mois
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="eyebrow">Chiffre d&apos;affaires</p>
          <p className="mt-3 font-display text-3xl tabular-nums sm:text-4xl">
            {formatPrice(data.revenue)}
          </p>
          <p className="mt-1 text-xs text-ink-3">
            {data.totalOrders} commande{data.totalOrders > 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="admin-card bg-ink p-5 text-base">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-base/50">
            À traiter
          </p>
          <p className="mt-3 font-display text-3xl tabular-nums sm:text-4xl">
            {data.pendingOrders}
          </p>
          <p className="mt-1 text-xs text-base/50">
            commande{data.pendingOrders > 1 ? "s" : ""} en attente ou confirmée
            {data.pendingOrders > 1 ? "s" : ""}
          </p>
          <Link
            href="/admin/commandes?statut=pending"
            className="mt-4 inline-flex min-h-9 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent hover:text-base"
          >
            Traiter <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="admin-card p-5">
          <p className="eyebrow">Stock faible</p>
          <p className="mt-3 font-display text-3xl tabular-nums sm:text-4xl">
            {data.lowStock.length}
          </p>
          <p className="mt-1 text-xs text-ink-3">
            produit{data.lowStock.length > 1 ? "s" : ""} à réapprovisionner
          </p>
          <Link
            href="/admin/produits"
            className="mt-4 inline-flex min-h-9 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent hover:text-ink"
          >
            Voir les produits <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="admin-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">7 derniers jours</h2>
              <p className="mt-1 text-xs text-ink-3">
                {weekRevenue > 0
                  ? `${formatPrice(weekRevenue)} de commandes sur la période`
                  : "Aucune commande enregistrée sur la période"}
              </p>
            </div>
            <span className="badge status-confirmed">
              {data.week.reduce((sum, day) => sum + day.count, 0)} commandes
            </span>
          </div>

          <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
            {data.week.map((day) => {
              const height =
                day.count === 0 ? 2 : Math.max(6, (day.count / maxCount) * 100);
              return (
                <div
                  key={day.key}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  title={`${day.count} commande(s) — ${formatPrice(day.total)}`}
                >
                  <span className="text-[11px] font-semibold tabular-nums text-ink-2">
                    {day.count || ""}
                  </span>
                  <div
                    className={`w-full transition-colors ${
                      day.count > 0
                        ? "bg-accent group-hover:bg-accent-dark"
                        : "bg-line"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-3">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <h2 className="font-display text-2xl">Raccourcis</h2>
            <BadgePercent className="h-5 w-5 text-ink-3" strokeWidth={1.5} />
          </div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            <Link
              href="/admin/promotions/nouveau"
              className="flex items-center justify-between py-3.5 text-sm transition-colors hover:text-accent"
            >
              <span className="flex items-center gap-3">
                <BadgePercent className="h-4 w-4 text-accent" strokeWidth={1.5} />
                Créer une promotion
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-3" />
            </Link>
            <Link
              href="/admin/categories/nouveau"
              className="flex items-center justify-between py-3.5 text-sm transition-colors hover:text-accent"
            >
              <span className="flex items-center gap-3">
                <Package className="h-4 w-4 text-accent" strokeWidth={1.5} />
                Ajouter une catégorie
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-3" />
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center justify-between py-3.5 text-sm transition-colors hover:text-accent"
            >
              <span className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent" strokeWidth={1.5} />
                Messages
                {data.unreadMessages > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                    {data.unreadMessages}
                  </span>
                )}
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-3" />
            </Link>
            <Link
              href="/admin/commandes"
              className="flex items-center justify-between py-3.5 text-sm transition-colors hover:text-accent"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-accent" strokeWidth={1.5} />
                Toutes les commandes
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-3" />
            </Link>
          </div>

          <div className="mt-6">
            <p className="eyebrow">Promotions actives</p>
            <p className="mt-2 font-display text-3xl">
              {data.activePromotions}
            </p>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="admin-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 sm:px-6">
            <h2 className="font-display text-2xl">Commandes récentes</h2>
            <Link
              href="/admin/commandes"
              className="inline-flex min-h-9 items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3 hover:text-ink"
            >
              Tout voir
            </Link>
          </div>
          <div className="hidden overflow-x-auto xl:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const status = orderStatusMeta[order.status];
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="font-semibold hover:text-accent"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td>
                        <p className="font-medium">{order.customer.fullName}</p>
                        <p className="text-xs text-ink-3">
                          {order.customer.city}
                        </p>
                      </td>
                      <td className="whitespace-nowrap text-ink-2">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="whitespace-nowrap font-semibold tabular-nums">
                        {formatPrice(order.total)}
                      </td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-ink-3">
                      Aucune commande pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line xl:hidden">
            {data.recentOrders.map((order) => {
              const status = orderStatusMeta[order.status];
              return (
                <li key={order.id}>
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="flex min-h-20 flex-col justify-center gap-2 px-5 py-4 transition-colors hover:bg-surface-2/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-3">
                          {order.customer.fullName} · {order.customer.city}
                        </p>
                      </div>
                      <span className={`badge shrink-0 ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-ink-2">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold tabular-nums text-ink">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
            {data.recentOrders.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-3">
                Aucune commande pour le moment.
              </li>
            )}
          </ul>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Stock à surveiller</h2>
            <Package className="h-5 w-5 text-ink-3" strokeWidth={1.5} />
          </div>
          <ul className="mt-5 divide-y divide-line">
            {data.lowStock.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <Link
                  href={`/admin/produits/${product.id}`}
                  className="inline-flex min-h-9 min-w-0 items-center truncate text-sm hover:text-accent"
                >
                  {product.name}
                </Link>
                <span
                  className={`badge ${product.stock === 0 ? "status-cancelled" : "status-pending"}`}
                >
                  {product.stock} restant{product.stock > 1 ? "s" : ""}
                </span>
              </li>
            ))}
            {data.lowStock.length === 0 && (
              <li className="py-6 text-sm text-ink-3">
                Tous les stocks sont confortables.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
