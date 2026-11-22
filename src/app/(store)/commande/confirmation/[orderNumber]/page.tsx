import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { getOrderByNumber } from "@/lib/admin-data";
import { formatDateTime, formatPrice, orderStatusMeta } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

export const instant = false;

export const metadata: Metadata = {
  title: "Confirmation de commande",
  robots: { index: false, follow: false },
};

const timeline = [
  { status: "pending" as const, label: "Reçue" },
  { status: "confirmed" as const, label: "Confirmée" },
  { status: "shipped" as const, label: "Expédiée" },
  { status: "delivered" as const, label: "Livrée" },
];

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const status = orderStatusMeta[order.status];
  const currentStep = status.step;
  const cancelled = order.status === "cancelled";

  return (
    <div className="shell py-9 lg:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center bg-accent text-white">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <p className="eyebrow mt-6">Commande enregistrée</p>
        <h1 className="display mt-3 text-4xl sm:text-6xl">
          Merci {order.customer.fullName.split(" ")[0]} !
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-2">
          Votre commande{" "}
          <span className="font-semibold text-ink">{order.orderNumber}</span> a
          bien été reçue. Nous vous contactons au{" "}
          <span className="font-semibold text-ink">{order.customer.phone}</span>{" "}
          pour confirmer la livraison.
        </p>
        <span className={`badge mt-5 ${status.className}`}>{status.label}</span>
      </div>

      <div className="panel mx-auto mt-9 max-w-4xl">
        <div className="grid gap-6 border-b-2 border-ink p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="eyebrow">Commande</p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-[-0.03em]">{order.orderNumber}</p>
            <p className="mt-1 text-xs text-ink-3">
              Passée le {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="eyebrow">Total à régler</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-[-0.04em] tabular-nums">
              {formatPrice(order.total)}
            </p>
            <p className="mt-1 text-xs text-ink-3">
              Paiement à la livraison
            </p>
          </div>
        </div>

        {!cancelled ? (
          <div className="border-b-2 border-ink p-6 sm:p-8">
            <ol className="grid grid-cols-4 gap-2">
              {timeline.map((step) => {
                const reached = currentStep >= orderStatusMeta[step.status].step;
                return (
                  <li key={step.status} className="relative">
                    <div
                      className={`mb-3 h-2 w-full ${reached ? "bg-accent" : "bg-surface-2"}`}
                    />
                    <p
                      className={`font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${
                        reached ? "text-ink" : "text-ink-3"
                      }`}
                    >
                      {step.label}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <div className="border-b border-line p-6 text-sm text-ink-2 sm:p-8">
            Cette commande a été annulée. Si vous pensez qu&apos;il s&apos;agit
            d&apos;une erreur, contactez-nous rapidement.
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-[-0.04em]">Vos articles</h2>
            <ul className="mt-4 divide-y-2 divide-ink">
              {order.items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4 first:pt-0">
                  <div className="media h-20 w-16 shrink-0 border-2 border-ink">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/catalogue/${item.slug}`}
                      className="block truncate text-base font-extrabold uppercase tracking-[-0.03em] hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-3">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold tabular-nums">
                    {formatPrice(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t-2 border-ink pt-4 text-sm">
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
              <div className="flex justify-between border-t-2 border-ink pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold uppercase tracking-[-0.04em]">Livraison</h2>
              <div className="mt-3 space-y-2 text-sm text-ink-2">
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                  <span className="grid gap-0.5">
                    <span className="font-semibold text-ink">{order.customer.fullName}</span>
                    <span>{order.customer.address}</span>
                    <span>{order.customer.city}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                  {order.customer.phone}
                </p>
                {order.customer.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                    {order.customer.email}
                  </p>
                )}
                {order.customer.notes && (
                  <p className="border-t-2 border-ink pt-3 text-xs italic text-ink-3">
                    « {order.customer.notes} »
                  </p>
                )}
              </div>
            </div>

            <div className="border-2 border-ink border-l-4 border-l-accent bg-surface p-4 text-xs leading-relaxed text-ink-2">
              <p className="font-semibold uppercase tracking-[0.12em] text-ink">
                Paiement à la livraison
              </p>
              <p className="mt-2">
                Préparez {formatPrice(order.total)}. Vous pourrez régler en
                espèces ou par mobile money directement au livreur.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-4 text-center">
        <Link href="/catalogue" className="btn btn-primary">
          Continuer mes achats
        </Link>
        <Link href="/contact" className="btn btn-outline">
          Une question ?
        </Link>
        <p className="w-full text-xs text-ink-3">
          Conservez votre numéro de commande. Une question ? Écrivez à{" "}
          <a href={`mailto:${siteConfig.email}`} className="underline">
            {siteConfig.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
