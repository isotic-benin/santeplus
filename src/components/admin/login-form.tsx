"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="border border-[#9b2c2c]/30 bg-[#f9e9e7] px-4 py-3 text-sm text-[#8a3229]"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue="admin@majoretfils.com"
          className="input"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email?.[0] && (
          <p className="field-error">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password?.[0] && (
          <p className="field-error">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn btn-accent w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
          </>
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" /> Se connecter
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
