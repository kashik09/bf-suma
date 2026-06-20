"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Turnstile } from "@/components/ui/turnstile";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  message: z.string().min(10, "Message must be at least 10 characters").max(1500),
  honeypot: z.string().max(0)
});

type ContactFormData = z.infer<typeof contactSchema>;

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", honeypot: "" }
  });

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileResetKey((k) => k + 1);
  }, []);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setSubmitError("Please complete the security check before submitting.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        resetTurnstile();
        throw new Error(err.message || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Couldn't send your message. Please try again or reach us on WhatsApp."
      );
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 p-12 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
        <h3 className="text-2xl font-bold text-slate-900">Message sent!</h3>
        <p className="mt-2 text-base text-slate-600">
          Thanks — we&apos;ll respond within 24 hours. Check your email for a copy.
        </p>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;
  const canSubmit = !isSubmitting && (!TURNSTILE_ENABLED || !!turnstileToken);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      {submitError && (
        <div className="col-span-full flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...form.register("name")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Your name"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...form.register("email")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="you@example.com"
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="col-span-full">
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-slate-700">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          {...form.register("subject")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Order inquiry, product question, or partnership request"
        />
        {form.formState.errors.subject && (
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.subject.message}</p>
        )}
      </div>

      <div className="col-span-full">
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...form.register("message")}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Tell us how we can help..."
        />
        {form.formState.errors.message && (
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>
        )}
      </div>

      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        {...form.register("honeypot")}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="col-span-full">
        <Turnstile
          key={turnstileResetKey}
          onVerify={handleTurnstileVerify}
          onError={resetTurnstile}
          onExpire={resetTurnstile}
          size="normal"
        />
      </div>

      <div className="col-span-full flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 md:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send message"
          )}
        </button>
      </div>
    </form>
  );
}
