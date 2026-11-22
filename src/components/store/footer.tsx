import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { getCurrentYear } from "@/lib/server-time";

export async function Footer() {
  const year = await getCurrentYear();
  const phone = siteConfig.phone;
  const email = siteConfig.email;
  const address = siteConfig.address;

  return (
    <footer className="mt-auto border-t-2 border-ink bg-ink text-white">
      <div className="shell py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-soft">
              Major et fils · Bénin
            </p>
            <p className="mt-4 flex flex-col text-5xl font-extrabold uppercase leading-[0.86] tracking-[-0.06em] sm:text-7xl">
              <span>Le quotidien,</span>
              <span className="text-accent-soft">livré.</span>
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
              Alimentation, maison, mode et quotidien. Commandez en ligne,
              réglez à la livraison, sans carte bancaire.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent-soft">
                Contact
              </p>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-accent">
                    <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <a href={`mailto:${email}`} className="break-all hover:underline">
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-accent">
                    <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:underline">
                    {phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-accent">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <span>{address}</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent-soft">
                Navigation
              </p>
              <ul className="mt-5 space-y-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                <li>
                  <Link href="/" className="hover:text-accent-soft">
                    01 — Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/catalogue" className="hover:text-accent-soft">
                    02 — Catalogue
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-accent-soft">
                    03 — Contact
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-accent-soft">
                    Espace administration
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t-2 border-white/30 pt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
          <p>
            {year} © Major et fils
          </p>
          <p>Paiement à la livraison · Retours sous 7 jours</p>
        </div>
      </div>
    </footer>
  );
}
