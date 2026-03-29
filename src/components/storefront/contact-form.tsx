"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inquirySchema, type InquiryInput } from "@/lib/validation";
import { submitInquiry } from "@/services/storefront-api";

export function ContactForm() {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      source: "contact_page"
    }
  });

  async function onSubmit(values: InquiryInput) {
    try {
      setIsSubmitting(true);
      setResponseMessage(null);
      await submitInquiry({
        ...values,
        source: "contact_page"
      });
      form.reset({ name: "", email: "", phone: "", message: "", source: "contact_page" });
      setResponseMessage("Thanks. Your inquiry has been received. Our team will respond shortly.");
    } catch (error) {
      setResponseMessage(error instanceof Error ? error.message : "Failed to submit inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Support Team</p>
        <h2 className="text-xl font-bold text-slate-900">Send an Inquiry</h2>
      </div>

      <FormField error={form.formState.errors.name?.message} htmlFor="name" label="Name">
        <Input id="name" {...form.register("name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField error={form.formState.errors.phone?.message} htmlFor="phone" label="Phone">
          <Input id="phone" placeholder="+254..." {...form.register("phone")} />
        </FormField>
        <FormField error={form.formState.errors.email?.message} htmlFor="email" label="Email (Optional)">
          <Input id="email" type="email" {...form.register("email")} />
        </FormField>
      </div>

      <FormField error={form.formState.errors.message?.message} htmlFor="message" label="Message">
        <Textarea id="message" {...form.register("message")} />
      </FormField>

      <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {responseMessage ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{responseMessage}</p>
      ) : null}
    </form>
  );
}
