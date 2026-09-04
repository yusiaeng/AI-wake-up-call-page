"use client";

import { useState } from "react";

type Props = {
  token: string;
  ctaLabel?: string;
  // "{email}" is substituted with the entered address; kept as a plain
  // string (not a function) since this crosses from a Server Component.
  successText?: string;
};

export default function PackRequestForm({
  token,
  ctaLabel = "Send me the pack",
  successText = "On its way to {email}.",
}: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pack-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? "Something went wrong - please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Couldn't reach the server - check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-accent bg-accent-tint p-5">
        <p className="font-semibold text-accent-strong">{successText.replace("{email}", email)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourorganisation.org"
          className="flex-1 rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50 sm:shrink-0"
        >
          {submitting ? "Sending…" : ctaLabel}
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-faint">Just an email - nothing else to fill in.</p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red bg-red-tint px-3 py-2 text-sm text-red">
          {error}
        </p>
      )}
    </form>
  );
}
