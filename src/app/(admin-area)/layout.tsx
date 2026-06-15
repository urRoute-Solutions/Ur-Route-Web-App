import { redirect } from "next/navigation";
import { getPrincipal } from "@/lib/auth/session";
import { userRepository } from "@/repositories/user.repository";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect("/login");
  if (principal.role !== "ADMIN") redirect("/");

  const user = await userRepository.findById(principal.userId);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav user={{ fullName: user.fullName, email: user.email }} />
      <div className="flex-1 min-w-0 flex flex-col md:pt-0 pt-14">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
