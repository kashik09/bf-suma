export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken
} from "@/lib/admin-session";
import {
  clearFlashError,
  clearFlashRedirect,
  normalizeAdminRedirect,
  readFlashError,
  readFlashRedirect,
  setFlashError,
  setFlashRedirect
} from "@/lib/admin-flash";
import { getAdminSessionFromCookies } from "@/lib/admin-server";
import { AdminAuthUnavailableError, authenticateAdminUser } from "@/services/admin-auth";
import { PasswordInput } from "@/components/forms/password-input";

function getErrorMessage(error: string | null) {
  if (!error) return null;
  if (error === "invalid_credentials") return "Invalid email or password.";
  if (error === "auth_unavailable") return "Admin auth is not available yet. Apply database migrations.";
  if (error === "forbidden") return "You do not have permission for that admin action.";
  if (error === "password_reset_required") return "Password reset required. Please set a new password.";
  if (error === "session_expired") return "Session expired. Please log in again.";
  return "Unable to sign in. Please try again.";
}

export default async function AdminLoginPage() {
  const existingSession = await getAdminSessionFromCookies();
  if (existingSession) {
    if (existingSession.mustResetPassword) {
      redirect("/admin/reset-password");
    }
    redirect("/admin");
  }

  // Read flash cookies (cleared by server action on success)
  const flashError = await readFlashError();
  const redirectTarget = await readFlashRedirect();

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const submittedNext = normalizeAdminRedirect(String(formData.get("next") || ""));

    if (!email || !password) {
      await setFlashError("invalid_credentials");
      await setFlashRedirect(submittedNext);
      redirect("/admin/login");
    }

    try {
      const user = await authenticateAdminUser(email, password);
      if (!user) {
        await setFlashError("invalid_credentials");
        await setFlashRedirect(submittedNext);
        redirect("/admin/login");
      }

      // Check if password reset is required
      if (user.mustResetPassword) {
        // Create a temporary session for password reset only
        const resetToken = await createAdminSessionToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          passwordVersion: user.passwordVersion,
          mustResetPassword: true
        });

        const cookieStore = await cookies();
        cookieStore.set(ADMIN_SESSION_COOKIE_NAME, resetToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: 60 * 15, // 15 minutes for password reset
          path: "/"
        });

        await setFlashRedirect(submittedNext);
        redirect("/admin/reset-password");
      }

      const token = await createAdminSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        passwordVersion: user.passwordVersion,
        mustResetPassword: false
      });

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
        path: "/"
      });

      // Clear flash cookies on successful login
      await clearFlashError();
      await clearFlashRedirect();

      redirect(submittedNext);
    } catch (error) {
      if (error instanceof AdminAuthUnavailableError) {
        await setFlashError("auth_unavailable");
        await setFlashRedirect(submittedNext);
        redirect("/admin/login");
      }

      await setFlashError("invalid_credentials");
      await setFlashRedirect(submittedNext);
      redirect("/admin/login");
    }
  }

  const errorMessage = getErrorMessage(flashError);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-12">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access order operations and inventory tools.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <form action={loginAction} className="mt-5 space-y-4">
          <input name="next" type="hidden" value={redirectTarget} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="submit"
          >
            Sign In
          </button>
        </form>

        <Link className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800" href="/">
          Back to storefront
        </Link>
      </div>
    </div>
  );
}
