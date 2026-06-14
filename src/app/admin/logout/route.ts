import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-session";
import { logEvent } from "@/lib/logger";

export async function GET() {
  const cookieStore = await cookies();

  // Clear the admin session cookie
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);

  logEvent("info", "admin.logout", { method: "GET" });

  redirect("/admin");
}

export async function POST() {
  const cookieStore = await cookies();

  // Clear the admin session cookie
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);

  logEvent("info", "admin.logout", { method: "POST" });

  redirect("/admin");
}
