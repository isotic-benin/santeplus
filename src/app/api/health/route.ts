import { connection, NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/mongodb";

/**
 * Endpoint de diagnostic : `GET /api/health`.
 * 200 si MongoDB répond au `ping`, 503 sinon (avec le message d'erreur).
 * `connection()` force l'exécution à la requête, jamais au build.
 */
export async function GET() {
  await connection();

  const health = await getDatabaseHealth();
  const message = health.error?.slice(0, 400);

  return NextResponse.json(
    {
      status: health.ok ? "ok" : "degraded",
      database: health.ok ? "up" : "down",
      latencyMs: health.latencyMs,
      checkedAt: new Date().toISOString(),
      ...(message ? { error: message } : {}),
      ...(health.ok
        ? {}
        : {
            hint: "Vérifier : cluster Atlas actif, Network Access (0.0.0.0/0 pour Vercel), MONGODB_URI valide, limite de connexions du cluster.",
          }),
    },
    { status: health.ok ? 200 : 503 },
  );
}
