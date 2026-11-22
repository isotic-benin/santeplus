export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Major et fils",
  tagline: "Alimentation, maison, mode et quotidien.",
  email: "dotougbechoevi@gmail.com",
  phone: "+229 01 66 27 73 31",
  address: "Porto-Novo, Bénin",
  hours: "Lundi – Samedi, 9h – 18h",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "XOF",
  locale: "fr-FR",
  shippingFee: Number(process.env.NEXT_PUBLIC_SHIPPING_FEE ?? 0),
  freeShippingThreshold: Number(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 0,
  ),
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
} as const;
