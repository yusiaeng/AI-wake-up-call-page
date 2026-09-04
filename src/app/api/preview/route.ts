import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { QUESTIONS, type Answers } from "@/lib/questions";
import { qualify } from "@/lib/qualify";
import { personalise, type PersonalisedResult } from "@/lib/ai";
import { kvGetJSON, kvPutJSON } from "@/lib/kv";
import { hashAnswers } from "@/lib/hashAnswers";
import { checkRateLimit } from "@/lib/rateLimit";
import type { PreviewRecord } from "@/lib/api-types";

const RESULT_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // a week is plenty for a demo
const PREVIEW_TTL_SECONDS = 60 * 60 * 24 * 7;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function validateAnswers(answers: unknown): answers is Answers {
  if (typeof answers !== "object" || answers === null) return false;
  const record = answers as Record<string, unknown>;
  for (const q of QUESTIONS) {
    const value = record[q.id];
    if (typeof value !== "string" || value.trim().length === 0) return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That request didn't make sense - please try again." }, { status: 400 });
  }

  const answers = (body as { answers?: unknown })?.answers;
  if (!validateAnswers(answers)) {
    return NextResponse.json(
      { error: "Please answer every question before continuing." },
      { status: 400 }
    );
  }

  const token = randomUUID();
  const qualification = qualify(answers);

  try {
    const cacheKey = `result:${hashAnswers(answers)}`;
    let result = await kvGetJSON<PersonalisedResult>(cacheKey);

    if (!result) {
      result = await personalise(answers);
      await kvPutJSON(cacheKey, result, RESULT_CACHE_TTL_SECONDS);
    }

    // Non-qualifiers still get the tailored "where your Bare Minimum Pack
    // would focus" preview — they just don't get the call CTA, which is
    // gated separately by the reason-specific copy in qualify.ts.
    const record: PreviewRecord = qualification.qualified
      ? { qualified: true, answers, result, createdAt: Date.now() }
      : { qualified: false, reason: qualification.reason ?? "not-a-fit", result, createdAt: Date.now() };

    await kvPutJSON(`preview:${token}`, record, PREVIEW_TTL_SECONDS);
    return NextResponse.json({ token });
  } catch (err) {
    console.error("[api/preview] personalisation failed", err);
    return NextResponse.json(
      { error: "We couldn't personalise this fully right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
