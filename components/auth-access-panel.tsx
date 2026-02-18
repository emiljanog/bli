"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type AuthTab = "login" | "register";

type AuthAccessPanelProps = {
  initialTab?: AuthTab;
  nextPath?: string;
};

function normalizeNextPath(path: string): string {
  const safe = (path || "").trim();
  if (!safe.startsWith("/") || safe.startsWith("//")) return "/my-account";
  return safe;
}

export function AuthAccessPanel({ initialTab = "login", nextPath = "/my-account" }: AuthAccessPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  const safeNextPath = useMemo(() => normalizeNextPath(nextPath), [nextPath]);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerSurname, setRegisterSurname] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetRequested, setResetRequested] = useState(false);
  const [resetPreviewToken, setResetPreviewToken] = useState("");

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setShowResetForm(false);
    setError("");
    setOkMessage("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setOkMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginIdentifier.trim(), password: loginPassword }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; redirectTo?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(data?.message ?? "Sign in failed.");
        return;
      }

      const serverRedirect = typeof data.redirectTo === "string" ? data.redirectTo : "";
      const redirectTo = serverRedirect.startsWith("/")
        ? serverRedirect
        : safeNextPath;

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setOkMessage("");
    if (!registerName.trim() || !registerEmail.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (registerPassword !== registerConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName.trim(),
          surname: registerSurname.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; redirectTo?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(data?.message ?? "Registration failed.");
        return;
      }
      router.push(data.redirectTo && data.redirectTo.startsWith("/") ? data.redirectTo : "/my-account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setOkMessage("");
    if (!resetIdentifier.trim()) {
      setError("Email or username is required.");
      return;
    }
    if (!resetToken.trim()) {
      setError("Reset token is required.");
      return;
    }
    if (resetPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: resetIdentifier.trim(),
          token: resetToken.trim(),
          newPassword: resetPassword,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(data?.message ?? "Reset password failed.");
        return;
      }
      setOkMessage("Password updated. You can sign in now.");
      setLoginIdentifier(resetIdentifier.trim());
      setResetToken("");
      setResetRequested(false);
      setResetPreviewToken("");
      setResetPassword("");
      setResetConfirm("");
      setActiveTab("login");
      setShowResetForm(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelTitle = activeTab === "register" ? "Register" : showResetForm ? "Request Password" : "Login";

  const handleRequestResetToken = async () => {
    setError("");
    setOkMessage("");
    if (!resetIdentifier.trim()) {
      setError("Username or email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetIdentifier.trim() }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; previewToken?: string }
        | null;
      if (!response.ok || !data?.ok) {
        setError(data?.message ?? "Could not request reset token.");
        return;
      }

      setResetRequested(true);
      setResetPreviewToken(data.previewToken ?? "");
      setOkMessage(data.message ?? "If account exists, token has been sent.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">My Account Access</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">{panelTitle}</h1>
        </div>
        <Link
          href="/"
          className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back to Shop
        </Link>
      </div>

      <div className="mt-5 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === "login" && !showResetForm ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => switchTab("register")}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === "register" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Register
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
      {okMessage ? (
        <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          {okMessage}
        </p>
      ) : null}

      {activeTab === "login" && !showResetForm ? (
        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            type="text"
            value={loginIdentifier}
            onChange={(event) => setLoginIdentifier(event.target.value)}
            placeholder="Email or username"
            autoComplete="username"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            required
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <div className="pt-1 text-left">
            <button
              type="button"
              onClick={() => {
                setShowResetForm(true);
                setError("");
                setOkMessage("");
              }}
              className="cursor-pointer text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              Forgot password?
            </button>
          </div>
        </form>
      ) : null}

      {activeTab === "register" ? (
        <form onSubmit={handleRegister} className="mt-5 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              placeholder="Name"
              autoComplete="given-name"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              required
            />
            <input
              type="text"
              value={registerSurname}
              onChange={(event) => setRegisterSurname(event.target.value)}
              placeholder="Surname"
              autoComplete="family-name"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <input
            type="email"
            value={registerEmail}
            onChange={(event) => setRegisterEmail(event.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="password"
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              minLength={6}
              required
            />
            <input
              type="password"
              value={registerConfirm}
              onChange={(event) => setRegisterConfirm(event.target.value)}
              placeholder="Confirm Password"
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
          <div className="pt-1 text-left text-xs text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchTab("login")}
              className="cursor-pointer font-medium text-slate-700 transition hover:text-slate-900"
            >
              Sign in
            </button>
          </div>
        </form>
      ) : null}

      {activeTab === "login" && showResetForm ? (
        <form onSubmit={handleReset} className="mt-5 space-y-3">
          <input
            type="text"
            value={resetIdentifier}
            onChange={(event) => setResetIdentifier(event.target.value)}
            placeholder="Username or email"
            autoComplete="username"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            required
          />
          <button
            type="button"
            onClick={handleRequestResetToken}
            disabled={isSubmitting}
            className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Request Email"}
          </button>
          {resetRequested ? (
            <input
              type="text"
              value={resetToken}
              onChange={(event) => setResetToken(event.target.value)}
              placeholder="Enter token from email"
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              required
            />
          ) : null}
          {resetPreviewToken ? (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Dev token preview: {resetPreviewToken}
            </p>
          ) : null}
          {resetRequested ? (
            <>
          <input
            type="password"
            value={resetPassword}
            onChange={(event) => setResetPassword(event.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            minLength={6}
            required
          />
          <input
            type="password"
            value={resetConfirm}
            onChange={(event) => setResetConfirm(event.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Reset Password"}
          </button>
            </>
          ) : null}
          <div className="pt-1 text-left">
            <button
              type="button"
              onClick={() => setShowResetForm(false)}
              className="cursor-pointer text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              Back to login
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
