import "server-only";

import { MongoClient, type Db } from "mongodb";

const LOCAL_URI = "mongodb://127.0.0.1:27017";

/**
 * Résout l'URI MongoDB.
 *
 * Le repli sur `mongodb://127.0.0.1:27017` n'est autorisé qu'en développement.
 * En production, une URI absente doit échouer immédiatement avec un message
 * explicite plutôt que de laisser le client MongoDB expirer sur `localhost`.
 *
 * Note : cette fonction est appelée paresseusement (au premier `getDb()`), et
 * non plus à l'import du module. Un problème de configuration ne fait donc plus
 * planter le chargement de toutes les routes, et l'erreur peut être attrapée
 * proprement par la page d'erreur.
 */
function resolveUri(): string {
  const configured = process.env.MONGODB_URI?.trim();
  if (configured) return configured;

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (isProduction) {
    throw new Error(
      "MONGODB_URI est manquant. Renseignez-le dans les variables " +
        "d'environnement de l'hébergeur (Vercel : Project → Settings → " +
        "Environment Variables, cocher Production + Preview + Development) " +
        "puis redéployez. Format : " +
        "mongodb+srv://<utilisateur>:<mot-de-passe>@<cluster>.mongodb.net/shopify " +
        "— vérifiez aussi que le cluster Atlas est actif (pas en pause), que " +
        "Network Access autorise les IP de l'hébergeur (0.0.0.0/0 pour Vercel) " +
        "et que le certificat TLS de la plateforme est à jour.",
    );
  }

  return LOCAL_URI;
}

const dbName = process.env.MONGODB_DB?.trim() || "shopify";

/**
 * Atlas met parfois 10 à 30 s à élire un nouveau primaire. 8 s était trop court
 * et transformait une bascule normale en erreur applicative.
 */
const SERVER_SELECTION_TIMEOUT_MS = 15_000;
const CONNECT_ATTEMPTS = 2;

/**
 * Un seul client partagé par isolate, dans TOUS les environnements.
 *
 * Le code précédent ne partageait le client qu'en développement : en
 * production chaque fonction Vercel ouvrait son propre pool (maxPoolSize: 10)
 * plus ses connexions de monitoring, ce qui peut épuiser la limite de
 * connexions d'un cluster Atlas et produire exactement le
 * `MongoServerSelectionError / ReplicaSetNoPrimary` observé.
 */
declare global {
  var __koraMongoClientPromise: Promise<MongoClient> | undefined;
}

const RETRYABLE_CODE_NAMES = new Set([
  "HostUnreachable",
  "HostNotFound",
  "NetworkTimeout",
  "NotPrimaryNoSecondaryOk",
  "NotWritablePrimary",
  "PrimarySteppedDown",
  "ShutdownInProgress",
  "InterruptedAtShutdown",
  "InterruptedDueToReplStateChange",
]);

/**
 * On ne réessaie que les pannes de topologie / réseau : jamais une erreur
 * d'authentification, d'URI invalide ou de certificat définitivement cassé.
 */
function isRetryableConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  if (
    error.name === "MongoServerSelectionError" ||
    error.name === "MongoNetworkError" ||
    error.name === "MongoTimeoutError"
  ) {
    return true;
  }

  const codeName = (error as Error & { codeName?: string }).codeName;
  if (codeName && RETRYABLE_CODE_NAMES.has(codeName)) return true;

  const message = error.message.toLowerCase();
  return [
    "server selection timed out",
    "timed out",
    "econnrefused",
    "econnreset",
    "etimedout",
    "enotfound",
    "eai_again",
    "getaddrinfo",
    "topology was destroyed",
    "connection closed",
  ].some((fragment) => message.includes(fragment));
}

function createClientPromise(): Promise<MongoClient> {
  return (async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt < CONNECT_ATTEMPTS; attempt += 1) {
      const client = new MongoClient(resolveUri(), {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        connectTimeoutMS: 10_000,
        // Pool volontairement réduit : sur Vercel la limite de connexions est
        // partagée entre toutes les instances de la fonction.
        maxPoolSize: 5,
        minPoolSize: 0,
        maxIdleTimeMS: 60_000,
        retryReads: true,
        retryWrites: true,
      });

      try {
        return await client.connect();
      } catch (error) {
        lastError = error;
        // Ferme les éventuelles connexions de monitoring déjà ouvertes.
        void client.close().catch(() => undefined);

        const canRetry =
          attempt + 1 < CONNECT_ATTEMPTS && isRetryableConnectionError(error);
        if (!canRetry) {
          console.error(
            `[mongodb] Connexion impossible après ${attempt + 1} tentative(s) :`,
            error instanceof Error ? error.message : error,
          );
          throw error;
        }

        // Jitter : évite que toutes les instances Vercel réessaient en même temps.
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 200 + Math.floor(Math.random() * 300));
        });
      }
    }

    throw lastError;
  })();
}

/** Promise partagée, avec reset automatique si la connexion échoue. */
function getSharedClientPromise(): Promise<MongoClient> {
  if (!globalThis.__koraMongoClientPromise) {
    const promise = createClientPromise();
    globalThis.__koraMongoClientPromise = promise;

    // Sans ce handler, une connexion ratée resterait en cache indéfiniment
    // (et provoquerait un unhandled rejection) jusqu'au redémarrage de l'instance.
    void promise.catch(() => {
      if (globalThis.__koraMongoClientPromise === promise) {
        globalThis.__koraMongoClientPromise = undefined;
      }
    });
  }

  return globalThis.__koraMongoClientPromise;
}

export async function getMongoClientPromise(): Promise<MongoClient> {
  return getSharedClientPromise();
}

export async function getDb(): Promise<Db> {
  const client = await getSharedClientPromise();
  return client.db(dbName);
}

export interface DatabaseHealth {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

/** Utilisé par `/api/health` pour surveiller l'état réel de la base. */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function pingDatabase(): Promise<boolean> {
  return (await getDatabaseHealth()).ok;
}
