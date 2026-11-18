import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MailOpen, Phone } from "lucide-react";
import { getAdminMessages } from "@/lib/admin-data";
import { deleteMessage, toggleMessageRead } from "@/lib/admin-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteForm } from "@/components/admin/delete-form";
import { formatDateTime } from "@/lib/utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Messages",
};

interface SearchParams {
  filtre?: string | string[];
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filter = first(params.filtre) === "non-lus" ? "non-lus" : "tous";

  const messages = await getAdminMessages();
  const unread = messages.filter((message) => !message.read);
  const displayed = filter === "non-lus" ? unread : messages;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Relation client"
        title="Messages"
        description={`${messages.length} message${messages.length > 1 ? "s" : ""} reçu${messages.length > 1 ? "s" : ""} via le formulaire de contact · ${unread.length} non lu${unread.length > 1 ? "s" : ""}.`}
        actions={
          <span className={`badge ${unread.length > 0 ? "status-pending" : "status-delivered"}`}>
            {unread.length} non lu{unread.length > 1 ? "s" : ""}
          </span>
        }
      />

      <nav
        aria-label="Filtrer les messages"
        className="mt-8 flex flex-wrap gap-2"
      >
        <Link
          href="/admin/messages"
          className={`inline-flex min-h-11 items-center gap-2 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
            filter === "tous"
              ? "border-ink bg-ink text-base"
              : "border-line-strong text-ink-2 hover:border-ink hover:text-ink"
          }`}
        >
          Tous
          <span
            className={`tabular-nums ${filter === "tous" ? "text-base/60" : "text-ink-3"}`}
          >
            {messages.length}
          </span>
        </Link>
        <Link
          href="/admin/messages?filtre=non-lus"
          className={`inline-flex min-h-11 items-center gap-2 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
            filter === "non-lus"
              ? "border-ink bg-ink text-base"
              : "border-line-strong text-ink-2 hover:border-ink hover:text-ink"
          }`}
        >
          Non lus
          <span
            className={`tabular-nums ${filter === "non-lus" ? "text-base/60" : "text-ink-3"}`}
          >
            {unread.length}
          </span>
        </Link>
      </nav>

      {displayed.length === 0 ? (
        <div className="admin-card mt-6 flex flex-col items-center px-6 py-16 text-center">
          <MailOpen className="h-8 w-8 text-ink-3" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl">
            {filter === "non-lus" ? "Tout est lu" : "Aucun message"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-2">
            {filter === "non-lus"
              ? "Les messages déjà traités restent consultables dans l'onglet Tous."
              : "Les demandes envoyées depuis la page contact apparaîtront ici."}
          </p>
          {filter === "non-lus" && (
            <Link href="/admin/messages" className="btn btn-outline mt-6">
              Voir tous les messages
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {displayed.map((message) => (
            <li
              key={message.id}
              className={`admin-card overflow-hidden ${
                message.read ? "" : "border-l-2 border-l-accent"
              }`}
            >
              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl leading-tight">
                        {message.subject}
                      </h2>
                      {!message.read && (
                        <span className="badge status-pending">Nouveau</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-2">
                      <span className="font-semibold text-ink">
                        {message.name}
                      </span>{" "}
                      · <span className="break-all">{message.email}</span>
                    </p>
                  </div>
                  <p className="text-xs text-ink-3">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>

                <p className="whitespace-pre-line border-t border-line pt-4 text-sm leading-relaxed text-ink-2">
                  {message.message}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        `Re: ${message.subject}`,
                      )}`}
                      className="inline-flex min-h-9 items-center gap-1.5 hover:text-ink"
                    >
                      <Mail className="h-3.5 w-3.5" /> Répondre
                    </a>
                    {message.phone && (
                      <a
                        href={`tel:${message.phone.replace(/\s/g, "")}`}
                        className="inline-flex min-h-9 items-center gap-1.5 hover:text-ink"
                      >
                        <Phone className="h-3.5 w-3.5" /> {message.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <form action={toggleMessageRead}>
                      <input type="hidden" name="id" value={message.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-accent"
                      >
                        {message.read ? (
                          <>
                            <Mail className="h-3.5 w-3.5" /> Marquer non lu
                          </>
                        ) : (
                          <>
                            <MailOpen className="h-3.5 w-3.5" /> Marquer comme
                            lu
                          </>
                        )}
                      </button>
                    </form>
                    <DeleteForm
                      action={deleteMessage}
                      id={message.id}
                      label="Supprimer"
                      confirmText={`Supprimer le message de ${message.name} ? Cette action est définitive.`}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
