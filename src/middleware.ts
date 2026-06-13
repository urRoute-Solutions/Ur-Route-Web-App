import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/constants/auth";
import { verifyAccessToken } from "@/lib/auth/tokens";

/**
 * Edge middleware — the first gate every request hits.
 *
 * Runs on the EDGE runtime, so it may only use Web-Crypto-based code (jose ✓,
 * bcrypt/Prisma ✗). Responsibilities, deliberately coarse:
 *   1. CSRF: reject cross-origin state-changing API requests (Origin check)
 *      layered on top of SameSite=Lax cookies.
 *   2. Page protection: bounce unauthenticated users away from dashboards and
 *      route each role to its own area (defense-in-depth; pages re-check
 *      server-side via requireRole).
 *
 * Fine-grained API authz stays in the Node route handlers (they can hit the DB
 * and throw typed 401/403). Middleware never makes the final API decision.
 */

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  OPERATOR: "/operator",
  TRAVELER: "/dashboard",
};

// Route-prefix → roles allowed to view it.
const PROTECTED: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/operator", roles: ["OPERATOR"] },
  { prefix: "/dashboard", roles: ["TRAVELER"] },
];

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. CSRF origin check for mutating API calls ──────────────────────────
  if (pathname.startsWith("/api") && !SAFE_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      const allowed = req.nextUrl.origin;
      if (origin !== allowed) {
        return NextResponse.json(
          { success: false, error: { code: "CSRF", message: "Cross-origin request blocked" } },
          { status: 403 },
        );
      }
    }
    // API auth itself is enforced in the route handlers.
    return NextResponse.next();
  }

  // ── 2. Page protection ───────────────────────────────────────────────────
  const guard = PROTECTED.find((p) => pathname.startsWith(p.prefix));
  if (!guard) return NextResponse.next();

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const principal = token ? await safeVerify(token) : null;

  if (!principal) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (!guard.roles.includes(principal.role)) {
    // Wrong role → send to that role's own home.
    return NextResponse.redirect(new URL(ROLE_HOME[principal.role] ?? "/", req.url));
  }

  return NextResponse.next();
}

async function safeVerify(token: string) {
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export const config = {
  // Skip static assets and Next internals; run on pages + API.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
