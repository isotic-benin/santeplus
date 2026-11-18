import "server-only";

import { del, get } from "@vercel/blob";
import {
  isAllowedImagePathname,
  isManagedImage,
  pathnameFromManagedUrl,
} from "@/lib/image-rules";

/**
 * Accès serveur aux images du catalogue stockées sur Vercel Blob.
 *
 * Les envois se font directement depuis le navigateur (`src/lib/client-upload.ts`
 * et `src/app/api/blob/upload/route.ts`) : aucune fonction Vercel ne reçoit le
 * fichier, ce qui évite la limite de 4,5 Mo sur le corps des requêtes.
 *
 * Ce module ne gère donc que la **lecture** (store privé) et la **suppression**
 * (nettoyage lors du remplacement ou de la suppression d'une fiche).
 *
 * Les chemins historiques (`/catalogue/...`, `/promotions/...`) restent valides :
 * seules les nouvelles images passent par Blob.
 */

/** Vrai si un store Blob est configuré. */
export function isBlobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.BLOB_STORE_ID?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

/** Mode du store : privé par défaut (les URL privées exigent un jeton). */
function storeAccess(): "public" | "private" {
  const value = (
    process.env.BLOB_ACCESS ??
    process.env.NEXT_PUBLIC_BLOB_ACCESS ??
    ""
  )
    .trim()
    .toLowerCase();
  return value === "public" ? "public" : "private";
}

/**
 * Lit un fichier du store pour le relais HTTP (`/api/blob/...`).
 * Retourne `null` si le chemin est hors dossiers autorisés ou introuvable.
 */
export async function readBlobFile(pathname: string) {
  if (!isBlobConfigured()) return null;

  const clean = pathname.replace(/^\/+/, "").split("?")[0];
  if (!isAllowedImagePathname(clean)) return null;

  try {
    return await get(clean, { access: storeAccess() });
  } catch (error) {
    console.error("Erreur de lecture d'un blob", error);
    return null;
  }
}

/**
 * Supprime une image du store. Sans effet pour les chemins locaux
 * (`/catalogue/...`) ou en cas d'échec : le nettoyage ne doit jamais faire
 * échouer une action métier.
 */
export async function deleteBlobImage(url: string | null | undefined) {
  if (!url || !isManagedImage(url) || !isBlobConfigured()) return;

  const pathname = pathnameFromManagedUrl(url);
  if (!pathname || !isAllowedImagePathname(pathname)) return;

  try {
    // Le chemin fonctionne pour un store public comme privé.
    await del(pathname);
  } catch (error) {
    console.error("Erreur de suppression d'un blob", error);
  }
}

/** Supprime plusieurs images, en ignorant silencieusement les échecs. */
export async function deleteBlobImages(urls: Array<string | undefined>) {
  await Promise.all(urls.map((url) => deleteBlobImage(url)));
}
