import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { kvGetJSONFreshWrite, kvPutJSON } from "@/lib/kv";
import type { PreviewRecord } from "@/lib/api-types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUEST_TTL_SECONDS = 60 * 60 * 24 * 90;

// Deliberately separate from /api/capture: this is the low-friction "just
// send me the pack" ask, open to qualified and non-qualified visitors alike.
// Booking stays behind the fuller form — this route only ever asks for an
// email address.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That request didn't make sense - please try again." }, { status: 400 });
  }

  const { token, email } = body as Record<string, string>;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing result reference - please start again from your result page." }, { status: 400 });
  }
  if (!email?.trim() || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Please add a valid email address." }, { status: 400 });
  }

  const preview = await kvGetJSONFreshWrite<PreviewRecord>(`preview:${token}`);
  if (!preview) {
    return NextResponse.json(
      { error: "This result has expired - please retake the check to request the pack." },
      { status: 404 }
    );
  }

  await kvPutJSON(
    `pack-request:${randomUUID()}`,
    {
      token,
      email: email.trim(),
      qualified: preview.qualified,
      createdAt: Date.now(),
    },
    REQUEST_TTL_SECONDS
  );

  return NextResponse.json({ ok: true, qualified: preview.qualified });
}
