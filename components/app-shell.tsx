"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { ReactNode } from "react";
import { ActionFeedbackToast } from "@/components/action-feedback-toast";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { SiteSettings } from "@/lib/shop-store";

type AppShellProps = {
  children: ReactNode;
  siteSettings: SiteSettings;
};

export function AppShell({ children, siteSettings }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/user/login");

  if (isAdminRoute) {
    return (
      <>
        <Suspense fallback={null}>
          <ActionFeedbackToast />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ActionFeedbackToast />
      </Suspense>
      <SiteHeader siteSettings={siteSettings} />
      {children}
      <SiteFooter />
    </>
  );
}
