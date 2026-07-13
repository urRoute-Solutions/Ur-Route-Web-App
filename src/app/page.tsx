import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/auth/session";
import { LandingPage } from "./_landing-page";

export default async function HomePage() {
  const principal = await getPrincipal();
  if (principal) {
    if (principal.role === "OPERATOR") redirect("/operator/dashboard");
    if (principal.role === "ADMIN") redirect("/admin");
    if (principal.role === "AGENT") redirect("/agent/dashboard");
    redirect("/dashboard");
  }
  return <LandingPage />;
}
