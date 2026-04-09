interface JsonRecord {
  [key: string]: unknown;
}

declare const Deno: {
  env: { get: (name: string) => string | undefined };
};

interface EnvConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  resendApiKey: string | null;
  resendFromEmail: string | null;
  lifecycleEnabled: boolean;
  appBaseUrl: string;
}

function readEnv(name: string): string | null {
  const value = Deno.env.get(name);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function loadEnvConfig(): EnvConfig {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL") || "";
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY") || "";
  const lifecycleEnabled = (readEnv("LIFECYCLE_EMAILS_ENABLED") || "false") === "true";
  const appBaseUrl = readEnv("NEXT_PUBLIC_SITE_URL") || "https://bfsuma.com";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for lifecycle function.");
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    resendApiKey: readEnv("RESEND_API_KEY"),
    resendFromEmail: readEnv("RESEND_FROM_EMAIL"),
    lifecycleEnabled,
    appBaseUrl
  };
}

function normalizeUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

export async function supabaseRestRequest<T>(
  env: EnvConfig,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = normalizeUrl(env.supabaseUrl, `/rest/v1${path}`);
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

export async function sendResendEmail(params: {
  env: EnvConfig;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const { env, to, subject, html, text } = params;
  if (!env.lifecycleEnabled) return false;
  if (!env.resendApiKey || !env.resendFromEmail) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.resendFromEmail,
      to: [to],
      subject,
      html,
      text
    })
  });

  return response.ok;
}

export function jsonResponse(payload: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
