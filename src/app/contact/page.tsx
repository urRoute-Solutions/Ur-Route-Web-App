import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the urRoute team for booking help, operator enquiries, or general questions.",
};

const DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: "support@urroute.in",
    href: "mailto:support@urroute.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Chennai, Tamil Nadu",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 pb-12 pt-32">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Have a question, a booking issue, or want to partner with us? We
            usually reply within 24 hours.
          </p>
        </div>
      </section>

      {/* Two columns */}
      <section className="py-16">
        <div className="container grid gap-12 lg:grid-cols-2">
          {/* Left — details */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reach us</h2>
            <p className="mt-3 text-muted-foreground">
              Prefer a direct line? Here&apos;s how to find us.
            </p>
            <div className="mt-8 space-y-5">
              {DETAILS.map((d) => (
                <div key={d.label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <d.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="text-base font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="text-base font-medium text-foreground">
                        {d.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
