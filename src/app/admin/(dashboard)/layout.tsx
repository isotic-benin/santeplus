import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { getAdminBadges } from "@/lib/admin-data";
import { Sidebar } from "@/components/admin/sidebar";

export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s · Admin Major et fils",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [admin, badges] = await Promise.all([requireAdmin(), getAdminBadges()]);

  return (
    <div className="min-h-screen bg-base lg:flex">
      <Sidebar
        admin={admin}
        pendingOrders={badges.pendingOrders}
        unreadMessages={badges.unreadMessages}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[82rem] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
