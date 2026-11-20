"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { createAdminSession, destroyAdminSession, verifyPassword } from "@/lib/auth";
import { loginSchema, fieldErrors } from "@/lib/validators";
import type { AdminUser, AdminUserDoc, ActionState } from "@/lib/types";

const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(email: string) {
  const now = Date.now();
  const entry = attempts.get(email);
  if (!entry || entry.resetAt < now) {
    attempts.set(email, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}

type LoginLookup =
  | { ok: true; admin: AdminUser }
  | { ok: false; state: ActionState };

async function lookupAdmin(email: string, password: string): Promise<LoginLookup> {
  try {
    const db = await getDb();
    const user = await db
      .collection<AdminUserDoc>("users")
      .findOne({ email });

    const valid =
      user && (await verifyPassword(password, user.passwordHash));

    if (!valid || !user) {
      // Le quota anti-brute-force ne doit être consommé que par un vrai
      // échec d'authentification : une panne MongoDB ne doit pas verrouiller
      // le compte administrateur pendant 10 minutes.
      if (tooManyAttempts(email)) {
        return {
          ok: false,
          state: {
            ok: false,
            error: "Trop de tentatives. Réessayez dans quelques minutes.",
          },
        };
      }
      return {
        ok: false,
        state: { ok: false, error: "E-mail ou mot de passe incorrect." },
      };
    }

    attempts.delete(email);
    return {
      ok: true,
      admin: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: "admin",
      },
    };
  } catch (error) {
    console.error("[auth] MongoDB indisponible lors de la connexion", error);
    return {
      ok: false,
      state: {
        ok: false,
        error:
          "Service momentanément indisponible. Réessayez dans quelques instants.",
      },
    };
  }
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const lookup = await lookupAdmin(email, parsed.data.password);
  if (!lookup.ok) return lookup.state;

  await createAdminSession(lookup.admin);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
