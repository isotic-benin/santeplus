import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { Filter, WithId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getEffectivePricing } from "@/lib/pricing";
import { escapeRegex } from "@/lib/utils";
import type {
  Category,
  CategoryDoc,
  Product,
  ProductDoc,
  Promotion,
  PromotionDoc,
} from "@/lib/types";

export interface CatalogueOptions {
  category?: string;
  q?: string;
  sort?: string;
}

export interface CatalogueResult {
  products: Product[];
  categories: Category[];
  total: number;
}

const PRODUCT_TAGS = ["products", "promotions", "categories"] as const;

export function mapPromotion(doc: WithId<PromotionDoc>): Promotion {
  const toISO = (date: Date | string | null | undefined) => {
    if (!date) return "";
    if (date instanceof Date) return date.toISOString();
    // Assume it's already an ISO string
    return date;
  };

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    type: doc.type,
    value: doc.value,
    scope: doc.scope,
    categorySlug: doc.categorySlug,
    productIds: doc.productIds,
    startsAt: toISO(doc.startsAt),
    endsAt: toISO(doc.endsAt),
    active: doc.active,
    createdAt: toISO(doc.createdAt),
    image: doc.image || "", // Added
  };
}

export function mapProduct(
  doc: WithId<ProductDoc>,
  promotions: Promotion[],
  categoryNames: Map<string, string> = new Map(),
): Product {
  const base: Product = {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    details: doc.details ?? [],
    price: doc.price,
    basePrice: doc.price,
    compareAtPrice: doc.compareAtPrice,
    categorySlug: doc.categorySlug,
    categoryName: categoryNames.get(doc.categorySlug),
    images: doc.images,
    stock: doc.stock,
    featured: doc.featured,
    active: doc.active,
    promotionTitle: null,
    createdAt: doc.createdAt.toISOString(),
  };

  const pricing = getEffectivePricing(base, promotions);
  return {
    ...base,
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    promotionTitle: pricing.promotionTitle,
  };
}

async function findLivePromotions(now = new Date()) {
  const db = await getDb();
  const docs = await db
    .collection<PromotionDoc>("promotions")
    .find({
      active: true,
      // $toDate tolère les dates stockées en texte (anciennes promotions)
      // en plus des dates BSON habituelles.
      $expr: {
        $and: [
          {
            $lte: [
              { $convert: { input: "$startsAt", to: "date", onError: null, onNull: null } },
              now,
            ],
          },
          {
            $gte: [
              { $convert: { input: "$endsAt", to: "date", onError: null, onNull: null } },
              now,
            ],
          },
        ],
      },
    })
    .toArray();
  return docs.map(mapPromotion);
}

/* ------------------------------------------------------------------ */
/* Produits                                                            */
/* ------------------------------------------------------------------ */

export async function getCatalogueProducts(
  options: CatalogueOptions = {},
): Promise<CatalogueResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag(...PRODUCT_TAGS);

  const db = await getDb();
  const filter: Filter<ProductDoc> = { active: true };

  if (options.category && options.category !== "tout") {
    filter.categorySlug = options.category;
  }

  if (options.q?.trim()) {
    const regex = new RegExp(escapeRegex(options.q.trim()), "i");
    filter.$or = [
      { name: regex },
      { description: regex },
      { categorySlug: regex },
    ];
  }

  const [docs, promotionDocs, categoryDocs] = await Promise.all([
    db.collection<ProductDoc>("products").find(filter).toArray(),
    db
      .collection<PromotionDoc>("promotions")
      .find({ active: true })
      .toArray(),
    db.collection<CategoryDoc>("categories").find().toArray(),
  ]);

  const promotions = promotionDocs.map(mapPromotion);
  const categoryNames = new Map(categoryDocs.map((c) => [c.slug, c.name]));

  const products = docs.map((doc) => mapProduct(doc, promotions, categoryNames));
  switch (options.sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "name":
      products.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      break;
    default:
      products.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }

  const activeDocs = await db
    .collection<ProductDoc>("products")
    .aggregate<{ _id: string; count: number }>([
      { $match: { active: true } },
      { $group: { _id: "$categorySlug", count: { $sum: 1 } } },
    ])
    .toArray();
  const counts = new Map(activeDocs.map((c) => [c._id, c.count]));

  const categories: Category[] = categoryDocs
    .map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      image: doc.image,
      featured: doc.featured,
      productCount: counts.get(doc.slug) ?? 0,
    }))
    .filter((category) => category.productCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return { products, categories, total: products.length };
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(...PRODUCT_TAGS);

  const db = await getDb();
  const [docs, promotionDocs, categoryDocs] = await Promise.all([
    db
      .collection<ProductDoc>("products")
      .find({ active: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray(),
    db
      .collection<PromotionDoc>("promotions")
      .find({ active: true })
      .toArray(),
    db.collection<CategoryDoc>("categories").find().toArray(),
  ]);

  const promotions = promotionDocs.map(mapPromotion);
  const categoryNames = new Map(categoryDocs.map((c) => [c.slug, c.name]));
  return docs.map((doc) => mapProduct(doc, promotions, categoryNames));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(...PRODUCT_TAGS);

  const db = await getDb();
  const doc = await db
    .collection<ProductDoc>("products")
    .findOne({ slug, active: true });
  if (!doc) return null;

  const promotionDocs = await db
    .collection<PromotionDoc>("promotions")
    .find({ active: true })
    .toArray();
  const category = await db
    .collection<CategoryDoc>("categories")
    .findOne({ slug: doc.categorySlug });

  const categoryNames = category
    ? new Map([[category.slug, category.name]])
    : new Map<string, string>();
  return mapProduct(doc, promotionDocs.map(mapPromotion), categoryNames);
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(...PRODUCT_TAGS);

  const db = await getDb();
  const [docs, promotionDocs, categoryDocs] = await Promise.all([
    db
      .collection<ProductDoc>("products")
      .find({ active: true, categorySlug })
      .limit(limit + 1)
      .toArray(),
    db
      .collection<PromotionDoc>("promotions")
      .find({ active: true })
      .toArray(),
    db.collection<CategoryDoc>("categories").find().toArray(),
  ]);

  const promotions = promotionDocs.map(mapPromotion);
  const categoryNames = new Map(categoryDocs.map((c) => [c.slug, c.name]));
  return docs
    .filter((doc) => doc._id.toString() !== excludeId)
    .slice(0, limit)
    .map((doc) => mapProduct(doc, promotions, categoryNames));
}

/* ------------------------------------------------------------------ */
/* Catégories & promotions                                             */
/* ------------------------------------------------------------------ */

export async function getCategories(onlyWithProducts = true): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(...PRODUCT_TAGS);

  const db = await getDb();
  const [docs, counts] = await Promise.all([
    db.collection<CategoryDoc>("categories").find().toArray(),
    db
      .collection<ProductDoc>("products")
      .aggregate<{ _id: string; count: number }>([
        { $match: { active: true } },
        { $group: { _id: "$categorySlug", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  return docs
    .map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      image: doc.image,
      featured: doc.featured,
      productCount: countMap.get(doc.slug) ?? 0,
    }))
    .filter((category) => !onlyWithProducts || category.productCount > 0)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.name.localeCompare(b.name, "fr");
    });
}

export async function getActivePromotionBanner(): Promise<Promotion | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("promotions", "products");

  const promotions = await findLivePromotions();
  if (promotions.length === 0) return null;
  return (
    promotions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0] ?? null
  );
}

/**
 * Toutes les promotions en cours, les plus récentes d'abord.
 * Sert au carousel de la page d'accueil.
 */
export async function getActivePromotionBanners(): Promise<Promotion[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("promotions", "products");

  const promotions = await findLivePromotions();
  return promotions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
