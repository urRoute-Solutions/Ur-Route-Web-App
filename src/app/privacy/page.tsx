import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How urRoute collects, uses, and protects your personal information.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "We collect information you provide directly — your name, email address, phone number, and payment details when you create an account or book a trip. We also collect booking history and loyalty activity to operate the rewards program.",
      "Automatically, we collect device and usage data such as IP address, browser type, and the pages you visit, to keep the service secure and improve it.",
    ],
  },
  {
    title: "2. How We Use It",
    body: [
      "We use your information to process bookings, calculate and apply loyalty rewards, send confirmations and trip updates, provide customer support, and prevent fraud. We may use aggregated, anonymised data to understand travel trends and improve our platform.",
    ],
  },
  {
    title: "3. Data Sharing",
    body: [
      "We share the minimum necessary booking details with the bus operator fulfilling your trip. We use trusted processors — such as Razorpay for payments and email/SMS providers for notifications — who are bound to handle your data securely. We never sell your personal information.",
    ],
  },
  {
    title: "4. Cookies",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember preferences, and measure how the service is used. You can control cookies through your browser settings, though some features may not work without them.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "We protect your data with industry-standard measures including encryption in transit, hashed credentials, and restricted access. Payment information is handled by our PCI-compliant payment partner and is never stored on our servers.",
    ],
  },
  {
    title: "6. Your Rights",
    body: [
      "You may access, correct, or delete your personal information, and request a copy of the data we hold about you. To exercise any of these rights, contact us at support@urroute.in and we will respond within a reasonable timeframe.",
    ],
  },
  {
    title: "7. Contact",
    body: [
      "If you have questions about this Privacy Policy or how we handle your data, email us at support@urroute.in or write to urRoute Solutions, Chennai, Tamil Nadu, India.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="px-4 pb-8 pt-32">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: June 2026
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Your privacy matters to us. This policy explains what information
            urRoute collects, how we use it, and the choices you have.
          </p>

          <div className="mt-10 space-y-10">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-bold text-foreground">{s.title}</h2>
                {s.body.map((p, i) => (
                  <p
                    key={i}
                    className="mt-3 leading-relaxed text-muted-foreground"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
