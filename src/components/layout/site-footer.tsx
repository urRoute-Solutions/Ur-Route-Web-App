import Link from "next/link";
import { Twitter, Linkedin, Instagram } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const PRODUCT = [
  { href: "/search", label: "Search Buses" },
  { href: "/#features", label: "How it works" },
  { href: "/#loyalty", label: "Loyalty Program" },
  { href: "/#operator", label: "Pricing" },
];

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Blog (coming soon)" },
];

const LEGAL = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Refund Policy" },
  { href: "/privacy", label: "Cookies" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map(({ href, label }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-sidebar-foreground/80 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Logo size="default" variant="white" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sidebar-foreground/70">
              India&apos;s smartest bus booking platform with loyalty rewards.
            </p>
            <p className="mt-6 text-xs text-sidebar-foreground/50">
              © 2026 urRoute Solutions.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-sidebar-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-sidebar-foreground/60">
            © 2026 urRoute Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com"
              aria-label="Twitter / X"
              className="text-sidebar-foreground/60 transition-colors hover:text-white"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="text-sidebar-foreground/60 transition-colors hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-sidebar-foreground/60 transition-colors hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
