"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordReset } from "@/lib/auth/customer-auth";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);

    const { error: resetError } = await sendPasswordReset(email.trim());

    if (resetError) {
      setError("We couldn't send a reset link right now. Please try again.");
      setPending(false);
      return;
    }

    setSuccess("Reset link sent. Check your email for the next steps.");
    setPending(false);
  }

  return (
    <div className="mx-auto w-full max-w-md py-10 sm:py-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-600">Enter your email and we&apos;ll send you a reset link.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
          ) : null}

          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={pending}
            type="submit"
          >
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Back to{" "}
          <Link className="font-semibold text-brand-700 hover:underline" href="/account/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
