import { siteConfig } from "@/lib/config";
import type { OrderStatus, Promotion, PromotionStatus } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; className: string; step: number }
> = {
  pending: {
    label: "En attente",
    className: "status-pending",
    step: 1,
  },
  confirmed: {
    label: "Confirmée",
    className: "status-confirmed",
    step: 2,
  },
  shipped: {
    label: "Expédiée",
    className: "status-shipped",
    step: 3,
  },
  delivered: {
    label: "Livrée",
    className: "status-delivered",
    step: 4,
  },
  cancelled: {
    label: "Annulée",
    className: "status-cancelled",
    step: 0,
  },
};

export const orderStatuses = Object.keys(orderStatusMeta) as OrderStatus[];

export function getPromotionStatus(
  promotion: Pick<Promotion, "active" | "startsAt" | "endsAt">,
  now = new Date(),
): PromotionStatus {
  if (!promotion.active) return "paused";
  const start = new Date(promotion.startsAt).getTime();
  const end = new Date(promotion.endsAt).getTime();
  if (now.getTime() < start) return "scheduled";
  if (now.getTime() > end) return "expired";
  return "active";
}

export const promotionStatusMeta: Record<
  PromotionStatus,
  { label: string; className: string }
> = {
  active: { label: "En cours", className: "status-delivered" },
  scheduled: { label: "Planifiée", className: "status-shipped" },
  expired: { label: "Terminée", className: "status-cancelled" },
  paused: { label: "En pause", className: "status-pending" },
};

export function toDateInput(value: string | Date) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
