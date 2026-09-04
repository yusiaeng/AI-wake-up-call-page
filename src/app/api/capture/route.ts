import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { kvGetJSONFreshWrite, kvPutJSON } from "@/lib/kv";
import type { PreviewRecord } from "@/lib/api-types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEAD_TTL_SECONDS = 60 * 60 * 24 * 90;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That request didn't make sense - please try again." }, { status: 400 });
  }

  const { token, fullName, workEmail, role, organisation, phone } = body as Record<string, string>;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing result reference - please start again from your result page." }, { status: 400 });
  }
  if (!fullName?.trim()) {
    return NextResponse.json({ error: "Please add your full name." }, { status: 400 });
  }
  if (!workEmail?.trim() || !EMAIL_RE.test(workEmail.trim())) {
    return NextResponse.json({ error: "Please add a valid work email." }, { status: 400 });
  }
  if (!role?.trim()) {
    return NextResponse.json({ error: "Please choose your role." }, { status: 400 });
  }
  if (!organisation?.trim()) {
    return NextResponse.json({ error: "Please add your organisation's name." }, { status: 400 });
  }

  const preview = await kvGetJSONFreshWrite<PreviewRecord>(`preview:${token}`);
  if (!preview) {
    return NextResponse.json(
      { error: "This result has expired - please retake the check to book." },
      { status: 404 }
    );
  }

  const leadId = randomUUID();
  await kvPutJSON(
    `lead:${leadId}`,
    {
      token,
      qualified: preview.qualified,
      fullName: fullName.trim(),
      workEmail: workEmail.trim(),
      role: role.trim(),
      organisation: organisation.trim(),
      phone: phone?.trim() || null,
      createdAt: Date.now(),
    },
    LEAD_TTL_SECONDS
  );

  return NextResponse.json({ ok: true, qualified: preview.qualified });
}
