"use server";

import { ObjectId } from "mongodb";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  categorySchema,
  fieldErrors,
  orderStatusSchema,
  productSchema,
  promotionSchema,
} from "@/lib/validators";
import { deleteBlobImage, deleteBlobImages } from "@/lib/uploads";
import {
  isImageInFolder,
  pathnameFromManagedUrl,
  type ImageFolder,
} from "@/lib/image-rules";
import { orderStatusMeta, slugify } from "@/lib/utils";
import type {
  ActionState,
  CategoryDoc,
  OrderDoc,
  OrderStatus,
  ProductDoc,
  PromotionDoc,
} from "@/lib/types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

/** Visuels historiques livrés avec le site (public/catalogue/...). */
const LOCAL_IMAGE_PREFIX = "/catalogue/";

/**
 * Vrai si l'URL est hébergée par nous : soit un fichier du catalogue local,
 * soit une image du store Blob dans le dossier attendu. Une URL externe est
 * refusée : le formulaire ne doit envoyer que des images envoyées par
 * l'administration elle-même.
 */
function isAcceptableImage(url: string, folder: ImageFolder) {
  if (url.startsWith(LOCAL_IMAGE_PREFIX)) return true;
  const pathname = pathnameFromManagedUrl(url);
  return Boolean(pathname && isImageInFolder(pathname, folder));
}

/**
 * Récupère les URL d'images déjà envoyées au store par le navigateur
 * (`champ caché imageUrls`). Retourne `null` si une URL est invalide.
 */
function uploadedImageUrls(
  formData: FormData,
  key: string,
  folder: ImageFolder,
): string[] | null {
  const urls = formData.getAll(key).map(String).filter(Boolean);
  const valid: string[] = [];
  for (const url of urls) {
    if (!isAcceptableImage(url, folder)) return null;
    if (!valid.includes(url)) valid.push(url);
  }
  return valid;
}

function invalidateCatalogue() {
  updateTag("products");
  updateTag("categories");
  updateTag("promotions");
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/produits");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/promotions");
  revalidatePath("/admin/commandes");
  revalidatePath("/admin/messages");
}

/* ------------------------------------------------------------------ */
/* Produits                                                             */
/* ------------------------------------------------------------------ */

export async function saveProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = text(formData, "id");

  // Récupération des champs texte
  const name = text(formData, "name");
  const slug = text(formData, "slug");
  const description = text(formData, "description");
  const price = text(formData, "price");
  const compareAtPrice = text(formData, "compareAtPrice");
  const categorySlug = text(formData, "categorySlug");
  const stock = text(formData, "stock");
  const featured = checked(formData, "featured");
  const active = checked(formData, "active");

  const slugFinal = slugify(slug || name);
  if (!slugFinal) {
    return {
      ok: false,
      fieldErrors: { slug: ["Impossible de générer un slug valide."] },
    };
  }

  const db = await getDb();
  const products = db.collection<ProductDoc>("products");

  // Édition : on charge le document existant pour conserver ou nettoyer
  // les images que l'admin n'a pas remplacées.
  let existing: ProductDoc | null = null;
  if (id) {
    if (!ObjectId.isValid(id)) {
      return { ok: false, error: "Produit introuvable." };
    }
    existing = await products.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return { ok: false, error: "Produit introuvable." };
    }
  }

  // Images déjà enregistrées que l'admin conserve (champs cachés du formulaire).
  const keptImages = formData
    .getAll("existingImages")
    .map(String)
    .filter((url) => url && isAcceptableImage(url, "produits"));

  // --- IMAGES : déjà envoyées au store par le navigateur ---
  // Aucun fichier ne transite par cette action : les photos sont envoyées
  // directement du navigateur vers Vercel Blob (limite de 4,5 Mo des fonctions
  // Vercel). Le formulaire ne transmet que les URL obtenues.
  const submitted = uploadedImageUrls(formData, "imageUrls", "produits");
  if (!submitted) {
    return {
      ok: false,
      fieldErrors: { images: ["Une des images envoyées est invalide."] },
    };
  }

  const images = [...new Set([...keptImages, ...submitted])];

  if (images.length === 0) {
    return {
      ok: false,
      fieldErrors: { images: ["Ajoutez au moins une image."] },
    };
  }

  const parsed = productSchema.safeParse({
    name,
    slug,
    description,
    price,
    compareAtPrice,
    categorySlug,
    images: images.join("\n"),
    stock,
    featured,
    active,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const compareAtPriceNum =
    data.compareAtPrice === "" ? null : Number(data.compareAtPrice);

  if (compareAtPriceNum !== null && compareAtPriceNum <= Number(data.price)) {
    return {
      ok: false,
      fieldErrors: {
        compareAtPrice: [
          "Le prix barré doit être supérieur au prix de vente.",
        ],
      },
    };
  }

  const category = await db
    .collection<CategoryDoc>("categories")
    .findOne({ slug: data.categorySlug });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categorySlug: ["Catégorie introuvable."] },
    };
  }

  const duplicate = await products.findOne({
    slug: slugFinal,
    ...(existing ? { _id: { $ne: existing._id } } : {}),
  });
  if (duplicate) {
    return {
      ok: false,
      fieldErrors: {
        slug: ["Ce slug est déjà utilisé par un autre produit."],
      },
    };
  }

  const now = new Date();
  const document = {
    name: data.name,
    slug: slugFinal,
    description: data.description,
    details: [],
    price: Number(data.price),
    compareAtPrice: compareAtPriceNum,
    categorySlug: data.categorySlug,
    images,
    stock: Number(data.stock),
    featured: data.featured ?? false,
    active: data.active ?? false,
    updatedAt: now,
  };

  try {
    if (existing) {
      await products.updateOne({ _id: existing._id }, { $set: document });
    } else {
      await products.insertOne({
        _id: new ObjectId(),
        ...document,
        createdAt: now,
      });
    }
  } catch (error) {
    console.error("Erreur produit", error);
    return {
      ok: false,
      error: "Impossible d'enregistrer le produit.",
    };
  }

  // Les images retirées lors de l'édition sont supprimées du store, pour ne
  // pas accumuler de fichiers orphelins (les chemins locaux sont ignorés).
  if (existing) {
    await deleteBlobImages(
      existing.images.filter((url) => !images.includes(url)),
    );
  }

  invalidateCatalogue();
  revalidateAdmin();
  return { ok: true, message: "Produit enregistré." };
}

/* ------------------------------------------------------------------ */
/* Catégories                                                          */
/* ------------------------------------------------------------------ */

export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = text(formData, "id");

  const name = text(formData, "name");
  const slug = text(formData, "slug");
  const description = text(formData, "description");
  const featured = checked(formData, "featured");

  const slugFinal = slugify(slug || name);
  if (!slugFinal) {
    return {
      ok: false,
      fieldErrors: { slug: ["Impossible de générer un slug valide."] },
    };
  }

  const db = await getDb();
  const categories = db.collection<CategoryDoc>("categories");

  let existing: CategoryDoc | null = null;
  if (id) {
    if (!ObjectId.isValid(id)) {
      return { ok: false, error: "Catégorie introuvable." };
    }
    existing = await categories.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return { ok: false, error: "Catégorie introuvable." };
    }
  }

  // --- IMAGE : déjà envoyée au store par le navigateur ---
  // (upload direct, cf. src/lib/client-upload.ts ; aucun fichier ici).
  const submitted = uploadedImageUrls(formData, "imageUrl", "categories");
  if (!submitted) {
    return {
      ok: false,
      fieldErrors: { image: ["L'image envoyée est invalide."] },
    };
  }
  const uploadedUrl = submitted[0];

  // Édition sans nouvelle image : on conserve l'image existante.
  const image = uploadedUrl ?? existing?.image ?? "";
  if (!image) {
    return {
      ok: false,
      fieldErrors: { image: ["Ajoutez une image pour la catégorie."] },
    };
  }

  const parsed = categorySchema.safeParse({
    name,
    slug,
    description,
    image,
    featured,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  const duplicate = await categories.findOne({
    slug: slugFinal,
    ...(existing ? { _id: { $ne: existing._id } } : {}),
  });
  if (duplicate) {
    return {
      ok: false,
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const now = new Date();
  const document = {
    name: data.name,
    slug: slugFinal,
    description: data.description,
    image,
    featured: data.featured ?? false,
    updatedAt: now,
  };

  try {
    if (existing) {
      await categories.updateOne({ _id: existing._id }, { $set: document });
      if (existing.slug !== slugFinal) {
        await db
          .collection<ProductDoc>("products")
          .updateMany(
            { categorySlug: existing.slug },
            { $set: { categorySlug: slugFinal } },
          );
      }
    } else {
      await categories.insertOne({
        _id: new ObjectId(),
        ...document,
        createdAt: now,
      });
    }
  } catch (error) {
    console.error("Erreur catégorie", error);
    return { ok: false, error: "Impossible d'enregistrer la catégorie." };
  }

  // Ancienne image remplacée : supprimée du store.
  if (existing && image !== existing.image) {
    await deleteBlobImage(existing.image);
  }

  invalidateCatalogue();
  revalidateAdmin();
  return { ok: true, message: "Catégorie enregistrée." };
}

/* ------------------------------------------------------------------ */
/* Promotions, Commandes, Messages... (inchangés)                     */
/* ------------------------------------------------------------------ */

export async function deleteProduct(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = text(formData, "id");
  if (!ObjectId.isValid(id)) redirect("/admin/produits?error=Produit+introuvable");

  const db = await getDb();
  const products = db.collection<ProductDoc>("products");
  const deleted = await products.findOne({ _id: new ObjectId(id) });
  await products.deleteOne({ _id: new ObjectId(id) });
  if (deleted) await deleteBlobImages(deleted.images ?? []);
  invalidateCatalogue();
  revalidateAdmin();
  redirect("/admin/produits");
}

export async function updateOrderStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = text(formData, "id");
  const parsed = orderStatusSchema.safeParse({
    status: text(formData, "status"),
  });

  if (!parsed.success || !ObjectId.isValid(id)) {
    return { ok: false, error: "Statut ou commande invalide." };
  }

  const db = await getDb();
  const orders = db.collection<OrderDoc>("orders");
  const order = await orders.findOne({ _id: new ObjectId(id) });
  if (!order) return { ok: false, error: "Commande introuvable." };

  const nextStatus = parsed.data.status as OrderStatus;
  if (order.status === nextStatus) {
    return { ok: true, message: "Statut inchangé." };
  }

  if (order.status === "cancelled" && nextStatus !== "cancelled") {
    return {
      ok: false,
      error:
        "Une commande annulée ne peut pas être réactivée. Créez une nouvelle commande si besoin.",
    };
  }

  if (nextStatus === "cancelled") {
    await Promise.all(
      order.items.map((item) => {
        if (!ObjectId.isValid(item.productId)) return Promise.resolve();
        return db
          .collection<ProductDoc>("products")
          .updateOne(
            { _id: new ObjectId(item.productId) },
            { $inc: { stock: item.quantity } },
          );
      }),
    );
  }

  await orders.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: nextStatus, updatedAt: new Date() } },
  );

  revalidatePath(`/admin/commandes/${id}`);
  revalidateAdmin();
  revalidatePath(`/commande/confirmation/${order.orderNumber}`);
  return {
    ok: true,
    message: `Statut mis à jour : ${orderStatusMeta[nextStatus].label}.`,
  };
}

export async function saveOrderNote(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = text(formData, "id");
  const note = text(formData, "adminNote").slice(0, 2000);
  if (!ObjectId.isValid(id)) {
    return { ok: false, error: "Commande introuvable." };
  }
  await (await getDb())
    .collection<OrderDoc>("orders")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { adminNote: note, updatedAt: new Date() } },
    );
  revalidatePath(`/admin/commandes/${id}`);
  return { ok: true, message: "Note enregistrée." };
}

export async function toggleMessageRead(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = text(formData, "id");
  if (!ObjectId.isValid(id)) redirect("/admin/messages");
  const db = await getDb();
  const message = await db
    .collection("messages")
    .findOne({ _id: new ObjectId(id) });
  if (message) {
    await db
      .collection("messages")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { read: !message.read } },
      );
  }
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  redirect("/admin/messages");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = text(formData, "id");
  if (!ObjectId.isValid(id)) redirect("/admin/messages");
  await (await getDb())
    .collection("messages")
    .deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  redirect("/admin/messages");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = text(formData, "id");
  if (!ObjectId.isValid(id)) redirect("/admin/categories?error=Cat%C3%A9gorie+introuvable");

  const db = await getDb();
  const categories = db.collection<CategoryDoc>("categories");
  const deleted = await categories.findOne({ _id: new ObjectId(id) });
  await categories.deleteOne({ _id: new ObjectId(id) });
  if (deleted) await deleteBlobImage(deleted.image);
  invalidateCatalogue();
  revalidateAdmin();
  redirect("/admin/categories");
}

export async function deletePromotion(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = text(formData, "id");
  if (!ObjectId.isValid(id)) redirect("/admin/promotions?error=Promotion+introuvable");

  const db = await getDb();
  const promotions = db.collection<PromotionDoc>("promotions");
  const deleted = await promotions.findOne({ _id: new ObjectId(id) });
  await promotions.deleteOne({ _id: new ObjectId(id) });
  if (deleted) await deleteBlobImage(deleted.image);
  invalidateCatalogue();
  revalidateAdmin();
  redirect("/admin/promotions");
}

/**
 * Supprime du store une image envoyée puis retirée du formulaire avant
 * l'enregistrement. Évite d'accumuler des fichiers orphelins.
 */
export async function discardUpload(url: string): Promise<void> {
  await assertAdmin();
  await deleteBlobImage(url);
}

export async function savePromotion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = text(formData, "id");

  const title = text(formData, "title");
  const description = text(formData, "description");
  const type = text(formData, "type");
  const value = text(formData, "value");
  const scope = text(formData, "scope");
  const categorySlug = text(formData, "categorySlug");
  const startsAt = text(formData, "startsAt");
  const endsAt = text(formData, "endsAt");
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);
  // Keep as strings for schema validation; superRefine internally converts to Date
  const active = checked(formData, "active");

  const parsed = promotionSchema.safeParse({
    title,
    description,
    type: type as "percent" | "fixed",
    value: value ? Number(value) : undefined,
    scope,
    categorySlug,
    productIds,
    startsAt: startsAt,
    endsAt: endsAt,
    active,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  const db = await getDb();

  // --- IMAGE : déjà envoyée au store par le navigateur ---
  // (upload direct, cf. src/lib/client-upload.ts ; aucun fichier ici).
  const submitted = uploadedImageUrls(formData, "imageUrl", "promotions");
  if (!submitted) {
    return {
      ok: false,
      fieldErrors: { promotionImage: ["L'image envoyée est invalide."] },
    };
  }
  const uploadedUrl = submitted[0];

  // Édition sans nouvelle image : on conserve l'image existante.
  let previousImage = "";
  if (id && ObjectId.isValid(id)) {
    const existing = await db
      .collection<PromotionDoc>("promotions")
      .findOne({ _id: new ObjectId(id) }, { projection: { image: 1 } });
    previousImage = existing?.image ?? "";
  }

  const image = uploadedUrl ?? previousImage;

  if (!image) {
    return {
      ok: false,
      fieldErrors: {
        promotionImage: ["Ajoutez une image pour la promotion."],
      },
    };
  }
  if (data.scope === "category") {
    const category = await db
      .collection<CategoryDoc>("categories")
      .findOne({ slug: data.categorySlug });
    if (!category) {
      return {
        ok: false,
        fieldErrors: { categorySlug: ["Catégorie introuvable."] },
      };
    }
  }

  if (data.scope === "products") {
    const products = await db.collection<ProductDoc>("products").find().toArray();
    const validIds = data.productIds.filter((id) =>
      products.some((p) => p._id.toString() === id),
    );
    if (validIds.length !== data.productIds.length) {
      return {
        ok: false,
        error: "Un des produits sélectionnés est invalide.",
      };
    }
  }

  const now = new Date();
  const document = {
    title: data.title,
    description: data.description,
    type: data.type,
    value: data.value,
    scope: data.scope,
    categorySlug: data.scope === "category" ? data.categorySlug : null,
    productIds: data.scope === "products" ? data.productIds : [],
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    active: data.active,
    image, // Added
    updatedAt: now,
  };

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return { ok: false, error: "Promotion introuvable." };
      }
      const result = await db
        .collection<PromotionDoc>("promotions")
        .updateOne({ _id: new ObjectId(id) }, { $set: document });
      if (result.matchedCount === 0) {
        return { ok: false, error: "Promotion introuvable." };
      }
    } else {
      await db.collection<PromotionDoc>("promotions").insertOne({
        _id: new ObjectId(),
        ...document,
        createdAt: now,
      });
    }
  } catch (error) {
    console.error("Erreur promotion", error);
    return { ok: false, error: "Impossible d'enregistrer la promotion." };
  }

  // Ancienne image remplacée : supprimée du store.
  if (uploadedUrl && previousImage && previousImage !== uploadedUrl) {
    await deleteBlobImage(previousImage);
  }

  invalidateCatalogue();
  revalidateAdmin();
  return { ok: true, message: "Promotion enregistrée." };
}