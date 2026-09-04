"use client";

import { useState } from "react";
import { ROLE_OPTIONS } from "@/lib/roles";

type Props = {
  token: string;
  qualified: boolean;
};

// Prefilling name/email means a visitor who just typed both into the form
// above doesn't have to retype them into Calendly's own booking screen.
const CALENDLY_URL = "https://calendly.com/yusia-ali06/30min";

function calendlyEmbedSrc(fullName: string, workEmail: string) {
  const params = new URLSearchParams({
    name: fullName,
    email: workEmail,
    hide_gdpr_banner: "1",
  });
  return `${CALENDLY_URL}?${params.toString()}`;
}

export default function CaptureForm({ token, qualified }: Props) {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [role, setRole] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName, workEmail, role, organisation, phone }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? "Something went wrong - please try again.");
        setSubmitting(false);
        return;
      }

      // The pack itself still goes out through the low-friction pack-request
      // route; firing it alongside capture means one form gets both the pack
      // and (for qualified visitors) the booking calendar, instead of two.
      if (qualified) {
        fetch("/api/pack-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email: workEmail }),
        }).catch(() => {});
      }

      setSubmitted(true);
    } catch {
      setError("Couldn't reach the server - check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && qualified) {
    return (
      <div className="rounded-xl border border-accent bg-accent-tint p-6">
        <p className="mb-4 font-semibold text-accent-strong">
          Thanks, {fullName.split(" ")[0]} - your pack is on its way. Pick a time below if you&apos;d
          like to talk it through.
        </p>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <iframe
            src={calendlyEmbedSrc(fullName, workEmail)}
            title="Book a time with Karl or Hamada"
            width="100%"
            height="700"
            className="block"
          />
        </div>
      </div>
    );
  }

  if (submitted && !qualified) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="font-semibold">Thanks, {fullName.split(" ")[0]} - we've got your details.</p>
        <p className="mt-2 text-sm text-ink-muted">
          We'll be in touch if a spot opens up that's a better fit. In the meantime, it's worth
          sharing this result with someone on your board who can act on it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6">
      <div className="grid gap-4">
        <Field label="Full name">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
          />
        </Field>

        <Field label="Work email">
          <input
            type="email"
            required
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
          />
        </Field>

        <Field label="Role">
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
          >
            <option value="" disabled>
              Choose your role
            </option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Organisation">
          <input
            type="text"
            required
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
          />
        </Field>

        <Field label="Phone (optional)">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus-visible:border-accent"
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red bg-red-tint px-4 py-3 text-sm text-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
      >
        {submitting ? "Sending…" : qualified ? "Send me the pack" : "Leave my details"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
