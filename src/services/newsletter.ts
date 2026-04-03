import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NewsletterSignupInput } from "@/lib/validation";

interface NewsletterUpsertResult {
  id: string;
  status: "subscribed" | "already_subscribed";
  storageMode: "database" | "memory";
  welcomeEmailAlreadySent: boolean;
}

interface InMemoryNewsletterSubscriber {
  id: string;
  email: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
  source: string;
  context: string | null;
  welcome_email_sent_at: string | null;
}

const memorySubscribers = new Map<string, InMemoryNewsletterSubscriber>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeContext(context: string | undefined) {
  const trimmed = context?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function createMemoryId(email: string) {
  const encoded = Buffer.from(email).toString("hex");
  return `mem_${encoded.slice(0, 24)}`;
}

function memoryUpsert(input: NewsletterSignupInput): NewsletterUpsertResult {
  const email = normalizeEmail(input.email);
  const existing = memorySubscribers.get(email);

  if (existing) {
    existing.status = "ACTIVE";
    existing.source = input.source;
    existing.context = normalizeContext(input.context);
    memorySubscribers.set(email, existing);

    return {
      id: existing.id,
      status: "already_subscribed",
      storageMode: "memory",
      welcomeEmailAlreadySent: Boolean(existing.welcome_email_sent_at)
    };
  }

  const id = createMemoryId(email);
  memorySubscribers.set(email, {
    id,
    email,
    status: "ACTIVE",
    source: input.source,
    context: normalizeContext(input.context),
    welcome_email_sent_at: null
  });

  return {
    id,
    status: "subscribed",
    storageMode: "memory",
    welcomeEmailAlreadySent: false
  };
}

export async function subscribeNewsletter(input: NewsletterSignupInput): Promise<NewsletterUpsertResult> {
  const email = normalizeEmail(input.email);
  const context = normalizeContext(input.context);

  try {
    const supabase = await createServerSupabaseClient();

    const { data: existingRows, error: existingError } = await supabase
      .from("newsletter_subscribers")
      .select("id, welcome_email_sent_at")
      .eq("email", email)
      .limit(1);

    if (existingError) {
      return memoryUpsert(input);
    }

    const existing = existingRows?.[0] ?? null;
    if (existing) {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          source: input.source,
          context,
          status: "ACTIVE",
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (updateError) {
        return memoryUpsert(input);
      }

      return {
        id: existing.id,
        status: "already_subscribed",
        storageMode: "database",
        welcomeEmailAlreadySent: Boolean(existing.welcome_email_sent_at)
      };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        source: input.source,
        context,
        status: "ACTIVE"
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return memoryUpsert(input);
    }

    return {
      id: inserted.id,
      status: "subscribed",
      storageMode: "database",
      welcomeEmailAlreadySent: false
    };
  } catch {
    return memoryUpsert(input);
  }
}

export async function markNewsletterWelcomeEmailSent(id: string, storageMode: "database" | "memory") {
  const nowIso = new Date().toISOString();

  if (storageMode === "memory") {
    for (const [email, subscriber] of memorySubscribers.entries()) {
      if (subscriber.id === id) {
        memorySubscribers.set(email, {
          ...subscriber,
          welcome_email_sent_at: nowIso
        });
        break;
      }
    }
    return;
  }

  try {
    const supabase = await createServerSupabaseClient();
    await supabase
      .from("newsletter_subscribers")
      .update({
        welcome_email_sent_at: nowIso,
        updated_at: nowIso
      })
      .eq("id", id);
  } catch {
    // Non-blocking: capture succeeds even if timestamp update fails.
  }
}
