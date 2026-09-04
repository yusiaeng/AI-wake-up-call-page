"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, questionTitle, type Answers } from "@/lib/questions";

export default function CheckPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [customMotivation, setCustomMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  function answerAndAdvance(value: string) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    setError(null);

    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
    } else {
      submit(next);
    }
  }

  async function submit(finalAnswers: Answers) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (res.status === 429) {
        setError("A lot of people are checking right now - please wait a minute and try again.");
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong on our end. Please try again.");
        setSubmitting(false);
        return;
      }

      const { token } = await res.json();
      router.push(`/preview/${token}`);
    } catch {
      setError("Couldn't reach the server - check your connection and try again.");
      setSubmitting(false);
    }
  }

  function goBack() {
    if (index > 0) {
      setError(null);
      setIndex(index - 1);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-1.5" aria-label={`Question ${index + 1} of ${QUESTIONS.length}`}>
        {QUESTIONS.map((q, i) => (
          <span
            key={q.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      {submitting ? (
        <LoadingState />
      ) : (
        <>
          <h1 className="text-balance text-2xl font-bold leading-snug sm:text-3xl">
            {questionTitle(question, answers)}
          </h1>
          {question.kind === "chips-text" && question.helper && (
            <p className="mt-2 text-sm text-ink-muted">{question.helper}</p>
          )}

          <div className="mt-8">
            {question.kind === "cards" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {question.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => answerAndAdvance(opt.value)}
                    className="rounded-lg border border-border bg-surface px-4 py-3.5 text-left text-sm font-medium leading-snug transition hover:border-accent hover:bg-accent-tint focus-visible:border-accent"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {question.chips.map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => answerAndAdvance(chip.value)}
                      className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:border-accent hover:bg-accent-tint"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customMotivation.trim()) answerAndAdvance(customMotivation.trim());
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={customMotivation}
                    onChange={(e) => setCustomMotivation(e.target.value)}
                    placeholder="Or type your own reason"
                    className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus-visible:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={!customMotivation.trim()}
                    className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-40"
                  >
                    Continue
                  </button>
                </form>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-6 rounded-lg border border-red bg-red-tint px-4 py-3 text-sm text-red">
              {error}
            </p>
          )}

          {index > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="mt-8 self-start text-sm text-ink-faint transition hover:text-ink-muted"
            >
              ← Back
            </button>
          )}

          {isLast && !error && (
            <p className="mt-6 text-xs text-ink-faint">Last question - this builds your result.</p>
          )}
        </>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-tint border-t-accent" />
      <p className="text-ink-muted">Putting your result together…</p>
    </div>
  );
}
