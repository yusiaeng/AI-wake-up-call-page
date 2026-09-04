import { describeAnswers, type Answers } from "./questions";
import { FOCUS_AREAS, getFocusArea } from "./focusAreas";

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const GATEWAY_ID = process.env.CF_GATEWAY_ID || "default";
// @cf/meta/llama-3.1-8b-instruct was deprecated (2026-05-30) — swapped for
// the "-fast" variant, which is the current low-latency equivalent.
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

const isConfigured = Boolean(ACCOUNT_ID && API_TOKEN);

if (!isConfigured) {
  console.warn(
    "[ai] CF_ACCOUNT_ID / CF_API_TOKEN not set — using stub personalisation copy. Fine for skeleton work, see the AI Wake-Up Call proof script before wiring this live."
  );
}

export type TailoredFocusArea = {
  key: string;
  blurb: string;
};

export type PersonalisedResult = {
  snapshot: string;
  focusAreas: TailoredFocusArea[];
  stub: boolean;
};

const SYSTEM_PROMPT = `You write short, plain British English copy for a governance diagnostic tool aimed at busy, wary board members and senior leaders.

Rules:
- Warm, direct, no hype. Never use: transformation, journey, unlock, revolutionise, empower, cutting edge, game changing.
- Never claim legal or regulatory compliance (no mentions of GDPR, the EU AI Act, or any regulator, as something the reader now satisfies).
- Never recommend or name a specific AI vendor or product.
- Never predict a specific incident or outcome ("you will be fined", "this will happen").
- Never imply this diagnostic is a formal audit, certification, or legal assessment.
- Credibility comes from governance and board-review experience, not AI expertise.

You will be given a visitor's answers and a fixed pool of focus areas (the set never changes). Choose exactly 3 of them and write a one-sentence tailored blurb for each, referencing the visitor's sector and situation. Also write a short "risk snapshot" paragraph (2-3 sentences) reflecting their specific answers.

The "key" field must be copied EXACTLY, character-for-character, from the pool you're given — never invent, rephrase, or shorten a key (for example, write "oversight", not "governance"). Any key not in the pool will be discarded.

Reply with ONLY valid JSON, no markdown fences, in this exact shape:
{"snapshot": "string", "focusAreas": [{"key": "one of the given keys", "blurb": "string"}, ...exactly 3 items]}`;

function stubResult(answers: Answers): PersonalisedResult {
  const sector = describeAnswers(answers).sector ?? "your organisation";
  const picked = FOCUS_AREAS.slice(0, 3);
  return {
    stub: true,
    snapshot: `Based on what you've told us, there's some AI use at your organisation without much oversight yet - a common starting point, not a crisis. Here's where we'd focus first for a ${sector} board like yours.`,
    focusAreas: picked.map((f) => ({ key: f.key, blurb: f.defaultBlurb })),
  };
}

// The prompt tells the model to copy keys exactly from the given pool, but
// small/fast models don't reliably obey that (observed: it returned
// "governance" instead of "oversight") — the fixed six-item standard means
// an invented key must never reach the page as a raw, unlabelled slug. Any
// key outside the pool is dropped and backfilled from FOCUS_AREAS so the
// visitor always sees exactly 3 real, labelled areas.
function sanitiseFocusAreas(focusAreas: TailoredFocusArea[]): TailoredFocusArea[] {
  const valid = focusAreas.filter((fa) => getFocusArea(fa.key) !== undefined);
  const used = new Set(valid.map((fa) => fa.key));

  for (const area of FOCUS_AREAS) {
    if (valid.length >= 3) break;
    if (!used.has(area.key)) {
      valid.push({ key: area.key, blurb: area.defaultBlurb });
      used.add(area.key);
    }
  }

  return valid.slice(0, 3);
}

function parseModelJSON(raw: string): { snapshot: string; focusAreas: TailoredFocusArea[] } | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.snapshot !== "string" || !Array.isArray(parsed.focusAreas)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function personalise(answers: Answers): Promise<PersonalisedResult> {
  if (!isConfigured) {
    return stubResult(answers);
  }

  const userPrompt = `Visitor's answers:\n${JSON.stringify(describeAnswers(answers), null, 2)}\n\nFocus area pool:\n${JSON.stringify(
    FOCUS_AREAS.map((f) => ({ key: f.key, label: f.label })),
    null,
    2
  )}`;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "cf-aig-gateway-id": GATEWAY_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Workers AI call failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseModelJSON(raw);

  if (!parsed) {
    throw new Error("Workers AI returned unparseable output");
  }

  return { snapshot: parsed.snapshot, focusAreas: sanitiseFocusAreas(parsed.focusAreas), stub: false };
}
