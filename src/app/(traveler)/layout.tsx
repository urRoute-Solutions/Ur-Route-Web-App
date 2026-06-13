import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { TravelerNav } from "@/components/layout/traveler-nav";

export default async function TravelerLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect("/login");
  if (principal.role !== "TRAVELER") redirect("/");

  const user = await userRepository.findById(principal.userId);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <TravelerNav user={{ fullName: user.fullName, email: user.email }} />
      <main>{children}</main>
    </div>
  );
}
