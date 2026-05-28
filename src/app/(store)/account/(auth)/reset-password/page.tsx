"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      const message = updateError.message?.toLowerCase() || "";
      if (message.includes("breach")) {
        setError("This password has been found in a data breach. Please choose a different password.");
      } else if (message.includes("weak")) {
        setError("Password is too weak. Use a mix of letters, numbers, and symbols.");
      } else if (message.includes("same")) {
        setError("New password must be different from your current password.");
      } else {
        setError(updateError.message || "Failed to update password. Please try again.");
      }
      setPending(false);
      return;
    }

    setSuccess(true);
    setPending(false);

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push("/account/dashboard");
    }, 2000);
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md py-10 sm:py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
          <h1 className="text-2xl font-semibold text-slate-900">Password Updated</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your password has been successfully updated. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md py-10 sm:py-14">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
        <h1 className="text-2xl font-semibold text-slate-900">Set New Password</h1>
        <p className="mt-1 text-sm text-slate-600">Enter your new password below.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-slate-300 px-3 pr-10 text-sm"
                id="password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setShowPassword((c) => !c)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirm_password">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-slate-300 px-3 pr-10 text-sm"
                id="confirm_password"
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setShowConfirmPassword((c) => !c)}
                type="button"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
            {pending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
