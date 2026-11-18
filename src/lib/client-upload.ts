"use client";

import { upload } from "@vercel/blob/client";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  type ImageFolder,
  extensionForType,
  formatMegabytes,
  proxiedBlobUrl,
} from "@/lib/image-rules";

/**
 * Envoie une image **directement du navigateur vers Vercel Blob**.
 *
 * Le fichier ne traverse jamais la fonction Vercel : la limite de 4,5 Mo sur
 * le corps des requêtes ne s'applique donc pas. Le serveur délivre seulement un
 * jeton d'envoi court (`/api/blob/upload`), après vérification de la session
 * administrateur.
 *
 * Retourne l'URL à enregistrer en base : relative (`/api/blob/...`) quand le
 * store est privé, absolue quand il est public.
 */
export async function uploadImageFile(
  file: File,
  folder: ImageFolder,
  onProgress?: (percentage: number) => void,
): Promise<string> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new Error(
      `Format non pris en charge pour « ${file.name} » (JPEG, PNG, WebP, AVIF ou GIF).`,
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `« ${file.name} » dépasse ${formatMegabytes(MAX_IMAGE_BYTES)}.`,
    );
  }

  const access =
    process.env.NEXT_PUBLIC_BLOB_ACCESS === "public" ? "public" : "private";
  const pathname = `${folder}/${crypto.randomUUID()}.${extensionForType(file.type)}`;

  const blob = await upload(pathname, file, {
    access,
    contentType: file.type,
    handleUploadUrl: "/api/blob/upload",
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  });

  return access === "public" ? blob.url : proxiedBlobUrl(blob.pathname);
}
