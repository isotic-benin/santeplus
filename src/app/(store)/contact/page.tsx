import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ContactForm } from "@/components/store/contact-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question sur une commande, un produit ou une livraison ? L'équipe Major et fils vous répond sous 24 h ouvrées.",
};

const infoBlocks = [
  {
    icon: Truck,
    title: "Livraison",
    id: "livraison",
    text: "Cotonou et Porto-Novo sous 24 à 72 h. Reste du pays sous 3 à 5 jours ouvrés. Livraison offerte dès 50 000 FCFA d'achat.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement",
    id: "paiement",
    text: "Aucun paiement en ligne. Vous réglez à la réception, en espèces ou par mobile money, directement au livreur.",
  },
  {
    icon: RotateCcw,
    title: "Retours",
    id: "retours",
    text: "Un produit ne vous convient pas ? Contactez-nous sous 7 jours après réception pour un échange ou un remboursement.",
  },
];

export default function ContactPage() {
  return (
    <div>
      <section className="border-b-2 border-ink">
        <div className="shell grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16 lg:py-14">
          <div>
            <p className="eyebrow">Contact · 04</p>
            <h1 className="hero-title mt-5 max-w-[14ch] text-4xl sm:text-6xl lg:text-7xl">
              Parlons de vos envies.
            </h1>
          </div>
          <p className="max-w-md border-l-4 border-accent pl-5 text-base font-medium leading-relaxed text-ink-2">
            Une question sur un produit, une commande en cours ou simplement
            envie d&apos;un conseil ? Écrivez-nous : une vraie personne vous
            répond, sous 24 h ouvrées.
          </p>
        </div>
      </section>

      <section className="shell section-sm grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12">
        <div>
          <h2 className="text-3xl font-extrabold uppercase tracking-[-0.04em]">
            Nos coordonnées
          </h2>
          <ul className="mt-6 space-y-0 border-t-2 border-ink">
            {[
              { icon: MapPin, label: "Adresse", value: siteConfig.address, href: null },
              {
                icon: Phone,
                label: "Téléphone",
                value: siteConfig.phone,
                href: `tel:${siteConfig.phone.replace(/\s/g, "")}`,
              },
              {
                icon: Mail,
                label: "E-mail",
                value: siteConfig.email,
                href: `mailto:${siteConfig.email}`,
              },
              { icon: Clock, label: "Horaires", value: siteConfig.hours, href: null },
            ].map((entry) => {
              const Icon = entry.icon;
              return (
                <li
                  key={entry.label}
                  className="flex gap-4 border-b-2 border-ink py-5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center bg-accent text-white">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="meta">{entry.label}</p>
                    {entry.href ? (
                      <a
                        href={entry.href}
                        className="link-underline mt-1 inline-block font-semibold"
                      >
                        {entry.value}
                      </a>
                    ) : (
                      <p className="mt-1 font-semibold">{entry.value}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 border-l-4 border-accent bg-surface p-5 text-sm leading-relaxed text-ink-2">
            <p className="meta text-ink">Commande en cours ?</p>
            <p className="mt-2">
              Munissez-vous de votre numéro de commande (MAJOR-…) pour un suivi
              plus rapide. Il figure sur la page de confirmation.
            </p>
          </div>
        </div>

        <div className="panel p-6 sm:p-9">
          <h2 className="text-3xl font-extrabold uppercase tracking-[-0.04em]">
            Écrivez-nous
          </h2>
          <p className="mt-2 mb-8 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
            Les champs marqués d&apos;un astérisque sont obligatoires.
          </p>
          <ContactForm />
        </div>
      </section>

      <section className="border-t-2 border-ink bg-surface">
        <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:py-12">
          {infoBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.id} id={block.id} className="scroll-mt-28">
                <span className="grid h-10 w-10 place-items-center bg-ink text-white">
                  <Icon className="h-5 w-5 text-accent-soft" strokeWidth={2} />
                </span>
                <h2 className="mt-4 text-2xl font-extrabold uppercase tracking-[-0.04em]">
                  {block.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {block.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
