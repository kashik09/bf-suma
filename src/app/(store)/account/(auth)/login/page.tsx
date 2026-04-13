"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth/customer-auth";

export const dynamic = "force-dynamic";

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: authError } = await signIn(email.trim(), password);

    if (authError) {
      setError("We couldn't sign you in. Check your email and password, then try again.");
      setPending(false);
      return;
    }

    router.push("/account/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md py-10 sm:py-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-900">Sign In</h1>
        <p className="mt-1 text-sm text-slate-600">Access your account to view orders and profile details.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="email"
              name="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <div className="relative">
              <input
                autoComplete="current-password"
                className="h-11 w-full rounded-md border border-slate-300 px-3 pr-10 text-sm"
                id="password"
                name="password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={pending}
            type="submit"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p>
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-brand-700 hover:underline" href="/account/signup">
              Sign up
            </Link>
          </p>
          <p>
            <Link className="font-semibold text-brand-700 hover:underline" href="/account/forgot-password">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
