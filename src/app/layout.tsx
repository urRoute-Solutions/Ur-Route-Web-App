import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "urRoute — Loyalty for Bus Operators",
  description:
    "B2B2C loyalty platform helping bus operators improve traveler retention through gamified rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
