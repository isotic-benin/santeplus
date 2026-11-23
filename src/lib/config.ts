export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Major et fils",
  tagline: "Alimentation, maison, mode et quotidien.",
  email: "dotougbechoevi@gmail.com",
  phone: "+229 01 66 27 73 31",
  address: "Porto-Novo, Bénin",
  hours: "Lundi – Samedi, 9h – 18h",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "XOF",
  locale: "fr-FR",
  // Livraison offerte : valeur fixe, indépendante de l'environnement.
  shippingFee: 0,
  freeShippingThreshold: 0,
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
} as const;
