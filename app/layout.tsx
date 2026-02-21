import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  getAdminRoleFromCookieStore,
  getAdminUsernameFromCookieStore,
} from "@/lib/admin-auth";
import {
  countUnreadAdminNotifications,
  findUserByUsername,
  getSiteSettings,
  listAdminNotifications,
} from "@/lib/shop-store";
import "./globals.css";

export const dynamic = "force-dynamic";

function withAssetVersion(url: string | null | undefined, version: number | null | undefined): string {
  const safeUrl = typeof url === "string" ? url.trim() : "";
  if (!safeUrl) return "";
  const sep = safeUrl.includes("?") ? "&" : "?";
  const safeVersion = Number.isFinite(Number(version)) ? Math.max(1, Math.floor(Number(version))) : 1;
  return `${safeUrl}${sep}v=${safeVersion}`;
}

function withFallback(value: unknown, fallback: string): string {
  const safe = typeof value === "string" ? value.trim() : "";
  return safe || fallback;
}

function getLayoutMaxWidth(settings: ReturnType<typeof getSiteSettings>): string {
  if (settings.layoutWidthMode === "full" || settings.layoutWidthMode === "contentFull") return "none";
  if (settings.layoutWidthMode === "boxedHidden" || settings.layoutWidthMode === "boxed") return "1280px";
  if (settings.layoutWidthMode === "wide1600") return "1600px";
  return `${Math.max(960, Math.min(2400, Number(settings.layoutMaxWidthPx) || 1440))}px`;
}

function getLayoutSideSpacing(settings: ReturnType<typeof getSiteSettings>): string {
  const value = Number.isFinite(Number(settings.layoutSideSpacingValue)) ? Number(settings.layoutSideSpacingValue) : 5;
  const safeValue = Math.max(0, value);
  if (settings.layoutSideSpacingUnit === "px") return `${Math.min(240, safeValue)}px`;
  if (settings.layoutSideSpacingUnit === "em") return `${Math.min(10, safeValue)}em`;
  if (settings.layoutSideSpacingUnit === "rem") return `${Math.min(10, safeValue)}rem`;
  if (settings.layoutSideSpacingUnit === "vw") return `${Math.min(20, safeValue)}vw`;
  return `${Math.min(20, safeValue)}%`;
}

function getLayoutOverflowX(settings: ReturnType<typeof getSiteSettings>): string {
  return settings.layoutWidthMode === "boxedHidden" ? "hidden" : "visible";
}

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
  const icon = withAssetVersion(site.iconUrl || "/favicon.ico", site.brandingVersion);

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const siteSettings = getSiteSettings();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const adminRole = getAdminRoleFromCookieStore(cookieStore);
  const adminUsername = getAdminUsernameFromCookieStore(cookieStore);
  const adminUser = findUserByUsername(adminUsername);
  const effectiveToolbarRole = adminUser?.role ?? adminRole;
  const isToolbarRole =
    effectiveToolbarRole === "Super Admin" ||
    effectiveToolbarRole === "Admin" ||
    effectiveToolbarRole === "Manager";
  const shouldShowToolbar = isLoggedIn && isToolbarRole && (adminUser?.showToolbar ?? true);
  const adminNotifications = shouldShowToolbar ? listAdminNotifications(14) : [];
  const adminUnreadNotifications = shouldShowToolbar ? countUnreadAdminNotifications() : 0;
  const accountUser =
    isLoggedIn
      ? {
          username: adminUsername || "user",
          displayName: adminUser?.name || adminUsername || "User",
          avatarUrl: adminUser?.avatarUrl || "",
        }
      : null;
  const adminToolbar =
    shouldShowToolbar
      ? {
          username: adminUsername,
          displayName: adminUser?.name || adminUsername,
          avatarUrl: adminUser?.avatarUrl || "",
          profileHref: adminUser ? `/dashboard/users/${adminUser.id}` : "/dashboard/users",
          initialNotifications: adminNotifications,
          initialUnreadCount: adminUnreadNotifications,
        }
      : null;
  const styleVars: Record<string, string> = {
    "--site-font-title": withFallback(siteSettings.titleFont, "var(--font-geist-sans), sans-serif"),
    "--site-font-text": withFallback(siteSettings.textFont, "var(--font-geist-sans), sans-serif"),
    "--site-font-button": withFallback(siteSettings.buttonFont, "var(--font-geist-sans), sans-serif"),
    "--site-font-ui": withFallback(siteSettings.uiFont, "var(--font-geist-sans), sans-serif"),
    "--site-layout-max-width": getLayoutMaxWidth(siteSettings),
    "--site-layout-side-space-inline": getLayoutSideSpacing(siteSettings),
    "--site-layout-overflow-x": getLayoutOverflowX(siteSettings),
    "--site-color-primary": withFallback(siteSettings.primaryColor, "#ff8a00"),
    "--site-color-secondary": withFallback(siteSettings.secondaryColor, "#0f172a"),
    "--site-color-accent": withFallback(siteSettings.accentColor, "#2ea2cc"),
    "--site-color-bg": withFallback(siteSettings.backgroundColor, "#ffffff"),
  };

  return (
    <html lang="en">
      <body
        style={styleVars as CSSProperties}
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AppShell siteSettings={siteSettings} adminToolbar={adminToolbar} accountUser={accountUser}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
