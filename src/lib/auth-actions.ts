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
  if (tooManyAttempts(email)) {
    return {
      ok: false,
      error: "Trop de tentatives. Réessayez dans quelques minutes.",
    };
  }

  const db = await getDb();
  const user = await db
    .collection<AdminUserDoc>("users")
    .findOne({ email });

  const valid =
    user && (await verifyPassword(parsed.data.password, user.passwordHash));

  if (!valid || !user) {
    return { ok: false, error: "E-mail ou mot de passe incorrect." };
  }

  const admin: AdminUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: "admin",
  };

  await createAdminSession(admin);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
