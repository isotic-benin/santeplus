/**
 * Règles communes aux images du catalogue, utilisables côté navigateur comme
 * côté serveur (aucun import Node ici).
 *
 * Les fichiers sont envoyés **directement du navigateur vers Vercel Blob** :
 * une fonction Vercel ne peut pas recevoir plus de 4,5 Mo de corps de requête,
 * et une photo de téléphone dépasse souvent cette limite. Le formulaire ne
 * transmet ensuite que l'adresse de l'image déjà stockée.
 */

/** Limite par image (le store Blob accepte bien plus, c'est un choix produit). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 Mo

/** Types réellement acceptés par le store et par le back-office. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

/** Valeur prête pour l'attribut `accept` d'un `<input type="file">`. */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

/** Dossiers logiques autorisés dans le store. */
export const IMAGE_FOLDERS = ["produits", "categories", "promotions"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

/** Préfixe des URL relayées par `src/app/api/blob/[...pathname]/route.ts`. */
export const PROXIED_BLOB_PREFIX = "/api/blob/";

const BLOB_HOSTS = [
  ".public.blob.vercel-storage.com",
  ".private.blob.vercel-storage.com",
];

const SAFE_FILENAME_PATTERN = /^[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|avif|gif)$/i;

/** URL relative servie par notre route relais (store privé). */
export function proxiedBlobUrl(pathname: string) {
  return `${PROXIED_BLOB_PREFIX}${pathname.replace(/^\/+/, "")}`;
}

/** Vrai si l'URL pointe directement vers un fichier du store Blob. */
export function isBlobUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return BLOB_HOSTS.some((host) => hostname.endsWith(host));
  } catch {
    return false;
  }
}

/** Vrai si l'URL est relayée par notre route `/api/blob/...`. */
export function isProxiedBlobUrl(
  url: string | null | undefined,
): url is string {
  return typeof url === "string" && url.startsWith(PROXIED_BLOB_PREFIX);
}

/** Vrai si l'image est hébergée par nous (donc supprimable du store). */
export function isManagedImage(url: string | null | undefined) {
  return isBlobUrl(url) || isProxiedBlobUrl(url);
}

/**
 * Chemin dans le store à partir d'une URL gérée (relais ou URL Blob absolue).
 * Retourne `null` pour tout autre chemin (`/catalogue/...`, URL externe…).
 */
export function pathnameFromManagedUrl(url: string): string | null {
  if (isProxiedBlobUrl(url)) {
    const pathname = url.slice(PROXIED_BLOB_PREFIX.length).split("?")[0];
    return pathname || null;
  }
  if (isBlobUrl(url)) {
    try {
      return decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
    } catch {
      return null;
    }
  }
  return null;
}

/** Vrai si le chemin respecte `<dossier autorisé>/<fichier image>`. */
export function isAllowedImagePathname(pathname: string): boolean {
  const segments = pathname.replace(/^\/+/, "").split("/");
  if (segments.length !== 2) return false;
  const [folder, file] = segments;
  return (
    (IMAGE_FOLDERS as readonly string[]).includes(folder) &&
    SAFE_FILENAME_PATTERN.test(file)
  );
}

/** Vrai si l'image appartient au dossier attendu. */
export function isImageInFolder(
  pathname: string,
  folder: ImageFolder,
): boolean {
  return isAllowedImagePathname(pathname) && pathname.startsWith(`${folder}/`);
}

/** Extension de fichier déduite du type MIME validé. */
export function extensionForType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

/** Taille lisible, pour les messages d'erreur. */
export function formatMegabytes(bytes: number) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} Mo`;
}
