import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Truck, ShieldCheck, RotateCcw } from "lucide-react";
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
      <section className="border-b border-line">
        <div className="shell grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16 lg:py-14">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="hero-title mt-5 max-w-[13ch] text-4xl sm:text-6xl lg:text-7xl">
              Parlons de vos <em className="font-normal italic text-accent">envies.</em>
            </h1>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink-2">
            Une question sur un produit, une commande en cours ou simplement
            envie d&apos;un conseil ? Écrivez-nous : une vraie personne vous
            répond, sous 24 h ouvrées.
          </p>
        </div>
      </section>

      <section className="shell section-sm grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div>
          <h2 className="font-display text-3xl">Nos coordonnées</h2>
          <ul className="mt-6 space-y-6 border-t border-line pt-6 text-base">
            <li className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-line text-accent">
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Adresse
                </p>
                <p className="mt-1 text-ink">{siteConfig.address}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-line text-accent">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Téléphone
                </p>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                  className="mt-1 inline-block text-ink link-underline"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-line text-accent">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  E-mail
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-1 inline-block text-ink link-underline"
                >
                  {siteConfig.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-line text-accent">
                <Clock className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Horaires
                </p>
                <p className="mt-1 text-ink">{siteConfig.hours}</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 border border-line bg-surface-2/60 p-5 text-sm leading-relaxed text-ink-2">
            <p className="font-semibold uppercase tracking-[0.12em] text-ink">
              Commande en cours ?
            </p>
            <p className="mt-2">
              Munissez-vous de votre numéro de commande (MAJOR-…) pour un suivi
              plus rapide. Il figure sur la page de confirmation.
            </p>
          </div>
        </div>

        <div className="border border-line bg-surface p-6 sm:p-10">
          <h2 className="font-display text-3xl">Écrivez-nous</h2>
          <p className="mt-2 mb-8 text-sm text-ink-2">
            Les champs marqués d&apos;un astérisque sont obligatoires.
          </p>
          <ContactForm />
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:py-12">
          {infoBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.id} id={block.id} className="scroll-mt-28">
                <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                <h2 className="mt-4 font-display text-2xl">{block.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-ink-2">
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
