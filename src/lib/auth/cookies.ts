import { cookies } from "next/headers";
import { getEnv } from "@/config/env";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/constants/auth";

/**
 * httpOnly cookie helpers. Tokens live in httpOnly + Secure + SameSite=Lax
 * cookies so client JS can never read them (XSS can't exfiltrate) and they
 * aren't sent on cross-site requests (CSRF mitigation alongside same-site).
 */
function baseOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setAuthCookies(access: string, refresh: string) {
  const env = getEnv();
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, access, {
    ...baseOptions(),
    maxAge: env.JWT_ACCESS_TTL,
  });
  jar.set(REFRESH_COOKIE, refresh, {
    ...baseOptions(),
    maxAge: env.JWT_REFRESH_TTL,
    // Refresh cookie only needs to reach the refresh endpoint.
    path: "/api/auth",
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", { ...baseOptions(), maxAge: 0 });
  jar.set(REFRESH_COOKIE, "", { ...baseOptions(), path: "/api/auth", maxAge: 0 });
}

export async function readRefreshCookie(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
