import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing your use of the urRoute bus booking and loyalty platform.",
};

const SECTIONS = [
  {
    title: "1. Acceptance",
    body: [
      "By creating an account or using urRoute, you agree to these Terms of Service. If you do not agree, please do not use the platform. These terms apply to all travelers and operators using our services.",
    ],
  },
  {
    title: "2. Services",
    body: [
      "urRoute is a platform that connects travelers with bus operators and provides a loyalty rewards program. We facilitate bookings and payments; the actual transport service is provided by the independent operator you book with.",
    ],
  },
  {
    title: "3. User Accounts",
    body: [
      "You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate information and promptly update it if it changes. You must be legally capable of entering into a contract to use urRoute.",
    ],
  },
  {
    title: "4. Bookings & Payments",
    body: [
      "When you book a trip, you enter into a contract with the operator for that journey. Payments are processed securely through Razorpay. Prices shown include applicable fees unless stated otherwise, and a confirmation is issued once payment succeeds.",
    ],
  },
  {
    title: "5. Cancellations & Refunds",
    body: [
      "Cancellations and refunds are governed by the operator's policy, which is displayed at the time of booking. Eligible refunds are returned to your original payment method. urRoute will assist with cancellation requests but does not override operator policies.",
    ],
  },
  {
    title: "6. Loyalty Program",
    body: [
      "Loyalty levels and rewards are provided at urRoute's discretion and tied to completed trips. Progress does not expire but may be adjusted in cases of fraud, abuse, or cancelled trips. We may update the program's structure with reasonable notice.",
    ],
  },
  {
    title: "7. Prohibited Conduct",
    body: [
      "You agree not to misuse the platform — including attempting to defraud the rewards system, interfering with the service, scraping data, or using urRoute for any unlawful purpose. We may suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "urRoute provides the platform 'as is'. To the extent permitted by law, we are not liable for indirect or consequential losses, or for the acts or omissions of independent operators, including delays, cancellations, or service quality.",
    ],
  },
  {
    title: "9. Governing Law",
    body: [
      "These terms are governed by the laws of India, and any disputes will be subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.",
    ],
  },
  {
    title: "10. Changes to Terms",
    body: [
      "We may update these terms from time to time. Material changes will be communicated through the platform or by email. Continued use of urRoute after changes take effect constitutes acceptance of the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="px-4 pb-8 pt-32">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: June 2026
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Please read these terms carefully. They govern your access to and use
            of the urRoute platform.
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
