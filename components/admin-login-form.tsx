"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("emiljano");
  const [password, setPassword] = useState("emiljano@bli.al");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
      return "/dashboard";
    }
    if (next === "/admin" || next.startsWith("/admin/")) {
      return `/dashboard${next.slice("/admin".length)}`;
    }
    return next;
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Login failed. Please try again.",
        );
        return;
      }

      const redirectTo =
        typeof data?.redirectTo === "string" && data.redirectTo.startsWith("/")
          ? data.redirectTo
          : nextPath;

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[420px] rounded-[34px] border border-[#b9d8ea] bg-[linear-gradient(180deg,#c9ebfb_0%,#edf2f6_48%,#f2f3f5_100%)] p-7 shadow-[0_20px_45px_-26px_rgba(34,56,97,0.55)] backdrop-blur"
    >
      <h1 className="text-center text-[38px] font-bold leading-tight text-slate-900">Sign in</h1>
      <p className="mt-2 text-center text-base leading-6 text-slate-500">
        Admins, managers and users can sign in from this page.
      </p>

      <div className="mt-6 space-y-3">
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            placeholder="Email / Username"
            autoComplete="username"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-slate-400 focus:bg-white"
            required
          />
        </label>

        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-slate-400 focus:bg-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C7 20 2.73 16.89 1 12c.64-1.8 1.72-3.44 3.06-4.94" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a10.97 10.97 0 0 1-1.67 2.83" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </label>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-800"
        >
          Forgot password?
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 h-12 w-full rounded-xl border border-[#0f1528] bg-[linear-gradient(180deg,#242b42_0%,#141b2d_55%,#0a111f_100%)] text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 border-t border-dashed border-slate-300" />
          <span className="text-xs font-medium text-slate-500">Or sign in with</span>
          <span className="h-px flex-1 border-t border-dashed border-slate-300" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <span aria-hidden>G</span>
          </button>
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-[#1d63d8] transition hover:bg-slate-50"
          >
            <span aria-hidden>f</span>
          </button>
          <button
            type="button"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M16.08 12.15c.01 2.05 1.8 2.73 1.82 2.74-.02.05-.28.93-.93 1.83-.56.78-1.14 1.56-2.05 1.58-.89.02-1.18-.53-2.2-.53-1.03 0-1.35.51-2.18.55-.87.03-1.52-.86-2.09-1.63-1.16-1.58-2.04-4.46-.85-6.53.59-1.03 1.64-1.67 2.78-1.69.86-.02 1.67.58 2.2.58.53 0 1.52-.72 2.57-.61.44.02 1.67.18 2.46 1.34-.06.04-1.47.86-1.46 2.37zM14.74 6.97c.46-.56.77-1.33.69-2.1-.66.03-1.47.44-1.94 1-.43.49-.81 1.27-.71 2.02.74.06 1.49-.38 1.96-.92z" />
            </svg>
          </button>
        </div>
      </div>

    </form>
  );
}
