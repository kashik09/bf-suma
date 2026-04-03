"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSignupSchema, type NewsletterSignupInput } from "@/lib/validation";
import { submitNewsletterSignup } from "@/services/storefront-api";

interface NewsletterSignupProps {
  source: string;
  context?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  compact?: boolean;
  onDark?: boolean;
  className?: string;
}

export function NewsletterSignup({
  source,
  context,
  title = "Get practical wellness updates",
  description = "Receive new product highlights and simple buying guides.",
  ctaLabel = "Subscribe",
  compact = false,
  onDark = false,
  className
}: NewsletterSignupProps) {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<NewsletterSignupInput>({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues: {
      email: "",
      source,
      context
    }
  });
  const emailError = form.formState.errors.email?.message;

  async function onSubmit(values: NewsletterSignupInput) {
    try {
      setIsSubmitting(true);
      setIsSuccess(false);
      setResponseMessage(null);

      const response = await submitNewsletterSignup({
        ...values,
        source,
        context
      });

      form.reset({ email: "", source, context });
      setIsSuccess(true);
      setResponseMessage(response.message || "Subscribed successfully.");
    } catch (error) {
      setIsSuccess(false);
      setResponseMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={`${
        compact
          ? onDark
            ? "rounded-xl border border-white/20 bg-transparent p-3 shadow-none space-y-2.5 sm:p-3.5"
            : "rounded-xl border border-slate-200 bg-white p-3 shadow-soft space-y-2.5 sm:p-3.5"
          : "rounded-2xl border border-slate-200 bg-white p-4 shadow-soft space-y-4 sm:p-5"
      } ${className || ""}`.trim()}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        <p className={`inline-flex w-fit items-center gap-1 rounded-full bg-brand-50 font-semibold uppercase tracking-wide text-brand-700 ${compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"}`}>
          <Mail className="h-3 w-3" />
          Newsletter
        </p>
        <h3 className={compact
          ? onDark
            ? "text-base font-semibold leading-tight text-white"
            : "text-base font-semibold leading-tight text-slate-900"
          : "text-lg font-semibold leading-tight text-slate-900"}
        >
          {title}
        </h3>
        <p className={compact
          ? onDark
            ? "text-xs leading-snug text-slate-200"
            : "text-xs leading-snug text-slate-600"
          : "text-sm text-slate-600"}
        >
          {description}
        </p>
      </div>

      {compact ? (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="sr-only" htmlFor={`newsletter-email-${source}`}>Email</label>
            <Input
              autoComplete="email"
              className="h-10"
              id={`newsletter-email-${source}`}
              placeholder="you@example.com"
              type="email"
              {...form.register("email")}
            />
            {emailError ? <p className="text-xs font-medium text-rose-700">{emailError}</p> : null}
          </div>

          <Button
            className="w-full"
            disabled={isSubmitting}
            size="sm"
            type="submit"
          >
            {isSubmitting ? "Submitting..." : ctaLabel}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField error={emailError} htmlFor={`newsletter-email-${source}`} label="Email">
            <Input
              autoComplete="email"
              id={`newsletter-email-${source}`}
              placeholder="you@example.com"
              type="email"
              {...form.register("email")}
            />
          </FormField>

          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : ctaLabel}
          </Button>
        </div>
      )}

      {responseMessage ? (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            isSuccess
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {responseMessage}
        </p>
      ) : null}
    </form>
  );
}
