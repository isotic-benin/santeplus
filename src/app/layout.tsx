import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
      className={`${fraunces.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-base text-ink">
        {children}
      </body>
    </html>
  );
}
