import type { Metadata } from "next";
import Link from "next/link";
import { Eye, ShieldCheck, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "urRoute is building the future of bus travel in India — combining seamless booking with a loyalty rewards program that never resets.",
};

const VALUES = [
  {
    icon: Eye,
    title: "Transparency",
    desc: "No hidden fees, no fine print. The price you see is the price you pay, and your rewards are always clear.",
  },
  {
    icon: ShieldCheck,
    title: "Reliability",
    desc: "Verified operators, secure payments, and instant confirmations you can count on, every single trip.",
  },
  {
    icon: Gift,
    title: "Rewarding loyalty",
    desc: "We believe your loyalty should mean something. Every ride moves you closer to better rewards.",
  },
];

const STATS = [
  { value: "2024", label: "Founded" },
  { value: "50+", label: "Partners" },
  { value: "10K+", label: "Riders" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 pb-16 pt-32">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            We&apos;re building the future of bus travel in India.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            urRoute started with a simple idea: travel should be effortless, and
            loyalty should pay off. We combine modern booking with a rewards
            program designed around the way real people travel.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-action">
            Our Mission
          </span>
          <p className="mt-4 text-2xl font-medium leading-relaxed text-foreground">
            To connect every traveler in India with reliable, affordable bus
            journeys — and to make sure that the more you travel with us, the
            more you&apos;re rewarded. We partner with operators of every size,
            giving them the tools to grow while giving riders a reason to come
            back.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-muted/30 py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-black tracking-tight text-foreground md:text-4xl">
            What we stand for
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Built by people who travel
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built by a passionate team of engineers and designers who believe
            getting from A to B should be the easy part of any trip.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-card">
        <div className="container grid grid-cols-3 divide-x divide-border">
          {STATS.map((s) => (
            <div key={s.label} className="px-4 py-12 text-center">
              <p className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-black tracking-tight text-primary-foreground md:text-4xl">
            Ready to ride with us?
          </h2>
          <Button
            size="lg"
            className="mt-7 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/register">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
