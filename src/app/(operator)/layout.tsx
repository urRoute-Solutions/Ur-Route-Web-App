import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { operatorRepository } from "@/repositories/operator.repository";
import { OperatorNav } from "@/components/layout/operator-nav";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect("/login");
  if (principal.role !== "OPERATOR") redirect("/");

  const [user, operator] = await Promise.all([
    userRepository.findById(principal.userId),
    principal.operatorId ? operatorRepository.findById(principal.operatorId) : Promise.resolve(null),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <OperatorNav
        user={{ fullName: user.fullName, email: user.email }}
        operatorName={operator?.name}
      />
      <div className="flex flex-1 min-w-0 flex-col md:pt-0 pt-14">
        {!user.emailVerified && <VerifyEmailBanner email={user.email} />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
