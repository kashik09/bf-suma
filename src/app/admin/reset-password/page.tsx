import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken
} from "@/lib/admin-session";
import {
  consumeFlashError,
  consumeFlashRedirect,
  normalizeAdminRedirect,
  setFlashError,
  setFlashRedirect,
  type FlashErrorCode
} from "@/lib/admin-flash";
import { forceResetAdminPassword } from "@/services/admin-auth";

function getErrorMessage(error: FlashErrorCode | null) {
  if (!error) return null;
  if (error === "weak_password") return "Password does not meet security requirements.";
  if (error === "mismatch") return "Passwords do not match.";
  if (error === "failed") return "Failed to update password. Please try again.";
  if (error === "session_expired") return "Session expired. Please login again.";
  return "An error occurred. Please try again.";
}

export default async function AdminResetPasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = await verifyAdminSessionToken(token);

  // Must have a valid session with mustResetPassword flag
  if (!session) {
    await setFlashError("session_expired");
    redirect("/admin/login");
  }

  if (!session.mustResetPassword) {
    // Already has a valid session without reset requirement
    redirect("/admin");
  }

  // Consume flash cookies (one-time read)
  const flashError = await consumeFlashError();
  const redirectTarget = await consumeFlashRedirect();

  async function resetPasswordAction(formData: FormData) {
    "use server";

    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const submittedNext = normalizeAdminRedirect(String(formData.get("next") || ""));

    // Re-verify session
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = await verifyAdminSessionToken(token);

    if (!session || !session.mustResetPassword) {
      await setFlashError("session_expired");
      redirect("/admin/login");
    }

    if (newPassword !== confirmPassword) {
      await setFlashError("mismatch");
      await setFlashRedirect(submittedNext);
      redirect("/admin/reset-password");
    }

    const result = await forceResetAdminPassword(session.userId, newPassword);

    if (!result.success) {
      await setFlashError("weak_password");
      await setFlashRedirect(submittedNext);
      redirect("/admin/reset-password");
    }

    // Create a new session without mustResetPassword
    const newToken = await createAdminSessionToken({
      userId: session.userId,
      email: session.email,
      role: session.role,
      passwordVersion: (session.passwordVersion ?? 1) + 1,
      mustResetPassword: false
    });

    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      path: "/"
    });

    redirect(submittedNext);
  }

  const errorMessage = getErrorMessage(flashError);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-12">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Set New Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your password must be reset before continuing.
        </p>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <strong>Password requirements:</strong>
          <ul className="mt-1 list-inside list-disc text-xs">
            <li>At least 12 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character</li>
          </ul>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <form action={resetPasswordAction} className="mt-5 space-y-4">
          <input name="next" type="hidden" value={redirectTarget} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="newPassword">
              New Password
            </label>
            <input
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="newPassword"
              minLength={12}
              name="newPassword"
              required
              type="password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="confirmPassword"
              minLength={12}
              name="confirmPassword"
              required
              type="password"
            />
          </div>

          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="submit"
          >
            Set Password & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
