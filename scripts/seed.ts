/**
 * Remplit la base Major et fils avec un catalogue de commerce général.
 *
 * Utilisation : npm run seed
 *
 * Le script est idempotent : les catégories, produits et promotions sont
 * mis à jour par slug/titre, l'admin est créé ou actualisé, et les commandes
 * et messages de démonstration ne sont insérés que si leurs collections
 * sont vides.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import type {
  AdminUserDoc,
  CategoryDoc,
  ContactMessageDoc,
  OrderDoc,
  OrderItem,
  ProductDoc,
  PromotionDoc,
} from "../src/lib/types";

function loadEnvFile(file: string) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB || "shopify";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@majoretfils.com")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "MajorAdmin2026!";
const SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE || 2000);
const FREE_SHIPPING = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 50000,
);

const now = new Date();
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000);
const daysFromNow = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

const categories = [
  {
    name: "Épicerie",
    slug: "epicerie",
    description:
      "Riz, pâtes, miel et produits de base : le panier du quotidien, à prix justes.",
    image: "/catalogue/categorie-epicerie.jpg",
    featured: true,
  },
  {
    name: "Maison & Cuisine",
    slug: "maison-cuisine",
    description:
      "Ustensiles, vaisselle et équipement pour cuisiner et recevoir, du plus simple au plus complet.",
    image: "/catalogue/categorie-maison-cuisine.jpg",
    featured: true,
  },
  {
    name: "Mode",
    slug: "mode",
    description:
      "Vêtements et chaussures pour toute la famille : des basiques confortables, faciles à porter.",
    image: "/catalogue/categorie-mode.jpg",
    featured: true,
  },
  {
    name: "Électronique",
    slug: "electronique",
    description:
      "Audio, objets connectés et accessoires du quotidien, choisis pour leur fiabilité.",
    image: "/catalogue/categorie-electronique.jpg",
    featured: true,
  },
  {
    name: "Hygiène & Beauté",
    slug: "hygiene-beaute",
    description:
      "Soins du corps, hygiène et petits rituels pour se sentir bien chaque jour.",
    image: "/catalogue/categorie-hygiene-beaute.jpg",
    featured: true,
  },
  {
    name: "Bébé & Enfants",
    slug: "bebe-enfants",
    description:
      "L'essentiel pour les tout-petits : vêtements, puériculture et produits du quotidien.",
    image: "/catalogue/categorie-bebe-enfants.jpg",
    featured: true,
  },
];

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  details: string[];
  price: number;
  compareAtPrice: number | null;
  categorySlug: string;
  images: string[];
  stock: number;
  featured: boolean;
}

const products: SeedProduct[] = [
  {
    name: "Riz parfumé long grain — 5 kg",
    slug: "riz-parfume-long-grain",
    description:
      "Un riz long grain parfumé, léger et bien détaché à la cuisson. Le sac de 5 kg pour couvrir les repas de la semaine.",
    details: [
      "Sac de 5 kg",
      "Riz long grain parfumé",
      "Se conserve au sec, à l'abri de l'humidité",
      "Origine : Asie du Sud-Est",
    ],
    price: 9500,
    compareAtPrice: 11000,
    categorySlug: "epicerie",
    images: ["/catalogue/riz-parfume-long-grain.jpg"],
    stock: 40,
    featured: true,
  },
  {
    name: "Casque Bluetooth sans fil",
    slug: "casque-bluetooth-sans-fil",
    description:
      "Un casque sans fil au son équilibré, avec des coussinets confortables et une longue autonomie. Idéal pour les trajets, le travail ou la maison.",
    details: [
      "Bluetooth 5.3",
      "Autonomie jusqu'à 30 h",
      "Micro intégré pour les appels",
      "Câble de recharge USB-C inclus",
    ],
    price: 28000,
    compareAtPrice: 35000,
    categorySlug: "electronique",
    images: ["/catalogue/casque-bluetooth-sans-fil.jpg"],
    stock: 15,
    featured: true,
  },
  {
    name: "Marmite inox 5 L",
    slug: "marmite-inox-5l",
    description:
      "Une marmite en inox robuste de 5 litres, avec couvercle en verre. Parfaite pour les sauces, les riz et les plats familiaux.",
    details: [
      "Inox 18/10, fond épais",
      "Capacité 5 L · compatible tous feux",
      "Couvercle en verre avec évent",
      "Lavage à la main recommandé",
    ],
    price: 18000,
    compareAtPrice: null,
    categorySlug: "maison-cuisine",
    images: ["/catalogue/marmite-inox-5l.jpg"],
    stock: 12,
    featured: true,
  },
  {
    name: "Coffret soin visage",
    slug: "coffret-soin-visage",
    description:
      "Un rituel simple en trois étapes : nettoyer, hydrater et protéger. Des formules douces adaptées à toutes les peaux.",
    details: [
      "Gel nettoyant 150 ml",
      "Crème hydratante 50 ml",
      "Brume tonique 100 ml",
      "Sans parfum ajouté · testé dermatologiquement",
    ],
    price: 12500,
    compareAtPrice: 15000,
    categorySlug: "hygiene-beaute",
    images: ["/catalogue/coffret-soin-visage.jpg"],
    stock: 18,
    featured: true,
  },
  {
    name: "Baskets urbaines",
    slug: "baskets-urbaines",
    description:
      "Des baskets légères au maintien souple, pensées pour marcher toute la journée en ville.",
    details: [
      "Dessus en maille respirante",
      "Semelle amortissante",
      "Pointures 39 à 45",
      "Entretien : brosse douce et savon",
    ],
    price: 22000,
    compareAtPrice: 28000,
    categorySlug: "mode",
    images: ["/catalogue/baskets-urbaines.jpg"],
    stock: 20,
    featured: true,
  },
  {
    name: "Lit bébé en bois",
    slug: "lit-bebe-en-bois",
    description:
      "Un lit en bois clair, aux lignes simples et aux barreaux arrondis, pour accompagner les premières nuits.",
    details: [
      "Bois massif, finition naturelle",
      "Matelas 120 × 60 cm (non inclus)",
      "Sommier réglable en hauteur",
      "Montage simple, visserie fournie",
    ],
    price: 65000,
    compareAtPrice: null,
    categorySlug: "bebe-enfants",
    images: ["/catalogue/lit-bebe-en-bois.jpg"],
    stock: 6,
    featured: true,
  },
  {
    name: "Pâtes spaghetti — 500 g",
    slug: "pates-spaghetti-500g",
    description:
      "Des spaghetti à la texture ferme et régulière. Un basique de placard qui accommode toutes les sauces.",
    details: [
      "Paquet de 500 g",
      "Semoule de blé dur",
      "Cuisson 9 minutes",
      "Conserver au sec",
    ],
    price: 1500,
    compareAtPrice: null,
    categorySlug: "epicerie",
    images: ["/catalogue/pates-spaghetti-500g.jpg"],
    stock: 60,
    featured: false,
  },
  {
    name: "Miel de fleurs — 500 g",
    slug: "miel-de-fleurs-500g",
    description:
      "Un miel de fleurs doux et parfumé, récolté par des apiculteurs locaux. À déguster au petit-déjeuner ou en cuisine.",
    details: [
      "Pot de 500 g",
      "Miel de fleurs, non pasteurisé",
      "Récolte locale",
      "Se conserve à température ambiante",
    ],
    price: 4500,
    compareAtPrice: 5500,
    categorySlug: "epicerie",
    images: ["/catalogue/miel-de-fleurs-500g.jpg"],
    stock: 25,
    featured: false,
  },
  {
    name: "Service de table 12 pièces",
    slug: "service-de-table-12-pieces",
    description:
      "Un service complet pour recevoir : assiettes plates, creuses et à dessert, dans une faïence blanche intemporelle.",
    details: [
      "12 pièces : 4 plates, 4 creuses, 4 à dessert",
      "Faïence émaillée",
      "Compatible lave-vaisselle et micro-ondes",
      "Empilable",
    ],
    price: 24000,
    compareAtPrice: 30000,
    categorySlug: "maison-cuisine",
    images: ["/catalogue/service-de-table-12-pieces.jpg"],
    stock: 10,
    featured: false,
  },
  {
    name: "Set de 6 mugs",
    slug: "set-de-6-mugs",
    description:
      "Six mugs en grès aux anses généreuses, pour le café, le thé ou le chocolat chaud.",
    details: [
      "6 mugs de 300 ml",
      "Grès émaillé",
      "Compatible lave-vaisselle et micro-ondes",
      "Coloris assortis",
    ],
    price: 7500,
    compareAtPrice: null,
    categorySlug: "maison-cuisine",
    images: ["/catalogue/set-de-6-mugs.jpg"],
    stock: 22,
    featured: false,
  },
  {
    name: "T-shirt coton bio",
    slug: "t-shirt-coton-bio",
    description:
      "Un t-shirt uni en coton doux, à la coupe droite et confortable. Se porte seul ou sous une chemise.",
    details: [
      "100 % coton biologique",
      "Coupe unisexe, col rond",
      "Tailles S à XXL",
      "Lavage à 30 °C",
    ],
    price: 6000,
    compareAtPrice: null,
    categorySlug: "mode",
    images: ["/catalogue/t-shirt-coton-bio.jpg"],
    stock: 35,
    featured: false,
  },
  {
    name: "Jean coupe droite",
    slug: "jean-coupe-droite",
    description:
      "Un jean en denim épais, à la coupe droite et à la taille mi-haute. Une pièce solide qui se porte toute l'année.",
    details: [
      "98 % coton, 2 % élasthanne",
      "Coupe droite, taille mi-haute",
      "Tailles 28 à 40",
      "Lavage à l'envers, à froid",
    ],
    price: 15000,
    compareAtPrice: 18000,
    categorySlug: "mode",
    images: ["/catalogue/jean-coupe-droite.jpg"],
    stock: 16,
    featured: false,
  },
  {
    name: "Montre connectée",
    slug: "montre-connectee",
    description:
      "Suivi d'activité, notifications et plusieurs jours d'autonomie : l'essentiel d'une montre connectée, sans complication.",
    details: [
      "Écran tactile couleur",
      "Suivi du pas, du sommeil et de la fréquence cardiaque",
      "Autonomie jusqu'à 7 jours",
      "Bracelet silicone interchangeable",
    ],
    price: 45000,
    compareAtPrice: 55000,
    categorySlug: "electronique",
    images: ["/catalogue/montre-connectee.jpg"],
    stock: 8,
    featured: false,
  },
  {
    name: "Enceinte Bluetooth portable",
    slug: "enceinte-bluetooth-portable",
    description:
      "Une enceinte compacte au son puissant, résistante aux éclaboussures. À emporter partout.",
    details: [
      "Bluetooth 5.0, portée 10 m",
      "Autonomie 12 h",
      "Résistante aux projections d'eau (IPX5)",
      "Câble USB-C inclus",
    ],
    price: 19000,
    compareAtPrice: null,
    categorySlug: "electronique",
    images: ["/catalogue/enceinte-bluetooth-portable.jpg"],
    stock: 14,
    featured: false,
  },
  {
    name: "Savon doux — lot de 3",
    slug: "savon-doux-lot-de-3",
    description:
      "Trois savons végétaux à la mousse crémeuse, pour les mains et le corps. Un geste simple, tous les jours.",
    details: [
      "Lot de 3 savons de 100 g",
      "Base végétale à la glycérine",
      "Sans colorant artificiel",
      "Convient à toute la famille",
    ],
    price: 3500,
    compareAtPrice: null,
    categorySlug: "hygiene-beaute",
    images: ["/catalogue/savon-doux-lot-de-3.jpg"],
    stock: 45,
    featured: false,
  },
  {
    name: "Serviettes de bain — lot de 2",
    slug: "serviettes-de-bain-lot-de-2",
    description:
      "Deux serviettes en coton épais, douces et absorbantes. Un indispensable de la salle de bain.",
    details: [
      "Lot de 2 serviettes 70 × 140 cm",
      "100 % coton éponge 500 g/m²",
      "Lavable en machine à 40 °C",
      "Coloris uni",
    ],
    price: 9000,
    compareAtPrice: 11000,
    categorySlug: "hygiene-beaute",
    images: ["/catalogue/serviettes-de-bain-lot-de-2.jpg"],
    stock: 28,
    featured: false,
  },
  {
    name: "Bodies coton — lot de 3",
    slug: "bodies-coton-lot-de-3",
    description:
      "Trois bodies en coton tout doux, à manches courtes et pressions pratiques, pour habiller bébé sans effort.",
    details: [
      "Lot de 3 bodies, tailles 3 à 24 mois",
      "100 % coton doux",
      "Pressions à l'entrejambe",
      "Lavage à 30 °C",
    ],
    price: 8500,
    compareAtPrice: null,
    categorySlug: "bebe-enfants",
    images: ["/catalogue/bodies-coton-lot-de-3.jpg"],
    stock: 30,
    featured: false,
  },
  {
    name: "Biberon 250 ml",
    slug: "biberon-250-ml",
    description:
      "Un biberon en verre de 250 ml avec tétine souple anti-colique. Facile à nettoyer et à stériliser.",
    details: [
      "Verre borosilicate 250 ml",
      "Tétine silicone anti-colique, débit moyen",
      "Compatible stérilisation",
      "Sans BPA",
    ],
    price: 4000,
    compareAtPrice: null,
    categorySlug: "bebe-enfants",
    images: ["/catalogue/biberon-250-ml.jpg"],
    stock: 26,
    featured: false,
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 8_000,
  });

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    console.log(`→ Connexion à ${MONGODB_DB} sur ${MONGODB_URI}`);

    await Promise.all([
      db.collection("products").createIndex({ slug: 1 }, { unique: true }),
      db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
      db.collection("orders").createIndex({ orderNumber: 1 }, { unique: true }),
      db.collection("orders").createIndex({ createdAt: -1 }),
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("messages").createIndex({ createdAt: -1 }),
    ]);

    /* ---------------------------------------------------------------- */
    /* Admin                                                            */
    /* ---------------------------------------------------------------- */
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await db.collection<AdminUserDoc>("users").updateOne(
      { email: ADMIN_EMAIL },
      {
        $set: {
          name: "Amina Major",
          email: ADMIN_EMAIL,
          passwordHash,
          role: "admin",
        },
        $setOnInsert: {
          _id: new ObjectId(),
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    console.log(`→ Admin prêt : ${ADMIN_EMAIL}`);

    /* ---------------------------------------------------------------- */
    /* Catégories                                                       */
    /* ---------------------------------------------------------------- */
    for (const category of categories) {
      await db.collection<CategoryDoc>("categories").updateOne(
        { slug: category.slug },
        {
          $set: {
            ...category,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            _id: new ObjectId(),
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
    console.log(`→ ${categories.length} catégories`);

    /* ---------------------------------------------------------------- */
    /* Produits                                                         */
    /* ---------------------------------------------------------------- */
    for (const [index, product] of products.entries()) {
      await db.collection<ProductDoc>("products").updateOne(
        { slug: product.slug },
        {
          $set: {
            ...product,
            active: true,
            updatedAt: new Date(),
            // Ordre déterministe : le premier produit est le plus récent et
            // sert de visuel principal sur la page d'accueil.
            createdAt: daysAgo(index + 1),
          },
          $setOnInsert: {
            _id: new ObjectId(),
          },
        },
        { upsert: true },
      );
    }

    const productDocs = await db
      .collection<ProductDoc>("products")
      .find({ slug: { $in: products.map((product) => product.slug) } })
      .toArray();
    const productMap = new Map(
      productDocs.map((doc) => [doc.slug, doc]),
    );
    console.log(`→ ${products.length} produits`);

    /* ---------------------------------------------------------------- */
    /* Promotions                                                       */
    /* ---------------------------------------------------------------- */
    const promotions: Array<Omit<PromotionDoc, "_id" | "createdAt" | "updatedAt">> =
      [
        {
          title: "La rentrée connectée",
          description:
            "Casques, montres et enceintes : -20 % sur tout le rayon Électronique jusqu'à la fin du mois.",
          type: "percent",
          value: 20,
          scope: "category",
          categorySlug: "electronique",
          productIds: [],
          startsAt: daysAgo(2),
          endsAt: daysFromNow(12),
          active: true,
          image: "/catalogue/categorie-electronique.jpg",
        },
        {
          title: "Le panier malin",
          description:
            "Riz, pâtes et miel : -15 % sur l'épicerie cette semaine pour remplir le placard à petit prix.",
          type: "percent",
          value: 15,
          scope: "category",
          categorySlug: "epicerie",
          productIds: [],
          startsAt: daysAgo(1),
          endsAt: daysFromNow(7),
          active: true,
          image: "/catalogue/categorie-epicerie.jpg",
        },
        {
          title: "Week-end famille",
          description:
            "5 000 FCFA de remise sur le lit bébé en bois et le lot de bodies en coton.",
          type: "fixed",
          value: 5000,
          scope: "products",
          categorySlug: null,
          productIds: [
            productMap.get("lit-bebe-en-bois")?._id.toString() ?? "",
            productMap.get("bodies-coton-lot-de-3")?._id.toString() ?? "",
          ].filter(Boolean),
          startsAt: daysAgo(5),
          endsAt: daysFromNow(3),
          active: true,
          image: "/catalogue/categorie-bebe-enfants.jpg",
        },
        {
          title: "Fêtes de fin d'année",
          description:
            "Une opération terminée, conservée pour l'historique des promotions.",
          type: "percent",
          value: 20,
          scope: "all",
          categorySlug: null,
          productIds: [],
          startsAt: daysAgo(40),
          endsAt: daysAgo(10),
          active: false,
          image: "",
        },
      ];

    for (const promotion of promotions) {
      await db.collection<PromotionDoc>("promotions").updateOne(
        { title: promotion.title },
        {
          $set: {
            ...promotion,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            _id: new ObjectId(),
            createdAt: daysAgo(15),
          },
        },
        { upsert: true },
      );
    }
    console.log(`→ ${promotions.length} promotions`);

    /* ---------------------------------------------------------------- */
    /* Commandes de démonstration                                       */
    /* ---------------------------------------------------------------- */
    const orderCount = await db.collection("orders").countDocuments();

    if (orderCount === 0) {
      const item = (slug: string, quantity: number): OrderItem => {
        const product = productMap.get(slug);
        if (!product) throw new Error(`Produit introuvable : ${slug}`);
        return {
          productId: product._id.toString(),
          name: product.name,
          slug: product.slug,
          image: product.images[0] ?? "",
          unitPrice: product.price,
          quantity,
          lineTotal: product.price * quantity,
        };
      };

      const order = (
        orderNumber: string,
        customer: OrderDoc["customer"],
        items: OrderItem[],
        status: OrderDoc["status"],
        createdAt: Date,
        adminNote = "",
      ): OrderDoc => {
        const subtotal = items.reduce((sum, entry) => sum + entry.lineTotal, 0);
        const shippingFee = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
        return {
          _id: new ObjectId(),
          orderNumber,
          customer,
          items,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          status,
          adminNote,
          createdAt,
          updatedAt: createdAt,
        };
      };

      const orders: OrderDoc[] = [
        order(
          "MAJOR-DEMO0001",
          {
            fullName: "Awa Traoré",
            phone: "+229 01 97 12 34 56",
            email: "awa.traore@example.com",
            address: "Fidjrossè, rue des Pêcheurs, villa 12",
            city: "Cotonou",
            notes: "Appeler avant d'arriver, portail vert.",
          },
          [item("riz-parfume-long-grain", 1), item("miel-de-fleurs-500g", 2)],
          "pending",
          hoursAgo(2),
        ),
        order(
          "MAJOR-DEMO0002",
          {
            fullName: "Koffi Yao",
            phone: "+229 01 96 98 76 21",
            email: "koffi.yao@example.com",
            address: "Akpakpa, immeuble Les Palmiers, apt 4B",
            city: "Cotonou",
            notes: "",
          },
          [item("casque-bluetooth-sans-fil", 1), item("montre-connectee", 1)],
          "confirmed",
          daysAgo(1),
          "Commande confirmée par téléphone. Livraison prévue vendredi.",
        ),
        order(
          "MAJOR-DEMO0003",
          {
            fullName: "Fatou Diallo",
            phone: "+229 01 95 33 44 55",
            email: "fatou.diallo@example.com",
            address: "Djègan-Kpèvi, face à la pharmacie du marché",
            city: "Porto-Novo",
            notes: "Livrer après 16 h si possible.",
          },
          [item("marmite-inox-5l", 1), item("savon-doux-lot-de-3", 3)],
          "shipped",
          daysAgo(3),
          "Colis remis au transporteur — suivi TR-8842.",
        ),
        order(
          "MAJOR-DEMO0004",
          {
            fullName: "Yann Kouassi",
            phone: "+229 01 94 65 43 21",
            email: "yann.kouassi@example.com",
            address: "Zongo, avenue Steinmetz, résidence Akwaba",
            city: "Cotonou",
            notes: "",
          },
          [item("baskets-urbaines", 1), item("jean-coupe-droite", 1)],
          "delivered",
          daysAgo(6),
          "Livrée et réglée en espèces.",
        ),
        order(
          "MAJOR-DEMO0005",
          {
            fullName: "Mariam Bamba",
            phone: "+229 01 93 20 30 40",
            email: "mariam.bamba@example.com",
            address: "Titirou, près du stade",
            city: "Parakou",
            notes: "",
          },
          [item("lit-bebe-en-bois", 1)],
          "cancelled",
          daysAgo(8),
          "Annulée : adresse hors zone de livraison.",
        ),
        order(
          "MAJOR-DEMO0006",
          {
            fullName: "Awa Traoré",
            phone: "+229 01 97 12 34 56",
            email: "awa.traore@example.com",
            address: "Fidjrossè, rue des Pêcheurs, villa 12",
            city: "Cotonou",
            notes: "Deuxième commande de la semaine.",
          },
          [item("biberon-250-ml", 2), item("bodies-coton-lot-de-3", 1)],
          "pending",
          hoursAgo(5),
        ),
      ];

      await db.collection<OrderDoc>("orders").insertMany(orders);
      console.log(`→ ${orders.length} commandes de démonstration`);
    } else {
      console.log(
        `→ ${orderCount} commande(s) déjà présente(s), aucune insertion`,
      );
    }

    /* ---------------------------------------------------------------- */
    /* Messages de contact                                              */
    /* ---------------------------------------------------------------- */
    const messageCount = await db.collection("messages").countDocuments();

    if (messageCount === 0) {
      const messages: ContactMessageDoc[] = [
        {
          _id: new ObjectId(),
          name: "Awa Traoré",
          email: "awa.traore@example.com",
          phone: "+229 01 97 12 34 56",
          subject: "Question sur la livraison",
          message:
            "Bonjour, je souhaite savoir s'il est possible de livrer à Fidjrossè le samedi matin. Ma commande MAJOR-DEMO0001 (riz et miel) est en attente. Merci !",
          read: false,
          createdAt: hoursAgo(3),
        },
        {
          _id: new ObjectId(),
          name: "Jean-Marc Ehouman",
          email: "jm.ehouman@example.com",
          phone: "+229 01 92 12 34 78",
          subject: "Disponibilité de la marmite inox",
          message:
            "La marmite inox 5 L est-elle disponible en boutique ? J'aimerais la voir avant de commander. Merci d'avance.",
          read: true,
          createdAt: daysAgo(2),
        },
        {
          _id: new ObjectId(),
          name: "Aïcha Koné",
          email: "aicha.kone@example.com",
          phone: "",
          subject: "Commande pour un cadeau",
          message:
            "Bonjour, pouvez-vous préparer un panier cadeau avec le miel, le coffret soin et les serviettes de bain ? Je voudrais ajouter un mot manuscrit. Est-ce possible ?",
          read: false,
          createdAt: daysAgo(4),
        },
      ];

      await db.collection<ContactMessageDoc>("messages").insertMany(messages);
      console.log(`→ ${messages.length} messages de démonstration`);
    } else {
      console.log(
        `→ ${messageCount} message(s) déjà présent(s), aucune insertion`,
      );
    }

    console.log("\n✨ Base Major et fils prête.");
    console.log(`   Admin : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log("   Lancez npm run dev puis ouvrez http://localhost:3000");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("\n✗ Échec du seed :", error);
  process.exitCode = 1;
});
