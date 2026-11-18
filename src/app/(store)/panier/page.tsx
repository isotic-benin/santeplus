import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Retrouvez les produits de votre panier avant de commander.",
};

export default function CartPage() {
  return <CartView />;
}
