# Major et fils

Boutique en ligne de commerce général : alimentation, maison & cuisine, mode,
électronique, hygiène et bébé. Vitrine éditoriale, catalogue, panier, commande
avec **paiement à la livraison** et back-office d'administration.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack](#stack)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts](#scripts)
- [Accès administrateur](#accès-administrateur)
- [Organisation du projet](#organisation-du-projet)
- [Parcours de commande](#parcours-de-commande)
- [Promotions](#promotions)
- [Devise et livraison](#devise-et-livraison)
- [Déploiement](#déploiement)
- [Sécurité](#sécurité)
- [Réinitialiser les données](#réinitialiser-les-données)

## Fonctionnalités

### Boutique

- **Accueil** éditorial : hero, rayons, sélection, promotion en cours, manifeste.
- **Catalogue** filtrable par catégorie, recherche plein texte et tri.
- **Fiche produit** : galerie, détails, stock, promotions appliquées, produits liés.
- **Panier** persistant dans le navigateur (`localStorage`).
- **Commande** sans compte ni paiement en ligne : nom, téléphone, adresse de
  livraison et note éventuelle. Les prix, promotions et stocks sont **recalculés
  côté serveur**.
- **Confirmation** de commande avec suivi de statut accessible par numéro.
- **Contact** avec formulaire relié à la boîte de réception admin.

### Administration (`/admin`)

- Connexion e-mail + mot de passe (session JWT en cookie `httpOnly`).
- **Tableau de bord** : chiffre d'affaires, commandes à traiter, ventes sur
  7 jours, stock faible, commandes récentes.
- **Produits** : liste filtrable, création, édition, suppression, publication,
  mise en avant, prix barré, stock.
- **Catégories** : création, édition, suppression protégée si des produits y
  sont rattachés.
- **Promotions** : remise en pourcentage ou montant fixe, sur toute la boutique,
  une catégorie ou des produits précis, avec période et activation.
- **Commandes** : filtres par statut, recherche, détail client, articles,
  changement de statut, note interne. L'annulation remet les articles en stock.
- **Messages** : lecture, marquage lu/non lu, réponse par e-mail, suppression.

L'interface est entièrement en français, responsive (mobile, tablette, desktop),
et conçue avec un design system ivoire / sable / encre / terracotta.

## Stack

- **Next.js 16.4** — App Router, Server Components, Server Actions, Cache Components.
- **React 19** — `useActionState`, `useFormStatus`.
- **TypeScript** strict.
- **Tailwind CSS v4** + design system CSS personnalisé.
- **MongoDB** (driver natif, sans ODM).
- **Zod 4** pour la validation côté serveur.
- **bcryptjs** pour le hachage du mot de passe admin.
- **jose** pour les sessions JWT HS256.
- **lucide-react** pour les icônes.
- **tsx** pour exécuter le script de seed.

## Démarrage rapide

Prérequis : **Node.js 20+** et une base MongoDB accessible.

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# puis renseigner AUTH_SECRET (openssl rand -hex 32) et les accès MongoDB

# 3. Démarrer MongoDB (si vous utilisez l'installation locale du projet)
npm run db:start

# 4. Remplir la base avec le catalogue de démonstration (commerce général)
npm run seed

# 5. Lancer le serveur de développement
npm run dev
```

- Boutique : <http://localhost:3000>
- Administration : <http://localhost:3000/admin>

Le raccourci `npm run setup` enchaîne `db:start` et `seed`.

> Le projet peut utiliser le MongoDB autonome présent dans `.mongo/` (démarré par
> `npm run db:start`) ou toute autre instance via `MONGODB_URI` (MongoDB Atlas,
> Docker, installation locale…).

## Variables d'environnement

Toutes les variables sont documentées dans `.env.example`.

| Variable | Rôle | Exemple |
| --- | --- | --- |
| `MONGODB_URI` | Chaîne de connexion MongoDB | `mongodb://127.0.0.1:27017` |
| `MONGODB_DB` | Nom de la base | `shopify` |
| `AUTH_SECRET` | Secret de signature JWT (32+ caractères) | `openssl rand -hex 32` |
| `ADMIN_EMAIL` | E-mail du compte admin créé par le seed | `admin@majoretfils.com` |
| `ADMIN_PASSWORD` | Mot de passe du compte admin | `MajorAdmin2026!` |
| `NEXT_PUBLIC_SITE_NAME` | Nom affiché de la boutique | `Major et fils` |
| `NEXT_PUBLIC_CURRENCY` | Devise ISO 4217 | `XOF`, `EUR`, `USD`… |
| `NEXT_PUBLIC_SHIPPING_FEE` | Frais de livraison standards | `2000` |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | Seuil de livraison offerte | `50000` |

`AUTH_SECRET` doit impérativement être long et secret en production. Le mot de
passe admin est haché avec bcrypt au moment du seed.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement Next.js |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Analyse ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run seed` | Remplit / met à jour la base de démonstration |
| `npm run db:start` | Démarre le MongoDB local du projet |
| `npm run db:stop` | Arrête le MongoDB local |
| `npm run db:status` | Vérifie l'état de MongoDB |
| `npm run setup` | `db:start` puis `seed` |

## Accès administrateur

Avec les valeurs par défaut de `.env.example` :

```text
E-mail : admin@majoretfils.com
Mot de passe : MajorAdmin2026!
```

Le seed crée ce compte (ou met à jour son mot de passe) à partir de
`ADMIN_EMAIL` et `ADMIN_PASSWORD`. **Changez ces identifiants avant toute mise en
production.**

## Organisation du projet

```text
src/
├── app/
│   ├── (store)/                 # Boutique publique (layout commun)
│   │   ├── page.tsx             # Accueil
│   │   ├── catalogue/           # Catalogue + fiche produit
│   │   ├── panier/
│   │   ├── commande/            # Checkout + confirmation
│   │   └── contact/
│   ├── admin/
│   │   ├── login/               # Connexion
│   │   └── (dashboard)/         # Back-office protégé
│   ├── globals.css              # Design system
│   └── layout.tsx               # Layout racine, polices
├── components/
│   ├── admin/                   # Formulaires, tableaux, navigation admin
│   └── store/                   # Header, panier, produits, formulaires
├── lib/
│   ├── admin-actions.ts         # Server Actions admin
│   ├── admin-data.ts            # Lectures admin
│   ├── auth.ts                  # Session JWT + bcrypt
│   ├── data.ts                  # Lectures publiques mises en cache
│   ├── mongodb.ts               # Connexion MongoDB
│   ├── pricing.ts               # Calcul des promotions et livraison
│   ├── server-time.ts           # Année courante mise en cache
│   ├── store-actions.ts         # Commande et contact
│   ├── types.ts                 # Types partagés
│   └── validators.ts            # Schémas Zod
└── proxy.ts                     # Protection des routes /admin avant rendu
scripts/
├── db.sh                        # Contrôle du MongoDB local
└── seed.ts                      # Données de démonstration
```

Les lectures publiques utilisent `use cache` avec les tags `products`,
`categories` et `promotions`. Les Server Actions admin appellent `updateTag`
après chaque mutation : le catalogue se met à jour sans redémarrage.

## Parcours de commande

1. Le visiteur ajoute des articles au panier (stock et prix affichés).
2. Au checkout, il saisit uniquement ses coordonnées et son adresse.
3. La Server Action `placeOrder` :
   - recharge les produits depuis MongoDB ;
   - recalcule le meilleur prix promotionnel ;
   - vérifie et décrémente le stock de façon atomique ;
   - calcule les frais de livraison ;
   - enregistre la commande avec le statut `pending`.
4. Le client reçoit un numéro `MAJOR-XXXXXXXX` et peut consulter sa confirmation.
5. L'admin confirme par téléphone, expédie, puis marque la commande `delivered`.
6. En cas d'annulation, les quantités sont automatiquement remises en stock.

## Promotions

Une promotion possède :

- une **image** (affichée dans le carousel du hero de la page d'accueil) ;
- un **type** : `percent` (1 à 90 %) ou `fixed` (montant en FCFA) ;
- une **cible** : toute la boutique, une catégorie ou une liste de produits ;
- une **période** (`startsAt` / `endsAt`) ;
- un état **actif**.

L'image est envoyée depuis le formulaire admin et enregistrée dans
`public/promotions/`. Le hero de l'accueil affiche toutes les promotions actives
disposant d'une image sous forme de carousel (flèches + points de navigation).
Sans promotion illustrée, le hero retombe sur le produit mis en avant.

Si plusieurs promotions actives s'appliquent à un produit, la remise qui donne le
prix le plus bas est retenue. Le prix barré affiché est calculé automatiquement.

## Devise et livraison

La devise et la livraison sont configurables sans toucher au code :

```env
NEXT_PUBLIC_CURRENCY="XOF"
NEXT_PUBLIC_SHIPPING_FEE="2000"
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD="50000"
```

Les montants sont stockés en unités entières de la devise (pas de centimes pour
le XOF). Le formatage utilise `Intl.NumberFormat` avec la locale `fr-FR`.

## Déploiement

> Les pages du storefront sont prérendues au build (`"use cache"` +
> `cacheLife("minutes")`). Le build a donc besoin d'un accès **réseau à la base
> MongoDB au moment de la compilation**. Un `MongoServerSelectionError:
> connect ECONNREFUSED 127.0.0.1:27017` dans les logs signifie que
> `MONGODB_URI` n'est pas définie sur l'hébergeur : le code se rabat sur
> localhost, où aucune base n'écoute.

### Incident `MongoServerSelectionError: ReplicaSetNoPrimary`

Si la production affiche `Server selection timed out after 15 000 ms` avec
`type: 'ReplicaSetNoPrimary'`, lisez la `TopologyDescription` :

- `setName: 'atlas-…'` renseigné → la résolution DNS SRV fonctionne ;
- `commonWireVersion: 0` et `logicalSessionTimeoutMinutes: null` → **aucun**
  nœud n'a réussi de handshake. Ce n'est pas seulement une élection en cours,
  c'est « aucun serveur joignable ».

Checklist à appliquer dans l'ordre (causes réelles, côté infrastructure) :

1. Atlas → **Clusters** : le cluster doit être **Active** (pas en pause ; le
   tier gratuit se met en pause après inactivité) et le primaire au vert.
2. Atlas → **Network Access** : autoriser `0.0.0.0/0` pour Vercel (les IP de
   sortie sont dynamiques), ou configurer un peering / PrivateLink.
3. Atlas → **Database Access** : vérifier l'utilisateur, le mot de passe et
   l'`authSource` de l'URI. Une URI `mongodb+srv://…` doit contenir le mot de
   passe encodé (`@` → `%40`, `#` → `%23`, etc.).
4. Atlas → **Metrics → Connections** : comparer au limite du tier. Un pic de
   connexions = tempête de `MongoClient` (corrigée côté code, voir ci-dessous).
5. TLS : certificats racine du runtime à jour (les profils TLS des fonctions
   peuvent changer côté hébergeur).
6. Tester depuis la fonction : `GET /api/health` renvoie `200` + la latence si
   `ping` répond, `503` + le message d'erreur sinon.

Côté application, la résilience est maintenant assurée par
`src/lib/mongodb.ts` : client unique partagé par isolate (plus de pool créé
par requête), fermeture des clients en échec, 2 tentatives avec jitter sur les
erreurs de topologie uniquement, sélection portée à 15 s, retries driver
activés, et reset du cache en cas d'échec. Les pages ont une frontière
d'erreur lisible (`src/app/error.tsx`) au lieu de la stack brute.

1. Créez une base MongoDB Atlas et récupérez son URI.
2. Dans MongoDB Atlas → **Network Access**, autorisez les IP de l'hébergeur.
   Sur Vercel, les IP de build sont dynamiques : ajoutez `0.0.0.0/0` (ou passez
   par un peering/PrivateLink si la sécurité l'exige).
3. Définissez les variables d'environnement sur la plateforme d'hébergement
   (Vercel, Render, VPS…). Sur Vercel : **Project → Settings → Environment
   Variables**, en cochant **Production + Preview + Development** :
   - `MONGODB_URI`, `MONGODB_DB` — obligatoires (le build échoue sans elles)
   - `AUTH_SECRET` (`openssl rand -hex 32`, 32 caractères minimum) — obligatoire
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID` — envoi des images du catalogue
   - les variables `NEXT_PUBLIC_*`
4. Exécutez le seed une première fois depuis un environnement ayant accès à la
   base : `npm run seed` (avec les variables de production).
5. Déployez : `npm run build` puis `npm run start`.
   Le hook `prebuild` (`scripts/check-env.mjs`) vérifie la configuration avant
   la compilation et affiche la liste des variables manquantes.

`AUTH_SECRET` ne doit jamais être commité et le mot de passe admin doit être
changé avant la mise en ligne.

### Stockage des images (Vercel Blob)

Les visuels de produits, catégories et promotions sont envoyés depuis le
back-office vers **Vercel Blob** — le disque des fonctions serverless est en
lecture seule, l'ancienne écriture dans `public/uploads` n'aurait donc jamais
fonctionné en production.

- **Envoi direct navigateur → Blob** (`@vercel/blob/client`, voir
  `src/lib/client-upload.ts`) : le fichier ne traverse jamais une fonction
  Vercel, dont le corps de requête est limité à **4,5 Mo**. Le serveur délivre
  seulement un jeton court via `src/app/api/blob/upload/route.ts`, après
  vérification de la session administrateur.
- Formats acceptés : JPEG, PNG, WebP, AVIF, GIF — **8 Mo maximum** par image. Le
  type MIME et la taille sont contrôlés dans le navigateur, puis imposés par le
  jeton d'envoi (`allowedContentTypes`, `maximumSizeInBytes`) : impossible de
  déposer un autre type de fichier dans le store.
- Le formulaire ne transmet ensuite que les URL déjà envoyées (`imageUrls` /
  `imageUrl`) ; une action serveur refuse toute URL hors de nos dossiers.
- Les URL sont rangées dans les dossiers `produits/`, `categories/` et
  `promotions/` du store.
- **Store privé** : l'URL du store exige un jeton, le navigateur ne peut pas
  l'afficher. L'URL enregistrée en base est alors relative
  (`/api/blob/produits/…`) et servie par la route handler
  `src/app/api/blob/[...pathname]/route.ts`, qui relaie le fichier avec un cache
  immuable d'un an. Seuls ces trois dossiers sont exposés.
- **Store public** : l'URL CDN `*.public.blob.vercel-storage.com` est enregistrée
  directement, sans passer par le relais.
- Le mode est **privé par défaut** (images relayées par `/api/blob/…`). Pour un
  store public, définir `BLOB_ACCESS=public` **et** `NEXT_PUBLIC_BLOB_ACCESS=public`
  (la seconde est lue dans le navigateur et figée au build).
- Les chemins historiques (`/catalogue/…`, `/promotions/…`) restent valides :
  seuls les nouveaux envois passent par Blob.
- La suppression d'un produit, d'une catégorie ou d'une promotion nettoie aussi
  ses images dans le store (les échecs de nettoyage ne bloquent pas l'action).
  Une image envoyée puis retirée avant l'enregistrement est également supprimée.


## Sécurité

- Session admin signée en HS256, stockée dans un cookie `httpOnly`, `sameSite=lax`
  et `secure` en production.
- `src/proxy.ts` vérifie la session avant le rendu de `/admin` : un visiteur non
  connecté reçoit une redirection HTTP 307 vers `/admin/login`.
- Toutes les Server Actions admin vérifient la session avec `assertAdmin()`.
- Mots de passe hachés avec bcrypt (12 rounds).
- Validation systématique des entrées avec Zod.
- Prix, stocks et frais de livraison toujours recalculés côté serveur : le panier
  client ne peut pas imposer un prix.
- Limitation basique des tentatives de connexion (8 essais / 10 minutes par
  e-mail, en mémoire).
- Pages admin exclues de l'indexation (`robots: noindex`).

## Réinitialiser les données

Le seed est **idempotent** :

- l'admin est créé ou mis à jour ;
- les catégories, produits et promotions sont mis à jour par slug/titre ;
- les commandes et messages de démonstration ne sont insérés que si leurs
  collections sont vides.

Pour repartir de zéro, supprimez les collections concernées puis relancez le
seed :

```bash
# Exemple avec mongosh
mongosh "$MONGODB_URI" \
  --eval 'db.products.drop(); db.categories.drop(); db.promotions.drop(); db.orders.drop(); db.messages.drop();'

npm run seed
```

⚠️ Ne supprimez jamais la collection `users` en production sans avoir prévu de
recréer un compte administrateur.
