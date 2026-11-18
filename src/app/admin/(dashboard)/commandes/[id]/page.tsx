import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { getAdminOrderById } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  OrderNoteForm,
  OrderStatusForm,
} from "@/components/admin/order-detail-forms";
import {
  formatDateTime,
  formatPrice,
  orderStatusMeta,
} from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Détail de la commande",
};

const timeline = [
  { status: "pending", label: "Reçue" },
  { status: "confirmed", label: "Confirmée" },
  { status: "shipped", label: "Expédiée" },
  { status: "delivered", label: "Livrée" },
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const meta = orderStatusMeta[order.status];
  const cancelled = order.status === "cancelled";
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Commande"
        title={order.orderNumber}
        description={`Passée le ${formatDateTime(order.createdAt)} · ${itemCount} article${itemCount > 1 ? "s" : ""} · règlement à la livraison.`}
        actions={
          <>
            <Link href="/admin/commandes" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
            <Link
              href={`/commande/confirmation/${order.orderNumber}`}
              target="_blank"
              className="btn btn-outline"
            >
              Vue client <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card p-5">
          <p className="eyebrow">Statut</p>
          <span className={`badge mt-3 ${meta.className}`}>{meta.label}</span>
          <p className="mt-2 text-xs text-ink-3">
            Mis à jour le {formatDateTime(order.updatedAt)}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="eyebrow">Total à encaisser</p>
          <p className="mt-3 font-display text-2xl tabular-nums sm:text-3xl">
            {formatPrice(order.total)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
            <Banknote className="h-3.5 w-3.5 text-accent" /> Paiement à la
            livraison
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="eyebrow">Articles</p>
          <p className="mt-3 font-display text-3xl tabular-nums">{itemCount}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
            <ShoppingBag className="h-3.5 w-3.5 text-accent" />{" "}
            {order.items.length} référence{order.items.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="eyebrow">Livraison</p>
          <p className="mt-3 font-display text-3xl tabular-nums">
            {order.shippingFee === 0 ? "Offerte" : formatPrice(order.shippingFee)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
            <Truck className="h-3.5 w-3.5 text-accent" /> {order.customer.city}
          </p>
        </div>
      </div>

      {!cancelled && (
        <section className="admin-card mt-6 p-5 sm:p-6">
          <ol className="grid grid-cols-4 gap-3">
            {timeline.map((step) => {
              const reached =
                orderStatusMeta[step.status].step <= meta.step;
              return (
                <li key={step.status}>
                  <div
                    className={`mb-3 h-1 w-full ${reached ? "bg-accent" : "bg-line"}`}
                  />
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      reached ? "text-ink" : "text-ink-3"
                    }`}
                  >
                    {step.label}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <section className="admin-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <h2 className="font-display text-2xl">Articles commandés</h2>
              <span className="text-xs text-ink-3">
                {order.items.length} ligne{order.items.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.productId} className="flex gap-4 px-5 py-4 sm:px-6">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface-2">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/produits?q=${encodeURIComponent(item.name)}`}
                      className="block truncate font-display text-lg leading-tight hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-3">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
                    {formatPrice(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line bg-surface-2/40 px-5 py-4 text-sm sm:px-6">
              <div className="flex justify-between">
                <dt className="text-ink-2">Sous-total</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Livraison</dt>
                <dd className="tabular-nums">
                  {order.shippingFee === 0
                    ? "Offerte"
                    : formatPrice(order.shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Note interne</h2>
              <CalendarClock
                className="h-5 w-5 text-ink-3"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-1 text-xs text-ink-3">
              Une information pour préparer ou livrer la commande.
            </p>
            <div className="mt-5">
              <OrderNoteForm id={order.id} note={order.adminNote} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card p-5 sm:p-6">
            <h2 className="font-display text-2xl">Client</h2>
            <p className="mt-4 font-display text-xl">
              {order.customer.fullName}
            </p>
            <div className="mt-3 space-y-2.5 text-sm text-ink-2">
              <p className="flex gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  strokeWidth={1.5}
                />
                <span>
                  {order.customer.address}
                  <br />
                  {order.customer.city}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone
                  className="h-4 w-4 shrink-0 text-accent"
                  strokeWidth={1.5}
                />
                <a
                  href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
                  className="hover:text-ink"
                >
                  {order.customer.phone}
                </a>
              </p>
              {order.customer.email && (
                <p className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 shrink-0 text-accent"
                    strokeWidth={1.5}
                  />
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="break-all hover:text-ink"
                  >
                    {order.customer.email}
                  </a>
                </p>
              )}
            </div>
            {order.customer.notes && (
              <div className="mt-4 border-t border-line pt-3 text-xs italic leading-relaxed text-ink-3">
                « {order.customer.notes} »
              </div>
            )}
          </section>

          <section className="admin-card p-5 sm:p-6">
            <h2 className="font-display text-2xl">Suivi</h2>
            <p className="mt-1 text-xs text-ink-3">
              Faites avancer la commande au fil de la livraison.
            </p>
            <div className="mt-5">
              <OrderStatusForm id={order.id} status={order.status} />
            </div>
          </section>

          <section className="border border-line bg-surface-2/50 p-5 text-xs leading-relaxed text-ink-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-ink">
              Paiement à la livraison
            </p>
            <p className="mt-2">
              Prévoir {formatPrice(order.total)} en espèces ou mobile money.
              Aucun paiement en ligne n&apos;a été effectué.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
