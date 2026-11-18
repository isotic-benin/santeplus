import "server-only";

import { connection } from "next/server";
import { ObjectId, type Filter } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { mapProduct, mapPromotion } from "@/lib/data";
import type {
  Category,
  CategoryDoc,
  ContactMessage,
  ContactMessageDoc,
  Order,
  OrderDoc,
  OrderStatus,
  Product,
  ProductDoc,
  Promotion,
  PromotionDoc,
} from "@/lib/types";

export function mapOrder(doc: OrderDoc & { _id: ObjectId }): Order {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    customer: doc.customer,
    items: doc.items,
    subtotal: doc.subtotal,
    shippingFee: doc.shippingFee,
    total: doc.total,
    status: doc.status,
    adminNote: doc.adminNote ?? "",
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function getPromotionsAndCategoryNames() {
  const db = await getDb();
  const [promotionDocs, categoryDocs] = await Promise.all([
    db.collection<PromotionDoc>("promotions").find().toArray(),
    db.collection<CategoryDoc>("categories").find().toArray(),
  ]);
  return {
    promotions: promotionDocs.map(mapPromotion),
    categoryNames: new Map(categoryDocs.map((c) => [c.slug, c.name])),
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  await connection();

  const db = await getDb();
  const [docs, context] = await Promise.all([
    db
      .collection<ProductDoc>("products")
      .find()
      .sort({ createdAt: -1 })
      .toArray(),
    getPromotionsAndCategoryNames(),
  ]);
  return docs.map((doc) =>
    mapProduct(doc, context.promotions, context.categoryNames),
  );
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  await connection();
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<ProductDoc>("products")
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  const context = await getPromotionsAndCategoryNames();
  return mapProduct(doc, context.promotions, context.categoryNames);
}

export async function getAdminCategories(): Promise<Category[]> {
  await connection();

  const db = await getDb();
  const [docs, counts] = await Promise.all([
    db
      .collection<CategoryDoc>("categories")
      .find()
      .sort({ name: 1 })
      .toArray(),
    db
      .collection<ProductDoc>("products")
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$categorySlug", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    image: doc.image,
    featured: doc.featured,
    productCount: countMap.get(doc.slug) ?? 0,
  }));
}

export async function getAdminPromotions(): Promise<Promotion[]> {
  await connection();

  const db = await getDb();
  const docs = await db
    .collection<PromotionDoc>("promotions")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(mapPromotion);
}

export async function getAdminPromotionById(
  id: string,
): Promise<Promotion | null> {
  await connection();
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<PromotionDoc>("promotions")
    .findOne({ _id: new ObjectId(id) });
  return doc ? mapPromotion(doc) : null;
}

export async function getProductOptions() {
  await connection();

  const db = await getDb();
  const docs = await db
    .collection<ProductDoc>("products")
    .find({}, { projection: { name: 1, slug: 1, categorySlug: 1 } })
    .sort({ name: 1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    categorySlug: doc.categorySlug,
  }));
}

/* ------------------------------------------------------------------ */
/* Commandes                                                           */
/* ------------------------------------------------------------------ */

export async function getAdminOrders(filters?: {
  status?: string;
  q?: string;
}): Promise<Order[]> {
  await connection();

  const db = await getDb();
  const filter: Filter<OrderDoc> = {};

  if (
    filters?.status &&
    ["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
      filters.status,
    )
  ) {
    filter.status = filters.status as OrderStatus;
  }

  if (filters?.q?.trim()) {
    const term = filters.q.trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { orderNumber: regex },
      { "customer.fullName": regex },
      { "customer.phone": regex },
      { "customer.city": regex },
    ];
  }

  const docs = await db
    .collection<OrderDoc>("orders")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(mapOrder);
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  await connection();
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<OrderDoc>("orders")
    .findOne({ _id: new ObjectId(id) });
  return doc ? mapOrder(doc) : null;
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<Order | null> {
  await connection();

  const db = await getDb();
  const doc = await db
    .collection<OrderDoc>("orders")
    .findOne({ orderNumber });
  return doc ? mapOrder(doc) : null;
}

export async function getDashboardData() {
  // Données de pilotage : toujours lues à la requête, jamais figées au build.
  await connection();

  const db = await getDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const [
    totalOrders,
    pendingOrders,
    monthOrders,
    revenueAgg,
    monthRevenueAgg,
    productCount,
    lowStockDocs,
    recentDocs,
    weekDocs,
    activePromotions,
    unreadMessages,
    categoryCount,
  ] = await Promise.all([
    db.collection<OrderDoc>("orders").countDocuments(),
    db
      .collection<OrderDoc>("orders")
      .countDocuments({ status: { $in: ["pending", "confirmed"] } }),
    db
      .collection<OrderDoc>("orders")
      .countDocuments({ createdAt: { $gte: startOfMonth } }),
    db
      .collection<OrderDoc>("orders")
      .aggregate<{ total: number }>([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])
      .toArray(),
    db
      .collection<OrderDoc>("orders")
      .aggregate<{ total: number }>([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])
      .toArray(),
    db.collection<ProductDoc>("products").countDocuments(),
    db
      .collection<ProductDoc>("products")
      .find({ active: true, stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(6)
      .toArray(),
    db
      .collection<OrderDoc>("orders")
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray(),
    db
      .collection<OrderDoc>("orders")
      .find({ createdAt: { $gte: startOfWeek } })
      .toArray(),
    db
      .collection<PromotionDoc>("promotions")
      .countDocuments({
        active: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      }),
    db
      .collection<ContactMessageDoc>("messages")
      .countDocuments({ read: false }),
    db.collection<CategoryDoc>("categories").countDocuments(),
  ]);

  const days: Array<{ key: string; label: string; count: number; total: number }> =
    [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("fr-FR", { weekday: "short" })
        .format(date)
        .replace(".", ""),
      count: 0,
      total: 0,
    });
  }
  for (const doc of weekDocs) {
    const key = doc.createdAt.toISOString().slice(0, 10);
    const day = days.find((d) => d.key === key);
    if (day && doc.status !== "cancelled") {
      day.count += 1;
      day.total += doc.total;
    }
  }

  return {
    totalOrders,
    pendingOrders,
    monthOrders,
    revenue: revenueAgg[0]?.total ?? 0,
    monthRevenue: monthRevenueAgg[0]?.total ?? 0,
    productCount,
    categoryCount,
    activePromotions,
    unreadMessages,
    lowStock: lowStockDocs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      stock: doc.stock,
      slug: doc.slug,
    })),
    recentOrders: recentDocs.map(mapOrder),
    week: days,
  };
}

export async function getAdminBadges() {
  // Les compteurs de la barre latérale doivent refléter l'état courant.
  await connection();

  const db = await getDb();
  const [unreadMessages, pendingOrders] = await Promise.all([
    db.collection<ContactMessageDoc>("messages").countDocuments({ read: false }),
    db
      .collection<OrderDoc>("orders")
      .countDocuments({ status: { $in: ["pending", "confirmed"] } }),
  ]);
  return { unreadMessages, pendingOrders };
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export async function getAdminMessages(): Promise<ContactMessage[]> {
  await connection();

  const db = await getDb();
  const docs = await db
    .collection<ContactMessageDoc>("messages")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    subject: doc.subject,
    message: doc.message,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  }));
}
