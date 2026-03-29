import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothAnchorScroll } from "@/components/smooth-anchor-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShowUp.ai — prediction markets for showing up",
  description:
    "The Polymarket for people who skip class. Stake on attendance, resolve with proof, stay locked in.",
  openGraph: {
    title: "ShowUp.ai",
    description:
      "Prediction markets for campus life — accountability without the lecture.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="mesh-bg text-[var(--foreground)] min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <SmoothAnchorScroll />
        {children}
      </body>
    </html>
  );
}
