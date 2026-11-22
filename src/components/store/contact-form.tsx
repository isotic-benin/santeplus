"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitContact } from "@/lib/store-actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState,
  );
  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  if (state.ok) {
    return (
      <div className="border-2 border-ink border-l-4 border-l-accent bg-surface p-8 sm:p-10">
        <CheckCircle2 className="h-9 w-9 text-accent" strokeWidth={2} />
        <h2 className="mt-5 text-3xl font-extrabold uppercase tracking-[-0.04em]">Message bien reçu</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {state.message ??
            "Merci pour votre message. Notre équipe vous répond sous 24 h ouvrées."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <div
          role="alert"
          className="border-2 border-[#8a1f1f] bg-[#f5dfdd] px-4 py-3 text-sm font-semibold text-[#8a1f1f]"
        >
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Nom complet *
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            className="input"
            aria-invalid={Boolean(errorFor("name"))}
            placeholder="Votre nom"
          />
          {errorFor("name") && <p className="field-error">{errorFor("name")}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            E-mail *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            aria-invalid={Boolean(errorFor("email"))}
            placeholder="vous@exemple.com"
          />
          {errorFor("email") && (
            <p className="field-error">{errorFor("email")}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="label">
            Téléphone{" "}
            <span className="font-normal text-ink-3">(facultatif)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="input"
            placeholder="+229 01 00 00 00 00"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="label">
            Sujet *
          </label>
          <input
            id="contact-subject"
            name="subject"
            required
            className="input"
            aria-invalid={Boolean(errorFor("subject"))}
            placeholder="Question sur une commande, un produit…"
          />
          {errorFor("subject") && (
            <p className="field-error">{errorFor("subject")}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          Votre message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          className="textarea min-h-36"
          aria-invalid={Boolean(errorFor("message"))}
          placeholder="Dites-nous tout…"
        />
        {errorFor("message") && (
          <p className="field-error">{errorFor("message")}</p>
        )}
      </div>

      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Site web</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button type="submit" disabled={pending} className="btn btn-accent">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            Envoyer le message <Send className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-xs text-ink-3">
        En envoyant ce formulaire, vous acceptez que nous utilisions vos
        coordonnées pour vous répondre.
      </p>
    </form>
  );
}
