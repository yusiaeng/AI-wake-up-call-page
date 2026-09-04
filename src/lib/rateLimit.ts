import { kvGet, kvPut } from "./kv";

const LIMIT_PER_MINUTE = 20;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

// Fixed-window counter keyed by IP + current minute, stored in KV.
// Not perfectly atomic under heavy concurrent load (a get-then-put race can
// let a couple of extra requests through right at the boundary) — acceptable
// for a per-user demo limit like this one; a Durable Object would be the
// exact fix if this ever needed to be airtight.
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const bucket = Math.floor(Date.now() / 60_000);
  const key = `ratelimit:${ip}:${bucket}`;

  const current = Number((await kvGet(key)) ?? "0");

  if (current >= LIMIT_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  await kvPut(key, String(current + 1), 60);
  return { allowed: true, remaining: LIMIT_PER_MINUTE - current - 1 };
}
