import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { getCurrentYear } from "@/lib/server-time";
import { LoginForm } from "@/components/admin/login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Connexion administration",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  const year = await getCurrentYear();

  return (
    <div className="grid min-h-screen bg-base lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-base lg:flex xl:p-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-base/50">
            Major
          </p>
          <p className="mt-2 font-display text-3xl tracking-[-0.04em]">et fils</p>
        </div>

        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Espace administration
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] xl:text-6xl">
            Le calme derrière la boutique.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-base/60">
            Gérez les produits, les promotions et les commandes depuis un seul
            tableau de bord. Simple, lisible, sans bruit.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-base/15 pt-6 text-[11px] uppercase tracking-[0.16em] text-base/45">
          <span>Paiement à la livraison</span>
          <span>© {year} Major et fils</span>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-20 select-none font-display text-[24rem] leading-none text-base/5"
        >
          M
        </span>
      </aside>

      <main className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la boutique
          </Link>

          <div className="mt-10 lg:mt-16">
            <p className="eyebrow">Administration</p>
            <h2 className="display mt-3 text-4xl">Connexion</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Accédez à votre tableau de bord pour gérer la boutique.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-ink-3">
            Le compte administrateur est créé par le script de seed. Identifiants
            par défaut : <span className="text-ink-2">admin@majoretfils.com</span>{" "}
            · mot de passe défini dans votre fichier <code>.env.local</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
