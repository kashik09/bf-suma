"use client";

import { useState } from "react";

interface AccountProfileFormProps {
  initialFirstName: string;
  initialLastName: string;
  email: string;
  initialPhone: string;
}

export function AccountProfileForm({
  initialFirstName,
  initialLastName,
  email,
  initialPhone
}: AccountProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.message || "We couldn't save your profile. Please try again.");
        setPending(false);
        return;
      }

      setMessage(payload.message || "Profile updated successfully.");
    } catch {
      setError("We couldn't save your profile. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="first_name">First name</label>
          <input
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
            id="first_name"
            required
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="last_name">Last name</label>
          <input
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
            id="last_name"
            required
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
          disabled
          id="email"
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="phone">Phone</label>
        <input
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}

      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
