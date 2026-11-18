import { readBlobFile } from "@/lib/uploads";

/**
 * Relais des images stockées sur Vercel Blob quand le store est privé.
 *
 * Les URL de store privé exigent `BLOB_READ_WRITE_TOKEN` : le navigateur ne peut
 * donc pas les afficher directement. Cette route relaie le fichier côté serveur
 * et le met en cache un an (les noms portent un suffixe aléatoire, le contenu
 * est immuable).
 *
 * Seuls les dossiers `produits`, `categories` et `promotions` sont exposés.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pathname: string[] }> },
) {
  const { pathname } = await params;
  const file = await readBlobFile(pathname.join("/"));

  if (!file) {
    return new Response("Image introuvable.", { status: 404 });
  }

  return new Response(file.stream, {
    headers: {
      "Content-Type": file.blob.contentType ?? "application/octet-stream",
      "Content-Length": String(file.blob.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
