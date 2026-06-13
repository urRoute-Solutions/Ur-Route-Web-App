import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about urRoute — loyalty rewards, cancellations, payments, refunds, and joining as an operator.",
};

const FAQS = [
  {
    q: "How does the loyalty program work?",
    a: "Every completed trip moves you through four levels — Welcome, Stay, Loyalty, and Champion. Each level unlocks better perks, from 11% off as a new rider to 15% off plus priority benefits as a Champion. Your progress never resets: if you take a break, it simply freezes and resumes when you book again.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes. You can cancel from your bookings page, subject to the operator's cancellation policy shown at checkout. For help with a cancellation, email support@urroute.in with your PNR number and we'll assist you.",
  },
  {
    q: "How are rewards calculated?",
    a: "Rewards are tied to the number of trips you've completed. As your trip count crosses each threshold, you move up a level and the corresponding discount or reward is applied automatically to eligible bookings — no codes to remember.",
  },
  {
    q: "What bus types are available?",
    a: "Our 50+ verified operators offer a wide range — AC and non-AC seaters, sleepers, semi-sleepers, and Volvo coaches. Available types are shown for each route when you search.",
  },
  {
    q: "How do I join as an operator?",
    a: "Click 'Register' and choose the operator option, or reach out via the contact page. Once verified, you get access to a dashboard for managing routes, trips, bookings, offers, and analytics.",
  },
  {
    q: "Is my payment secure?",
    a: "Absolutely. All payments are processed through Razorpay with bank-grade encryption. urRoute never stores your card details, and you receive instant confirmation and a receipt for every booking.",
  },
  {
    q: "What is the refund policy?",
    a: "Refunds follow the operator's policy displayed at the time of booking. Eligible refunds are processed back to your original payment method, typically within 5–7 business days. Contact support@urroute.in if you have questions about a specific refund.",
  },
  {
    q: "How do I contact support?",
    a: "Use the chat widget in the bottom-right corner of any page for instant answers, email us at support@urroute.in, or call +91 98765 43210. For booking-specific issues, please have your PNR number ready.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 pb-12 pt-32">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Everything you need to know about booking, rewards, and travelling
            with urRoute.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="py-12">
        <div className="container mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-8 text-center">
            <h2 className="text-xl font-bold text-foreground">
              Still have questions?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our team is happy to help. Reach out any time.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Contact support →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
