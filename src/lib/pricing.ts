import type { Product, Promotion } from "@/lib/types";

type PromotionLike = Pick<
  Promotion,
  | "active"
  | "startsAt"
  | "endsAt"
  | "scope"
  | "type"
  | "value"
  | "categorySlug"
  | "productIds"
  | "title"
>;

export function isPromotionLive(promotion: PromotionLike, now = new Date()) {
  if (!promotion.active) return false;
  const start = new Date(promotion.startsAt).getTime();
  const end = new Date(promotion.endsAt).getTime();
  return now.getTime() >= start && now.getTime() <= end;
}

export function promotionApplies(
  promotion: PromotionLike,
  product: Pick<Product, "id" | "categorySlug">,
) {
  if (promotion.scope === "all") return true;
  if (promotion.scope === "category") {
    return promotion.categorySlug === product.categorySlug;
  }
  return promotion.productIds.includes(product.id);
}

export function applyPromotion(
  price: number,
  promotion: PromotionLike,
): number {
  if (promotion.type === "percent") {
    return Math.max(0, Math.round(price * (1 - promotion.value / 100)));
  }
  return Math.max(0, Math.round(price - promotion.value));
}

export interface EffectivePricing {
  price: number;
  compareAtPrice: number | null;
  promotionTitle: string | null;
}

/**
 * Applique la meilleure promotion active à un produit.
 * En cas de promotions cumulables, le client bénéficie du prix le plus bas.
 */
export function getEffectivePricing(
  product: Pick<Product, "id" | "categorySlug" | "basePrice" | "compareAtPrice">,
  promotions: PromotionLike[],
  now = new Date(),
): EffectivePricing {
  const livePromotions = promotions.filter(
    (promotion) =>
      isPromotionLive(promotion, now) && promotionApplies(promotion, product),
  );

  let best: { price: number; promotion: PromotionLike } | null = null;

  for (const promotion of livePromotions) {
    const candidate = applyPromotion(product.basePrice, promotion);
    if (!best || candidate < best.price) {
      best = { price: candidate, promotion };
    }
  }

  if (best && best.price < product.basePrice) {
    return {
      price: best.price,
      compareAtPrice:
        product.compareAtPrice && product.compareAtPrice > product.basePrice
          ? product.compareAtPrice
          : product.basePrice,
      promotionTitle: best.promotion.title,
    };
  }

  return {
    price: product.basePrice,
    compareAtPrice:
      product.compareAtPrice && product.compareAtPrice > product.basePrice
        ? product.compareAtPrice
        : null,
    promotionTitle: null,
  };
}

export function computeShipping(subtotal: number, freeFrom: number, fee: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= freeFrom ? 0 : fee;
}
