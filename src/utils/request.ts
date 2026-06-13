import type { NextRequest } from "next/server";

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Request metadata stamped onto sessions/tokens/audit logs. */
export function requestMeta(req: NextRequest) {
  return {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent"),
  };
}
