import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Les images ne traversent plus les Server Actions : elles sont envoyées
  // directement du navigateur vers Vercel Blob (`@vercel/blob/client`), ce qui
  // évite la limite de 4,5 Mo sur le corps des fonctions Vercel.
  images: {
    remotePatterns: [
      // Vercel Blob (*.public.blob.vercel-storage.com) et visuels distants.
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
