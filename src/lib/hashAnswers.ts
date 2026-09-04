import { createHash } from "crypto";
import type { Answers } from "./questions";

// Stable cache key for a given answer combination — order-independent so the
// same answers always hash the same way regardless of how they were built up.
export function hashAnswers(answers: Answers): string {
  const sorted = Object.keys(answers)
    .sort()
    .map((k) => [k, answers[k]] as const);
  return createHash("sha256").update(JSON.stringify(sorted)).digest("hex").slice(0, 24);
}
