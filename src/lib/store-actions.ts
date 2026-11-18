"use server";

import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { updateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { mapPromotion } from "@/lib/data";
import { computeShipping, getEffectivePricing } from "@/lib/pricing";
import { siteConfig } from "@/lib/config";
import {
  cartItemSchema,
  contactSchema,
  customerSchema,
  fieldErrors,
} from "@/lib/validators";
import type {
  ActionState,
  ContactMessageDoc,
  OrderDoc,
  OrderItem,
  PlaceOrderState,
  ProductDoc,
  PromotionDoc,
} from "@/lib/types";

const cartSchema = z.array(cartItemSchema).min(1, "Votre panier est vide.");

export async function placeOrder(
  _prev: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  const customerParsed = customerSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!customerParsed.success) {
    return { ok: false, fieldErrors: fieldErrors(customerParsed.error) };
  }

  let rawCart: unknown;
  try {
    rawCart = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { ok: false, error: "Votre panier est invalide. Rechargez la page." };
  }

  const cartParsed = cartSchema.safeParse(rawCart);
  if (!cartParsed.success) {
    return { ok: false, error: "Votre panier est vide ou invalide." };
  }

  const grouped = new Map<string, number>();
  for (const item of cartParsed.data) {
    if (!ObjectId.isValid(item.productId)) continue;
    grouped.set(
      item.productId,
      Math.min(20, (grouped.get(item.productId) ?? 0) + item.quantity),
    );
  }
  if (grouped.size === 0) {
    return { ok: false, error: "Votre panier est vide." };
  }

  const db = await getDb();
  const products = db.collection<ProductDoc>("products");
  const orders = db.collection<OrderDoc>("orders");

  const ids = [...grouped.keys()].map((id) => new ObjectId(id));
  const [docs, promotionDocs] = await Promise.all([
    products.find({ _id: { $in: ids }, active: true }).toArray(),
    db.collection<PromotionDoc>("promotions").find({ active: true }).toArray(),
  ]);

  const promotions = promotionDocs.map(mapPromotion);
  const productMap = new Map(docs.map((doc) => [doc._id.toString(), doc]));

  const items: OrderItem[] = [];
  for (const [productId, quantity] of grouped) {
    const doc = productMap.get(productId);
    if (!doc) {
      return {
        ok: false,
        error:
          "Un produit de votre panier n'est plus disponible. Retirez-le puis réessayez.",
      };
    }
    if (doc.stock < quantity) {
      return {
        ok: false,
        error: `Stock insuffisant pour « ${doc.name} » (${doc.stock} restant${doc.stock > 1 ? "s" : ""}).`,
      };
    }

    const visible = {
      id: doc._id.toString(),
      categorySlug: doc.categorySlug,
      basePrice: doc.price,
      compareAtPrice: doc.compareAtPrice,
    };
    const pricing = getEffectivePricing(visible, promotions);

    items.push({
      productId,
      name: doc.name,
      slug: doc.slug,
      image: doc.images[0] ?? "",
      unitPrice: pricing.price,
      quantity,
      lineTotal: pricing.price * quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = computeShipping(
    subtotal,
    siteConfig.freeShippingThreshold,
    siteConfig.shippingFee,
  );
  const total = subtotal + shippingFee;
  const orderNumber = `MAJOR-${randomBytes(4).toString("hex").toUpperCase()}`;
  const now = new Date();

  const decremented: Array<{ id: ObjectId; quantity: number }> = [];
  let stockError: string | null = null;

  try {
    for (const item of items) {
      const result = await products.updateOne(
        {
          _id: new ObjectId(item.productId),
          active: true,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
      );
      if (result.modifiedCount !== 1) {
        stockError = `Stock insuffisant pour « ${item.name} ».`;
        break;
      }
      decremented.push({
        id: new ObjectId(item.productId),
        quantity: item.quantity,
      });
    }

    if (stockError) {
      await Promise.all(
        decremented.map((entry) =>
          products.updateOne(
            { _id: entry.id },
            { $inc: { stock: entry.quantity } },
          ),
        ),
      );
      return { ok: false, error: stockError };
    }

    await orders.insertOne({
      _id: new ObjectId(),
      orderNumber,
      customer: customerParsed.data,
      items,
      subtotal,
      shippingFee,
      total,
      status: "pending",
      adminNote: "",
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    await Promise.all(
      decremented.map((entry) =>
        products.updateOne(
          { _id: entry.id },
          { $inc: { stock: entry.quantity } },
        ),
      ),
    );
    console.error("Erreur lors de la création de la commande", error);
    return {
      ok: false,
      error:
        "Impossible d'enregistrer la commande pour le moment. Merci de réessayer.",
    };
  }

  updateTag("products");
  return { ok: true, orderNumber };
}

export async function submitContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  if (parsed.data.website) {
    return { ok: true, message: "Merci, votre message a bien été envoyé." };
  }

  const db = await getDb();
  await db.collection<ContactMessageDoc>("messages").insertOne({
    _id: new ObjectId(),
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? "",
    subject: parsed.data.subject,
    message: parsed.data.message,
    read: false,
    createdAt: new Date(),
  });

  return {
    ok: true,
    message:
      "Merci ! Votre message est bien arrivé. Nous vous répondons sous 24 h ouvrées.",
  };
}
