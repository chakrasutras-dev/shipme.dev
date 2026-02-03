import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ShipMe | From Idea to Deployed App. Zero Guesswork.",
  description:
    "ShipMe takes your app idea, recommends the right tech stack, provisions everything across GitHub, Vercel, and Supabase through secure MCP connections, delivers a ready-to-code environment, and then deletes your API keys. You own everything. We touch nothing.",
  keywords: [
    "infrastructure automation",
    "developer tools",
    "GitHub",
    "Vercel",
    "Supabase",
    "MCP",
    "Model Context Protocol",
    "CI/CD",
    "deployment",
    "Next.js",
  ],
  authors: [{ name: "Ayan Putatunda" }],
  openGraph: {
    title: "ShipMe | From Idea to Deployed App. Zero Guesswork.",
    description:
      "Provision your entire development infrastructure in under 3 minutes. GitHub + Vercel + Supabase, all connected.",
    url: "https://shipme.dev",
    siteName: "ShipMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShipMe | From Idea to Deployed App. Zero Guesswork.",
    description:
      "Provision your entire development infrastructure in under 3 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
