import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chat/chat-widget";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "urRoute — Book your bus, earn every ride", template: "%s | urRoute" },
  description: "Search buses across 200+ routes, book in seconds, and earn operator-exclusive loyalty rewards on every trip.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg",
  },
  themeColor: "#1B2D78",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
        <ChatWidget />
      </body>
    </html>
  );
}
