"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ActionFeedbackToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("__ok") === "1";
  const message = searchParams.get("__msg")?.trim() || "Veprimi u ruajt me sukses.";

  useEffect(() => {
    if (!isSuccess) return;

    const timeout = setTimeout(() => {
      const cleaned = new URLSearchParams(searchParams.toString());
      cleaned.delete("__ok");
      cleaned.delete("__msg");
      const nextQuery = cleaned.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, 2200);

    return () => clearTimeout(timeout);
  }, [isSuccess, pathname, router, searchParams]);

  if (!isSuccess) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90]">
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg shadow-emerald-200/50">
        {message}
      </div>
    </div>
  );
}
