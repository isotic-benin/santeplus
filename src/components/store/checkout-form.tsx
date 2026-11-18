"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { ArrowRight, Loader2, LockKeyhole, Truck } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { placeOrder } from "@/lib/store-actions";
import { siteConfig } from "@/lib/config";
import { computeShipping } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import type { PlaceOrderState } from "@/lib/types";

const initialState: PlaceOrderState = { ok: false };

export function CheckoutForm() {
  const router = useRouter();
  const { items, ready, subtotal, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(
    placeOrder,
    initialState,
  );

  useEffect(() => {
    if (state.ok && state.orderNumber) {
      clearCart();
      router.replace(`/commande/confirmation/${state.orderNumber}`);
    }
  }, [state, clearCart, router]);

  if (!ready) {
    return (
      <div className="shell py-12">
        <div className="skeleton h-10 w-64" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="skeleton h-[28rem]" />
          <div className="skeleton h-80" />
        </div>
      </div>
    );
  }

  if (items.length === 0 && !state.orderNumber) {
    return (
      <div className="shell flex min-h-[50vh] flex-col items-center justify-center py-14 text-center">
        <p className="eyebrow">Commande</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">
          Votre panier est vide
        </h1>
        <p className="mt-4 max-w-md text-sm text-ink-2">
          Ajoutez d&apos;abord quelques produits à votre panier pour passer
          commande.
        </p>
        <Link href="/catalogue" className="btn btn-primary mt-8">
          Voir le catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shipping = computeShipping(
    subtotal,
    siteConfig.freeShippingThreshold,
    siteConfig.shippingFee,
  );
  const total = subtotal + shipping;

  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];
  const ariaFor = (field: string) =>
    errorFor(field) ? `${field}-error` : undefined;

  return (
    <div className="shell py-9 lg:py-12">
      <div className="border-b border-line pb-6">
        <p className="eyebrow">Dernière étape</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Votre commande</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-2">
          Renseignez votre adresse de livraison. Aucun paiement en ligne :
          vous réglerez directement à la réception de votre colis.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
        <form action={formAction} className="min-w-0 space-y-8" noValidate>
          <input
            type="hidden"
            name="cart"
            value={JSON.stringify(
              items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            )}
          />

          {state.error && (
            <div
              className="border border-[#9b2c2c]/30 bg-[#f9e9e7] px-4 py-3 text-sm text-[#8a3229]"
              role="alert"
            >
              {state.error}
            </div>
          )}

          <fieldset className="space-y-5">
            <legend className="eyebrow mb-5">Coordonnées</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="label">
                  Nom complet *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="input"
                  aria-invalid={Boolean(errorFor("fullName"))}
                  aria-describedby={ariaFor("fullName")}
                  placeholder="Aminata Diallo"
                />
                {errorFor("fullName") && (
                  <p id="fullName-error" className="field-error">
                    {errorFor("fullName")}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Téléphone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className="input"
                  aria-invalid={Boolean(errorFor("phone"))}
                  aria-describedby={ariaFor("phone")}
                  placeholder="+229 01 00 00 00 00"
                />
                {errorFor("phone") && (
                  <p id="phone-error" className="field-error">
                    {errorFor("phone")}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="label">
                E-mail <span className="font-normal text-ink-3">(facultatif)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input"
                aria-invalid={Boolean(errorFor("email"))}
                aria-describedby={ariaFor("email")}
                placeholder="vous@exemple.com"
              />
              {errorFor("email") && (
                <p id="email-error" className="field-error">
                  {errorFor("email")}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="eyebrow mb-5">Adresse de livraison</legend>
            <div>
              <label htmlFor="address" className="label">
                Adresse complète *
              </label>
              <textarea
                id="address"
                name="address"
                autoComplete="street-address"
                required
                className="textarea min-h-24"
                aria-invalid={Boolean(errorFor("address"))}
                aria-describedby={ariaFor("address")}
                placeholder="Rue, quartier, point de repère…"
              />
              {errorFor("address") && (
                <p id="address-error" className="field-error">
                  {errorFor("address")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="city" className="label">
                Ville *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                required
                className="input"
                aria-invalid={Boolean(errorFor("city"))}
                aria-describedby={ariaFor("city")}
                placeholder="Porto-Novo"
              />
              {errorFor("city") && (
                <p id="city-error" className="field-error">
                  {errorFor("city")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="notes" className="label">
                Note pour la livraison{" "}
                <span className="font-normal text-ink-3">(facultatif)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                className="textarea min-h-20"
                placeholder="Horaires de passage, instructions d'accès…"
              />
              {errorFor("notes") && (
                <p className="field-error">{errorFor("notes")}</p>
              )}
            </div>
          </fieldset>

          <div className="border border-line bg-surface p-5">
            <p className="flex items-start gap-3 text-sm text-ink-2">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
              <span>
                <strong className="font-semibold text-ink">
                  Paiement à la livraison.
                </strong>{" "}
                Vous réglerez {formatPrice(total)} au livreur, en espèces ou par
                mobile money, à la réception de la commande.
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={pending || Boolean(state.orderNumber)}
            className="btn btn-accent w-full sm:w-auto"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
              </>
            ) : (
              <>
                Confirmer la commande <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="flex items-center gap-2 text-sm text-ink-3">
            <LockKeyhole className="h-3.5 w-3.5" />
            Vos informations servent uniquement au traitement de la commande.
          </p>
        </form>

        <aside className="h-fit min-w-0 border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Votre sélection</h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4 first:pt-0">
                <div className="media hidden h-20 w-16 shrink-0 sm:block">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-display text-base leading-tight">
                    {item.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-xs text-ink-3">
                      Qté {item.quantity} · {formatPrice(item.price)}
                    </p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
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
              <dt className="font-semibold">Total à régler</dt>
              <dd className="font-display text-2xl tabular-nums">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
