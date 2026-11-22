import type { ObjectId } from "mongodb";

/* ------------------------------------------------------------------ */
/* Produits                                                            */
/* ------------------------------------------------------------------ */

export interface ProductDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  details: string[];
  price: number;
  compareAtPrice: number | null;
  categorySlug: string;
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  /** Prix réellement facturé (promotion appliquée). */
  price: number;
  /** Prix de base saisi par l'admin. */
  basePrice: number;
  compareAtPrice: number | null;
  categorySlug: string;
  categoryName?: string;
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  promotionTitle: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Catégories                                                          */
/* ------------------------------------------------------------------ */

export interface CategoryDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  productCount: number;
}

/* ------------------------------------------------------------------ */
/* Promotions                                                          */
/* ------------------------------------------------------------------ */

export type PromotionType = "percent" | "fixed";
export type PromotionScope = "all" | "category" | "products";

export interface PromotionDoc {
  _id: ObjectId;
  title: string;
  description: string;
  type: PromotionType;
  value: number;
  scope: PromotionScope;
  categorySlug: string | null;
  productIds: string[];
  startsAt: Date;
  endsAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  image: string; // Added for hero banner
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  value: number;
  scope: PromotionScope;
  categorySlug: string | null;
  productIds: string[];
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdAt: string;
  image: string; // Added for hero banner
}

export type PromotionStatus = "active" | "scheduled" | "expired" | "paused";

/* ------------------------------------------------------------------ */
/* Commandes                                                           */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

export interface OrderDoc {
  _id: ObjectId;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  adminNote: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Messages de contact                                                 */
/* ------------------------------------------------------------------ */

export interface ContactMessageDoc {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export interface AdminUserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

/* ------------------------------------------------------------------ */
/* Panier & formulaires                                                */
/* ------------------------------------------------------------------ */

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

/** Produit commandé directement depuis sa fiche, sans passer par le panier. */
export interface DirectCheckoutItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Prix effective facturé (promotions incluses). */
  price: number;
  stock: number;
  quantity: number;
}

export interface ActionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export interface PlaceOrderState extends ActionState {
  orderNumber?: string;
}
