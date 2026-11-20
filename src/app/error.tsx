"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Frontière d'erreur globale (Next.js 16 : props `error: unknown` et `retry`).
 * Sans elle, la moindre indisponibilité MongoDB affichait la stack
 * `MongoServerSelectionError` brute dans le navigateur.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[santeplus] Erreur de rendu", error);
  }, [error]);

  const err = error instanceof Error ? error : new Error(String(error));
  const digest =
    "digest" in err && typeof err.digest === "string" ? err.digest : null;

  // En production Next.js masque le message des erreurs serveur : on ne s'en
  // sert donc que comme indice bonus, jamais pour conditionner le message.
  const databaseHint = /mongo|server selection|topology|database/i.test(
    err.message,
  );

  return (
    <main className="shell flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Une erreur est survenue</p>
      <h1 className="display mt-4 max-w-2xl text-4xl sm:text-5xl">
        Le service est momentanément indisponible.
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-2">
        Nous n&apos;avons pas pu charger cette page, probablement à cause d&apos;une
        interruption temporaire de notre base de données. L&apos;équipe technique
        est alertée : réessayez dans quelques instants.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={() => retry()} className="btn btn-primary">
          Réessayer
        </button>
        <Link href="/" className="btn btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>

      {databaseHint && (
        <p className="mt-6 text-xs text-ink-3">Origine : base de données.</p>
      )}
      {digest && (
        <p className="mt-2 text-xs text-ink-3">Référence technique : {digest}</p>
      )}
    </main>
  );
}
