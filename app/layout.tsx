import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { getSiteSettings } from "@/lib/shop-store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const site = getSiteSettings();
  const baseTitle = site.siteTitle || "BLI Shop";
  const icon = site.iconUrl || "/icon.png";

  return {
    metadataBase: new URL("https://bli.al"),
    title: {
      default: baseTitle,
      template: `%s | ${baseTitle}`,
    },
    description: "Shop home page with hero slider",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: baseTitle,
      description: "Shop home page with hero slider",
      url: "https://bli.al",
      siteName: baseTitle,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: "Shop home page with hero slider",
    },
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = getSiteSettings();

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AppShell siteSettings={siteSettings}>{children}</AppShell>
      </body>
    </html>
  );
}
