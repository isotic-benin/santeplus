"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  BadgePercent,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  ShoppingBag,
  Tags,
} from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { cn, initials } from "@/lib/utils";
import type { AdminUser } from "@/lib/types";

const nav = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/promotions", label: "Promotions", icon: BadgePercent },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export function Sidebar({
  admin,
  pendingOrders,
  unreadMessages,
}: {
  admin: AdminUser;
  pendingOrders: number;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const active = mobileNavRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const badgeFor = (href: string) => {
    if (href === "/admin/commandes" && pendingOrders > 0) return pendingOrders;
    if (href === "/admin/messages" && unreadMessages > 0) return unreadMessages;
    return null;
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink text-base lg:flex">
        <div className="border-b border-base/10 px-6 py-7">
          <Link href="/admin" className="inline-flex flex-col leading-none">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-base/45">
              Major
            </span>
            <span className="mt-1.5 font-display text-2xl tracking-[-0.04em]">
              et fils
            </span>
          </Link>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Administration
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6" aria-label="Navigation administration">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            const badge = badgeFor(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-3 py-2.5 text-xs font-medium transition-colors",
                  active
                    ? "border-accent bg-base/8 text-base"
                    : "border-transparent text-base/55 hover:bg-base/5 hover:text-base",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                <span className="flex-1">{item.label}</span>
                {badge !== null && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-base/10 px-4 py-5">
          <Link
            href="/"
            target="_blank"
            className="mb-4 flex items-center justify-between border border-base/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-base/60 transition-colors hover:border-base/40 hover:text-base"
          >
            Voir la boutique
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-base/10 text-[11px] font-semibold text-base">
              {initials(admin.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-base/90">
                {admin.name}
              </p>
              <p className="truncate text-[11px] text-base/45">{admin.email}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="grid h-8 w-8 place-items-center text-base/45 transition-colors hover:text-accent"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-30 bg-ink text-base lg:hidden">
        <div className="flex items-center justify-between gap-4 px-5">
          <Link
            href="/admin"
            className="inline-flex min-h-12 items-center font-display text-xl"
          >
            Major et fils
            <span className="ml-2 text-[11px] font-sans uppercase tracking-[0.14em] text-accent">
              Admin
            </span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="grid h-11 w-11 place-items-center text-base/70 hover:text-accent"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div className="relative">
          <nav
            ref={mobileNavRef}
            className="flex gap-1 overflow-x-auto border-t border-base/10 px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Navigation administration mobile"
          >
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              const badge = badgeFor(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
                    active
                      ? "bg-base/10 text-base"
                      : "text-base/50 hover:text-base",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="relative">
                    <Icon className="h-3.5 w-3.5" />
                    {badge !== null && (
                      <span className="absolute -right-1.5 -top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </span>
                  {item.label === "Tableau de bord" ? "Accueil" : item.label}
                </Link>
              );
            })}
          </nav>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-ink to-transparent"
          />
        </div>
      </div>
    </>
  );
}
