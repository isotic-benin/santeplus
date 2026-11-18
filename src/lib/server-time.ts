import "server-only";

import { cacheLife } from "next/cache";

/**
 * Année civile affichée dans les pieds de page.
 *
 * `new Date()` est une valeur instable : lue pendant le prerender, elle
 * déclenche l'erreur « encountered the unstable value new Date() ». On la met
 * en cache pour que le rendu statique reste déterministe ; l'année sera
 * rafraîchie à la prochaine revalidation du cache.
 */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("weeks");
  return new Date().getFullYear();
}
