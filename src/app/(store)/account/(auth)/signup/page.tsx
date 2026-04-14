"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth/customer-auth";

export const dynamic = "force-dynamic";

export default function AccountSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const { data, error: authError } = await signUp(
      email.trim(),
      password,
      firstName.trim(),
      lastName.trim()
    );

    if (authError) {
      setError("We couldn't create your account. Please check your details and try again.");
      setPending(false);
      return;
    }

    if (!data.session) {
      setSuccess("Account created. Please check your email to confirm your account before signing in.");
      setPending(false);
      return;
    }

    router.push("/account/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md py-10 sm:py-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
        <p className="mt-1 text-sm text-slate-600">Set up your account to track orders and manage your profile.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="first_name">First name</label>
              <input
                autoComplete="given-name"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                id="first_name"
                required
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="last_name">Last name</label>
              <input
                autoComplete="family-name"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                id="last_name"
                required
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              autoComplete="new-password"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirm_password">Confirm password</label>
            <input
              autoComplete="new-password"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="confirm_password"
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-brand-700 hover:underline" href="/account/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
