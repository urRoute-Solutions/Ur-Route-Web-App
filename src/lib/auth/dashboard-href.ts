import { getPrincipal } from "./session";

/** Returns the dashboard URL for the current user, or null if not signed in. */
export async function getDashboardHref(): Promise<string | null> {
  const principal = await getPrincipal();
  if (!principal) return null;
  if (principal.role === "OPERATOR") return "/operator/dashboard";
  if (principal.role === "ADMIN") return "/admin";
  if (principal.role === "AGENT") return "/agent/dashboard";
  return "/dashboard";
}
