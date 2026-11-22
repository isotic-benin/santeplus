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
        <div className="skeleton h-12 w-64" />
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
        <span className="grid h-16 w-16 place-items-center border-2 border-ink bg-accent text-white">
          <ShoppingBag className="h-6 w-6" strokeWidth={2} />
        </span>
        <p className="eyebrow mt-7">Panier</p>
        <h1 className="display mt-3 text-4xl sm:text-6xl">
          Votre panier est vide
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-2">
          Parcourez nos rayons : épicerie, maison, mode, électronique,
          hygiène et bébé. Le paiement se fait tranquillement à la livraison.
        </p>
        <Link href="/catalogue" className="btn btn-accent mt-8">
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
    <div className="shell py-10 lg:py-12">
      <div className="section-head">
        <div>
          <p className="eyebrow">Votre sélection</p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">Panier</h1>
        </div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
          {count} article{count > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
        <div className="min-w-0">
          <ul className="border-t-2 border-ink">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 border-b-2 border-ink py-6 sm:gap-6"
              >
                <Link
                  href={`/catalogue/${item.slug}`}
                  className="media h-28 w-24 shrink-0 border-2 border-ink sm:h-36 sm:w-28"
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
                        className="text-xl font-extrabold uppercase leading-tight tracking-[-0.04em] transition-colors hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 font-mono text-[11px] text-ink-3">
                        {formatPrice(item.price)} l&apos;unité
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink text-ink transition-colors hover:bg-accent hover:text-white"
                      aria-label={`Retirer ${item.name} du panier`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
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
                    <p className="price-tag">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/catalogue"
            className="link-underline mt-6 inline-flex font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
          >
            Continuer mes achats
          </Link>
        </div>

        <aside className="panel h-fit min-w-0 lg:sticky lg:top-28">
          <h2 className="bg-ink px-5 py-4 text-2xl font-extrabold uppercase tracking-[-0.04em] text-white">
            Récapitulatif
          </h2>
          <div className="p-5 sm:p-6">
            <div className="border-2 border-ink p-4">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">
                <Truck className="h-4 w-4 text-accent" strokeWidth={2} />
                {remaining > 0
                  ? `Plus que ${formatPrice(remaining)} pour la livraison offerte`
                  : "Livraison offerte"}
              </p>
              <div className="mt-3 h-2 w-full bg-surface-2">
                <div
                  className="h-2 bg-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Sous-total</dt>
                <dd className="font-mono font-bold tabular-nums">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-2">Livraison</dt>
                <dd className="font-mono font-bold tabular-nums">
                  {shipping === 0 ? "Offerte" : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t-2 border-ink pt-4 text-base">
                <dt className="font-mono font-bold uppercase tracking-[0.08em]">Total</dt>
                <dd className="font-mono text-2xl font-bold tracking-[-0.04em] tabular-nums">
                  {formatPrice(subtotal + shipping)}
                </dd>
              </div>
            </dl>

            <Link href="/commande" className="btn btn-accent mt-6 w-full">
              Passer la commande <ArrowRight className="h-4 w-4" />
            </Link>

            <ul className="mt-6 space-y-2.5 font-mono text-[11px] leading-relaxed text-ink-2">
              <li className="flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                Aucun paiement en ligne — vous réglez à la livraison.
              </li>
              <li className="flex gap-2">
                <Truck className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                Livraison à Cotonou et Porto-Novo sous 24–72 h, ailleurs sous 3–5 jours.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
