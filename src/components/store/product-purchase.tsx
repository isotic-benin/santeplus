"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductPurchase({
  product,
}: {
  product: Pick<Product, "id" | "slug" | "name" | "price" | "stock">;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  if (product.stock <= 0) {
    return (
      <span className="inline-flex items-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
        Temporairement épuisé — revenez bientôt
      </span>
    );
  }

  const orderNow = () => {
    router.push(
      `/commande?produit=${encodeURIComponent(product.slug)}&quantite=${quantity}`,
    );
  };

  const stockHint =
    product.stock <= 5
      ? `Plus que ${product.stock} en stock.`
      : "En stock — expédié sous 24 à 48 h.";

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-stretch gap-3">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={product.stock}
            label={`Quantité pour ${product.name}`}
          />
          <button
            type="button"
            onClick={orderNow}
            className="btn btn-accent flex-1"
          >
            Commander maintenant <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-ink-3" aria-live="polite">
          {stockHint}
        </p>
      </div>

      <aside
        className="mobile-order-bar lg:hidden"
        aria-label={`Commande directe — ${product.name}`}
      >
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={product.stock}
            small
            label={`Quantité pour ${product.name} — barre de commande`}
          />
          <div className="min-w-0 flex-1">
            <p className="meta">Commande directe</p>
            <p className="font-mono text-lg font-bold tracking-[-0.04em] tabular-nums">
              {formatPrice(product.price * quantity)}
            </p>
          </div>
          <button
            type="button"
            onClick={orderNow}
            className="btn btn-accent mobile-order-cta"
          >
            Commander <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
