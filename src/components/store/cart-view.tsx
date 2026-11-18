"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { siteConfig } from "@/lib/config";
import { computeShipping } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, ready, subtotal, setQuantity, removeItem } = useCart();

  if (!ready) {
    return (
      <div className="shell py-12">
        <div className="skeleton h-10 w-52" />
        <div className="mt-10 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell flex min-h-[55vh] flex-col items-center justify-center py-14 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-line text-accent">
          <ShoppingBag className="h-6 w-6" strokeWidth={1.4} />
        </span>
        <p className="eyebrow mt-7">Panier</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">
          Votre panier est vide
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-2">
          Parcourez nos rayons : épicerie, maison, mode, électronique,
          hygiène et bébé. Le paiement se fait tranquillement à la livraison.
        </p>
        <Link href="/catalogue" className="btn btn-primary mt-8">
          Découvrir le catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shipping = computeShipping(
    subtotal,
    siteConfig.freeShippingThreshold,
    siteConfig.shippingFee,
  );
  const remaining = Math.max(0, siteConfig.freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / siteConfig.freeShippingThreshold) * 100);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="shell py-9 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Votre sélection</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">Panier</h1>
        </div>
        <p className="text-sm text-ink-2">
          {count} article{count > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">
          <ul className="border-t border-line">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 border-b border-line py-6 sm:gap-6"
              >
                <Link
                  href={`/catalogue/${item.slug}`}
                  className="media h-28 w-24 shrink-0 sm:h-36 sm:w-28"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={112}
                    height={144}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/catalogue/${item.slug}`}
                        className="font-display text-xl leading-tight transition-colors hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-3">
                        {formatPrice(item.price)} l&apos;unité
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="grid h-9 w-9 shrink-0 place-items-center text-ink-3 transition-colors hover:text-accent"
                      aria-label={`Retirer ${item.name} du panier`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) =>
                        setQuantity(item.productId, quantity)
                      }
                      max={item.stock}
                      small
                      label={`Quantité pour ${item.name}`}
                    />
                    <p className="text-sm font-semibold tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/catalogue"
            className="link-underline mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-ink-2"
          >
            Continuer mes achats
          </Link>
        </div>

        <aside className="h-fit min-w-0 border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-28 lg:p-8">
          <h2 className="font-display text-2xl">Récapitulatif</h2>

          <div className="mt-6 border border-line bg-base p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink-2">
              <Truck className="h-4 w-4 text-accent" strokeWidth={1.6} />
              {remaining > 0
                ? `Plus que ${formatPrice(remaining)} pour la livraison offerte`
                : "Livraison offerte"}
            </p>
            <div className="mt-3 h-1 w-full bg-line">
              <div
                className="h-1 bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">Sous-total</dt>
              <dd className="font-semibold tabular-nums">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-2">Livraison</dt>
              <dd className="font-semibold tabular-nums">
                {shipping === 0 ? "Offerte" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-4 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl tabular-nums">
                {formatPrice(subtotal + shipping)}
              </dd>
            </div>
          </dl>

          <Link href="/commande" className="btn btn-accent mt-6 w-full">
            Passer la commande <ArrowRight className="h-4 w-4" />
          </Link>

          <ul className="mt-6 space-y-2.5 text-sm text-ink-2">
            <li className="flex gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
              Aucun paiement en ligne — vous réglez à la livraison.
            </li>
            <li className="flex gap-2">
              <Truck className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
              Livraison à Cotonou et Porto-Novo sous 24–72 h, ailleurs sous 3–5 jours.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
