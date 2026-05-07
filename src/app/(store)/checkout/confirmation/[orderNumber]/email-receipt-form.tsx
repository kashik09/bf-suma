"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { Button, Input } from "@/components/ui";

interface EmailReceiptFormProps {
  orderNumber: string;
  defaultEmail: string;
}

export function EmailReceiptForm({ orderNumber, defaultEmail }: EmailReceiptFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email: email.trim() })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send receipt");
      }

      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-3 text-green-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <Check className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium">Receipt sent to {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-900">Email Receipt</h2>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Want a copy of your order confirmation sent to your email?
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1"
          disabled={status === "sending"}
        />
        <Button type="submit" variant="secondary" isLoading={status === "sending"}>
          Send
        </Button>
      </div>
      {status === "error" && errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </form>
  );
}
