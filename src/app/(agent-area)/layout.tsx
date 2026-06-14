import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { AgentNav } from "@/components/layout/agent-nav";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect("/login");
  if (principal.role !== "AGENT" && principal.role !== "ADMIN") redirect("/");

  const user = await userRepository.findById(principal.userId);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AgentNav name={user.fullName} email={user.email} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
