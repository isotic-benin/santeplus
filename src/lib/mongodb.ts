import "server-only";

import { MongoClient, type Db } from "mongodb";

const LOCAL_URI = "mongodb://127.0.0.1:27017";

/**
 * Résout l'URI MongoDB.
 *
 * Le repli sur `mongodb://127.0.0.1:27017` n'est autorisé qu'en développement.
 * En production, une URI absente doit échouer immédiatement avec un message
 * explicite plutôt que de laisser le client MongoDB expirer sur `localhost`
 * (`MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`), ce qui
 * rendait les échecs de build sur Vercel difficiles à diagnostiquer.
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
        "— vérifiez aussi que MongoDB Atlas autorise les IP de l'hébergeur " +
        "(Network Access / 0.0.0.0/0 pour Vercel).",
    );
  }

  return LOCAL_URI;
}

const uri = resolveUri();
const dbName = process.env.MONGODB_DB?.trim() || "shopify";

declare global {
  var __koraMongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8_000,
    maxPoolSize: 10,
  });
  return client.connect();
}

const clientPromise =
  process.env.NODE_ENV === "development"
    ? (global.__koraMongoClientPromise ??= createClient())
    : createClient();

export const mongoClientPromise = clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function pingDatabase() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
