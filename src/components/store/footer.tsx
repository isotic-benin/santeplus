import { Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { getCurrentYear } from "@/lib/server-time";

export async function Footer() {
  const year = await getCurrentYear();
  const phone = siteConfig.phone;
  const email = siteConfig.email;
  const address = siteConfig.address;

  return (
    <footer className="mt-auto bg-surface text-ink-2">
      <div className="shell py-9">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-3xl font-display font-bold tracking-wider">Major et fils</p>
          <p className="mt-2 text-base">
            Alimentation, maison, mode et quotidien — livrés chez vous.
          </p>
          <p className="mt-1 text-xs text-ink-3">
            {year} &copy; Major et fils
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-accent" strokeWidth={1.6} />
              <a href={`mailto:${email}`} className="hover:text-ink">
                {email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-accent" strokeWidth={1.6} />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-ink">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-accent" strokeWidth={1.6} />
              <span>{address}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
