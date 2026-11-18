import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import { getAdminOrders } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  formatDate,
  formatPrice,
  orderStatusMeta,
  orderStatuses,
} from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Commandes",
};

interface SearchParams {
  statut?: string | string[];
  q?: string | string[];
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = first(params.statut) || "toutes";
  const query = first(params.q).trim();

  const orders = await getAdminOrders();
  const term = query.toLowerCase();

  const filtered = orders.filter((order) => {
    if (status !== "toutes" && order.status !== status) return false;
    if (term) {
      const haystack = [
        order.orderNumber,
        order.customer.fullName,
        order.customer.phone,
        order.customer.email,
        order.customer.city,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const counts = new Map(
    orderStatuses.map((entry) => [
      entry,
      orders.filter((order) => order.status === entry).length,
    ]),
  );
  const pending = (counts.get("pending") ?? 0) + (counts.get("confirmed") ?? 0);

  const buildHref = (nextStatus: string) => {
    const search = new URLSearchParams();
    if (nextStatus !== "toutes") search.set("statut", nextStatus);
    if (query) search.set("q", query);
    const suffix = search.toString();
    return suffix ? `/admin/commandes?${suffix}` : "/admin/commandes";
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ventes"
        title="Commandes"
        description={`${orders.length} commande${orders.length > 1 ? "s" : ""} au total · ${pending} à traiter. Confirmez chaque commande par téléphone avant l'expédition.`}
        actions={
          <span className="badge status-pending">
            {pending} à traiter
          </span>
        }
      />

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="Filtrer les commandes par statut"
          className="flex flex-wrap gap-2"
        >
          <Link
            href={buildHref("toutes")}
            className={`inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
              status === "toutes"
                ? "border-ink bg-ink text-base"
                : "border-line-strong text-ink-2 hover:border-ink hover:text-ink"
            }`}
          >
            Toutes
            <span
              className={`tabular-nums ${status === "toutes" ? "text-base/60" : "text-ink-3"}`}
            >
              {orders.length}
            </span>
          </Link>
          {orderStatuses.map((entry) => {
            const active = status === entry;
            const count = counts.get(entry) ?? 0;
            return (
              <Link
                key={entry}
                href={buildHref(entry)}
                className={`inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "border-ink bg-ink text-base"
                    : "border-line-strong text-ink-2 hover:border-ink hover:text-ink"
                }`}
              >
                {orderStatusMeta[entry].label}
                <span
                  className={`tabular-nums ${active ? "text-base/60" : "text-ink-3"}`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        <form
          action="/admin/commandes"
          className="flex w-full max-w-md gap-2 lg:w-auto"
        >
          {status !== "toutes" && (
            <input type="hidden" name="statut" value={status} />
          )}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              strokeWidth={1.6}
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              className="input h-10 min-h-10 pl-9 text-sm"
              placeholder="N° commande, client, ville, téléphone…"
              aria-label="Rechercher une commande"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm h-10">
            Rechercher
          </button>
        </form>
      </div>

      <section className="admin-card mt-6 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <ShoppingBag className="h-8 w-8 text-ink-3" strokeWidth={1.4} />
            <p className="mt-4 font-display text-2xl">Aucune commande</p>
            <p className="mt-2 max-w-sm text-sm text-ink-2">
              {orders.length === 0
                ? "Les commandes passées depuis la boutique apparaîtront ici."
                : "Aucune commande ne correspond à ce filtre ou à cette recherche."}
            </p>
            {(status !== "toutes" || query) && (
              <Link href="/admin/commandes" className="btn btn-outline mt-6">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        ) : (
          <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Ville</th>
                  <th>Date</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th className="text-right">Détail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const meta = orderStatusMeta[order.status];
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
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
                          {order.customer.phone}
                        </p>
                      </td>
                      <td className="whitespace-nowrap text-ink-2">
                        {order.customer.city}
                      </td>
                      <td className="whitespace-nowrap text-ink-2">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="whitespace-nowrap tabular-nums text-ink-2">
                        {itemCount} article{itemCount > 1 ? "s" : ""}
                      </td>
                      <td className="whitespace-nowrap font-semibold tabular-nums">
                        {formatPrice(order.total)}
                      </td>
                      <td>
                        <span className={`badge ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                        >
                          Voir <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line xl:hidden">
            {filtered.map((order) => {
              const meta = orderStatusMeta[order.status];
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              return (
                <li key={order.id}>
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="block p-4 transition-colors hover:bg-surface-2/40 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="mt-1 truncate text-sm text-ink">
                          {order.customer.fullName}
                        </p>
                        <p className="text-xs text-ink-3">
                          {order.customer.phone}
                        </p>
                      </div>
                      <span className={`badge shrink-0 ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
                      <div>
                        <dt className="text-ink-3">Ville</dt>
                        <dd className="mt-0.5 truncate text-ink-2">
                          {order.customer.city}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-3">Date</dt>
                        <dd className="mt-0.5 text-ink-2">
                          {formatDate(order.createdAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-3">Articles</dt>
                        <dd className="mt-0.5 tabular-nums text-ink-2">
                          {itemCount} article{itemCount > 1 ? "s" : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-3">Total</dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-ink">
                          {formatPrice(order.total)}
                        </dd>
                      </div>
                    </dl>

                    <span className="mt-3 inline-flex min-h-9 items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                      Voir la commande <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          </>
        )}
      </section>
    </div>
  );
}
