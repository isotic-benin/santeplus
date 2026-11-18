import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentAdmin } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  isAllowedImagePathname,
} from "@/lib/image-rules";

/**
 * Délivre les jetons d'envoi pour les uploads **directs navigateur → Blob**.
 *
 * Le fichier lui-même ne passe pas par cette route : seul un jeton signé, valable
 * quelques minutes et limité à un chemin, est échangé. C'est ce qui permet
 * d'envoyer des photos de plus de 4,5 Mo (limite du corps des fonctions Vercel).
 *
 * `handleUpload` reçoit aussi la notification de fin d'envoi ; on n'en a pas
 * besoin, le formulaire enregistre lui-même l'URL renvoyée au navigateur.
 */
export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const admin = await getCurrentAdmin();
        if (!admin) {
          throw new Error("Session administrateur requise.");
        }
        if (!isAllowedImagePathname(pathname)) {
          throw new Error("Chemin d'image non autorisé.");
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 an — contenu immuable
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("Erreur d'autorisation d'envoi Blob", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Envoi de l'image non autorisé.",
      },
      { status: 400 },
    );
  }
}
