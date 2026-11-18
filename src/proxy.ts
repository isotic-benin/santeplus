import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "kora_admin";

async function hasValidSession(token: string | undefined) {
  if (!token) return false;

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return false;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return payload.role === "admin" && Boolean(payload.sub);
  } catch {
    return false;
  }
}

/**
 * Protège tout le back-office avant le rendu.
 *
 * Sans ce filtre, la coquille PPR de `/admin` est envoyée en 200 avec une
 * redirection client ; ici, un visiteur sans session reçoit un vrai 307 vers
 * la page de connexion. La vérification complète de la session reste faite
 * dans les layouts et les Server Actions via `requireAdmin()`/`assertAdmin()`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (await hasValidSession(token)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
