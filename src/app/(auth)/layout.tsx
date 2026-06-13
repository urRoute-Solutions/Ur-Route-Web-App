import type { Metadata } from "next";
import { Bus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "urRoute — Sign in" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <span className="text-xl font-bold">urRoute</span>
        </Link>
        <blockquote className="space-y-2">
          <p className="text-lg font-medium leading-relaxed">
            "We helped our frequent riders save ₹4,000+ this quarter through loyalty rewards. urRoute made it effortless."
          </p>
          <footer className="text-primary-foreground/70 text-sm">— Operator, Bangalore</footer>
        </blockquote>
        <div className="space-y-1">
          <p className="text-sm text-primary-foreground/70">Trusted by operators across South India</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8 bg-slate-50">{children}</div>
    </div>
  );
}
