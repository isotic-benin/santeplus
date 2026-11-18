import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(6, "Mot de passe trop court."),
});

export const customerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom complet.")
    .max(120, "Nom trop long."),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9][0-9\s().-]{5,19}$/,
      "Numéro de téléphone invalide (ex. +229 01 00 00 00 00).",
    ),
  email: z
    .union([z.literal(""), z.email("Adresse e-mail invalide.")])
    .transform((value) => value.trim()),
  address: z
    .string()
    .trim()
    .min(5, "Indiquez une adresse de livraison complète.")
    .max(300, "Adresse trop longue."),
  city: z.string().trim().min(2, "Indiquez votre ville.").max(80),
  notes: z.string().trim().max(500, "Note trop longue.").optional().default(""),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis.").max(120),
  slug: z.string().trim().max(140).optional().default(""),
  description: z
    .string()
    .trim()
    .min(20, "La description doit faire au moins 20 caractères.")
    .max(4000),
  details: z.string().trim().max(2000).optional().default(""),
  price: z.coerce.number().min(0, "Prix invalide.").max(100_000_000),
  compareAtPrice: z
    .union([z.literal(""), z.coerce.number().min(0).max(100_000_000)])
    .optional()
    .default(""),
  categorySlug: z.string().trim().min(1, "Choisissez une catégorie."),
  images: z
    .string()
    .trim()
    .min(1, "Ajoutez au moins une URL d'image.")
    .max(3000),
  stock: z.coerce.number().int().min(0, "Stock invalide.").max(100_000),
  featured: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(false),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis.").max(80),
  slug: z.string().trim().max(100).optional().default(""),
  description: z
    .string()
    .trim()
    .min(10, "Ajoutez une courte description.")
    .max(500),
  image: z.string().trim().min(1, "Ajoutez une URL d'image.").max(1000),
  featured: z.coerce.boolean().optional().default(false),
});

export const promotionSchema = z
  .object({
    title: z.string().trim().min(2, "Le titre est requis.").max(120),
    description: z.string().trim().max(500).optional().default(""),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().min(1, "Valeur invalide.").max(100_000_000),
    scope: z.enum(["all", "category", "products"]),
    categorySlug: z.string().trim().optional().default(""),
    productIds: z.array(z.string()).optional().default([]),
    startsAt: z.string().min(1, "Date de début requise."),
    endsAt: z.string().min(1, "Date de fin requise."),
    active: z.coerce.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.type === "percent" && data.value > 90) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "La remise en pourcentage ne peut pas dépasser 90 %.",
      });
    }
    if (data.scope === "category" && !data.categorySlug) {
      ctx.addIssue({
        code: "custom",
        path: ["categorySlug"],
        message: "Choisissez une catégorie.",
      });
    }
    if (data.scope === "products" && data.productIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["productIds"],
        message: "Choisissez au moins un produit.",
      });
    }
    const start = new Date(data.startsAt).getTime();
    const end = new Date(data.endsAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Dates invalides.",
      });
    } else if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "La date de fin doit être après la date de début.",
      });
    }
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.email("Adresse e-mail invalide."),
  phone: z.string().trim().max(30).optional().default(""),
  subject: z.string().trim().min(2, "Indiquez un sujet.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Votre message doit faire au moins 10 caractères.")
    .max(3000),
  website: z.string().optional().default(""),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    (result[key] ??= []).push(issue.message);
  }
  return result;
}
