#!/usr/bin/env node
/**
 * Préflight lancé avant `next build` (hook npm `prebuild`).
 *
 * Les pages du storefront utilisent `"use cache"` et sont prérendues au build :
 * la base MongoDB doit donc être joignable au moment de la compilation. Sans ce
 * contrôle, une variable absente se traduit par une longue pile
 * `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` difficile à
 * rattacher à sa cause.
 *
 * Aucune dépendance externe : `.env.local` puis `.env` sont chargés s'ils
 * existent, pour que `npm run build` en local se comporte comme dans le reste
 * du projet (`next dev` applique la même priorité).
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const envFiles = [".env.local", ".env"].map((name) => resolve(root, name));

function loadEnvFiles() {
  for (const envFile of envFiles) {
    if (!existsSync(envFile)) continue;
    const raw = readFileSync(envFile, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // Le premier fichier trouvé gagne : .env.local a la priorité sur .env.
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function read(key) {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
}

function mask(value) {
  if (!value) return "(vide)";
  try {
    const url = new URL(value);
    if (url.password) url.password = "***";
    return url.toString();
  } catch {
    return `${value.slice(0, 4)}…`;
  }
}

loadEnvFiles();

const isVercel = Boolean(process.env.VERCEL);
const errors = [];
const warnings = [];

// --- Variables bloquantes -------------------------------------------------
const mongoUri = read("MONGODB_URI");
if (!mongoUri) {
  errors.push(
    "MONGODB_URI est absente. Sur Vercel : Project → Settings → Environment " +
      "Variables → ajouter MONGODB_URI (Production + Preview + Development), " +
      "puis redéployer. Format : " +
      "mongodb+srv://<utilisateur>:<mot-de-passe>@<cluster>.mongodb.net/shopify",
  );
} else if (/<[^>]+>/.test(mongoUri)) {
  errors.push(
    `MONGODB_URI contient encore un gabarit non remplacé (${mask(mongoUri)}).`,
  );
} else if (
  isVercel &&
  /^(mongodb:\/\/)?(127\.0\.0\.1|localhost)(:|\/|$)/.test(mongoUri)
) {
  errors.push(
    "MONGODB_URI pointe vers localhost alors que le build tourne sur Vercel : " +
      "aucune base n'y écoute sur 127.0.0.1:27017. Utilisez l'URI MongoDB Atlas.",
  );
}

const authSecret = read("AUTH_SECRET");
if (!authSecret) {
  errors.push(
    "AUTH_SECRET est absente. Générer une valeur avec `openssl rand -hex 32` " +
      "et l'ajouter aux variables d'environnement de l'hébergeur.",
  );
} else if (authSecret.length < 32) {
  errors.push(
    `AUTH_SECRET est trop court (${authSecret.length} caractères, 32 minimum).`,
  );
} else if (/^(change-me|changeme|secret|test)/i.test(authSecret)) {
  errors.push(
    "AUTH_SECRET ressemble à une valeur d'exemple. Utilisez `openssl rand -hex 32`.",
  );
}

// --- Variables recommandées -----------------------------------------------
const recommended = [
  ["MONGODB_DB", "shopify"],
  ["ADMIN_EMAIL", "admin@majoretfils.com"],
  ["ADMIN_PASSWORD", "MajorAdmin2026!"],
  ["BLOB_READ_WRITE_TOKEN", "envoi des images depuis le back-office"],
  ["NEXT_PUBLIC_SITE_NAME", "Major et fils"],
  ["NEXT_PUBLIC_CURRENCY", "XOF"],
  ["NEXT_PUBLIC_SHIPPING_FEE", "2000"],
  ["NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD", "50000"],
];

for (const [key, fallback] of recommended) {
  if (!read(key)) {
    warnings.push(`${key} absente → valeur par défaut « ${fallback} » utilisée.`);
  }
}

// --- Rapport --------------------------------------------------------------
if (warnings.length) {
  console.log("\n⚠  Variables d'environnement — avertissements");
  for (const warning of warnings) console.log(`   • ${warning}`);
}

if (errors.length) {
  console.error("\n✖ Build interrompu : configuration incomplète\n");
  for (const error of errors) console.error(`   • ${error}\n`);
  console.error(
    "  Documentation : .env.example (liste complète) et README.md → Déploiement.\n",
  );
  process.exit(1);
}

console.log(
  `\n✔ Configuration d'environnement valide (MongoDB : ${mask(mongoUri)})\n`,
);
