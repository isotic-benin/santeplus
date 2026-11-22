"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function AddToCart({
  product,
  variant = "icon",
  className,
}: {
  product: Pick<Product, "id" | "slug" | "name" | "images" | "price" | "stock">;
  variant?: "icon" | "full";
  className?: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const item = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? "/placeholder.svg",
    price: product.price,
    stock: product.stock,
  };

  const add = (amount: number) => {
    addItem(item, amount);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  };

  // Achat direct : la quantité choisie est transmise à la page de commande,
  // qui résout le produit côté serveur (le panier n'est pas utilisé).
  const orderNow = () => {
    router.push(
      `/commande?produit=${encodeURIComponent(product.slug)}&quantite=${quantity}`,
    );
  };

  if (product.stock <= 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3",
          className,
        )}
      >
        Épuisé
      </span>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => add(1)}
        className={cn(
          "grid h-11 w-11 place-items-center border-2 border-ink bg-accent text-white transition-colors duration-100 hover:bg-ink focus-visible:outline-offset-2",
          added && "bg-ink",
          className,
        )}
        aria-label={
          added
            ? `${product.name} ajouté au panier`
            : `Ajouter ${product.name} au panier`
        }
      >
        {added ? (
          <Check className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Plus className="h-4 w-4" strokeWidth={1.8} />
        )}
      </button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
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
      <button
        type="button"
        onClick={() => add(quantity)}
        className="btn btn-outline w-full"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" /> Ajouté au panier
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Ajouter au panier
          </>
        )}
      </button>
      <p className="text-xs text-ink-3" aria-live="polite">
        {added
          ? `${quantity} article${quantity > 1 ? "s" : ""} ajouté${quantity > 1 ? "s" : ""} au panier.`
          : product.stock <= 5
            ? `Plus que ${product.stock} en stock.`
            : "En stock — expédié sous 24 à 48 h."}
      </p>
    </div>
  );
}
