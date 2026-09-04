import type { Answers } from "./questions";

export type QualificationResult = {
  qualified: boolean;
  reason?: string;
};

// Three hard filters, agreed in the spec: no board, already has dedicated
// governance in place, or the visitor has no authority to act on the result.
export function qualify(answers: Answers): QualificationResult {
  if (answers.role === "no-board") {
    return {
      qualified: false,
      reason: "no-formal-board",
    };
  }

  if (answers.governance === "dedicated") {
    return {
      qualified: false,
      reason: "already-governed",
    };
  }

  if (answers.role === "other-staff") {
    return {
      qualified: false,
      reason: "no-authority",
    };
  }

  return { qualified: true };
}

export type DisqualifiedCopy = {
  heading: string;
  body: string;
  ctaHeading: string;
  ctaLabel: string;
  // Plain string, not a function — this crosses the server/client boundary
  // to a "use client" form component, and functions can't serialize there.
  // "{email}" is substituted client-side once the visitor's typed it in.
  successText: string;
};

// This page is the one piece of outreach a not-yet-qualified visitor gets, so
// it's written like an email to a future customer, not a rejection notice:
// each reason leads with a concrete, tailored next step instead of "you
// didn't make the cut," and each gets exactly one clear ask, not two.
export function disqualifiedCopy(reason?: string): DisqualifiedCopy {
  switch (reason) {
    case "no-formal-board":
      return {
        heading: "Worth putting in place before you come back",
        body: "You told us there's no formal board yet, so the one-to-one call isn't the right next step today - but that doesn't mean there's nothing to do. Naming one person responsible for AI, even informally, is usually the single biggest lever an organisation can pull before it needs a full board process. We've put together a short starter checklist to get that in place, and we'll send it together with the full Bare Minimum Pack - once it's done, the check-up (and the call) is exactly what you should come back for.",
        ctaHeading: "Get the starter checklist and the Bare Minimum Pack",
        ctaLabel: "Send me both",
        successText: "Both are on their way to {email}.",
      };
    case "already-governed":
      return {
        heading: "Good sign - you're already ahead of most boards",
        body: "You told us you already have a dedicated AI policy and oversight in place, which is exactly what most of the boards we talk to are still missing. The one-to-one call is reserved for organisations building that from scratch, so it's not the right fit here - but the Bare Minimum Pack below is still worth a skim as a quick gap-check against what you've already got, and if anything ever changes, we're easy to find.",
        ctaHeading: "Get the Bare Minimum Pack",
        ctaLabel: "Send me the Bare Minimum Pack",
        successText: "On its way to {email}.",
      };
    case "no-authority":
      return {
        heading: "A workshop pack built for exactly this situation",
        body: "You told us AI is already being used at your organisation, and that you're not the one holding board authority - that's an extremely common gap, and it's exactly where a short AI Literacy Workshop earns its keep. It's built for the people actually using these tools day to day: what's safe to try, what to flag, and how to push for real oversight before a small habit becomes a real risk. We'll send it together with the full Bare Minimum Pack in one go.",
        ctaHeading: "Get the workshop pack and the Bare Minimum Pack",
        ctaLabel: "Send me both",
        successText: "Both are on their way to {email}.",
      };
    default:
      return {
        heading: "Not the right fit for a call today - but here's something useful",
        body: "Based on your answers, the one-to-one call isn't the right next step right now. The Bare Minimum Pack below covers the same ground in plain language, no strings attached.",
        ctaHeading: "Get the full Bare Minimum Pack",
        ctaLabel: "Send me the pack",
        successText: "On its way to {email}.",
      };
  }
}
