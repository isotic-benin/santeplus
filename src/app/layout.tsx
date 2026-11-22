import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    "Major et fils réunit l'essentiel du quotidien : alimentation, maison et cuisine, mode, électronique, hygiène et articles pour bébé. Commandez en ligne, payez à la livraison.",
  keywords: [
    "e-commerce",
    "commerce général",
    "alimentation",
    "maison",
    "cuisine",
    "mode",
    "électronique",
    "hygiène",
    "bébé",
    "paiement à la livraison",
    "Bénin",
  ],
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description:
      "Tout pour la maison, la famille et le quotidien, à prix justes. Paiement à la livraison.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${plexMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-base text-ink">
        {children}
      </body>
    </html>
  );
}
