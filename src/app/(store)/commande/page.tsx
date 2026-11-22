import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getProductBySlug } from "@/lib/data";
import type { DirectCheckoutItem } from "@/lib/types";

// La page lit `searchParams` (achat direct depuis une fiche produit) : elle
// est donc rendue à la demande, comme la page de confirmation.
export const instant = false;

export const metadata: Metadata = {
  title: "Commander",
  description:
    "Renseignez votre adresse de livraison. Paiement à la réception de votre commande.",
  robots: { index: false, follow: false },
};

interface SearchParams {
  produit?: string | string[];
  quantite?: string | string[];
}

function clampQuantity(requested: string | string[] | undefined, stock: number) {
  const value = typeof requested === "string" ? Number(requested) : 1;
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(20, Math.floor(value), stock));
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { produit, quantite } = await searchParams;
  const slug = typeof produit === "string" ? produit : null;

  let directItem: DirectCheckoutItem | null = null;
  if (slug) {
    const product = await getProductBySlug(slug);
    if (product && product.stock > 0) {
      directItem = {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "/placeholder.svg",
        price: product.price,
        stock: product.stock,
        quantity: clampQuantity(quantite, product.stock),
      };
    }
  }

  return (
    <CheckoutForm
      key={directItem ? `direct-${directItem.slug}` : "empty"}
      directItem={directItem ?? undefined}
      productUnavailable={Boolean(slug) && !directItem}
    />
  );
}
