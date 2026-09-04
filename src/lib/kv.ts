// Thin wrapper over Cloudflare's KV REST API. Vercel functions can't hold a
// native KV binding, so we talk to it over HTTPS with the account token —
// see the AI Wake-Up Call spec, section 13 (Technical architecture).
//
// Falls back to one JSON file per key on disk when CF_ACCOUNT_ID /
// CF_KV_NAMESPACE_ID / CF_API_TOKEN aren't set, so `npm run dev` works
// before secrets are wired in. This is deliberately file-backed rather than
// an in-process Map: the Next.js dev server spreads requests across
// multiple worker processes, so a plain Map written by the POST handler is
// invisible to the GET handler that renders the result page moments later.
//
// It's one file per key, not one shared JSON blob — an earlier version used
// a single file, and concurrent requests writing different keys raced on
// read-modify-write, silently dropping whichever write lost the race (a
// preview record would vanish moments after being created). Per-key files
// don't share that failure mode. Not for production use — just good enough
// for solo local dev.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { createHash } from "crypto";
import path from "path";

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;

const isConfigured = Boolean(ACCOUNT_ID && API_TOKEN && NAMESPACE_ID);

if (!isConfigured) {
  console.warn(
    "[kv] CF_ACCOUNT_ID / CF_API_TOKEN / CF_KV_NAMESPACE_ID not set — using a local file store (.data/kv/). Fine for local skeleton work, not for anything real."
  );
}

type FileEntry = { value: string; expiresAt: number | null };
const DATA_DIR = path.join(process.cwd(), ".data", "kv");

function fileFor(key: string): string {
  const hash = createHash("sha256").update(key).digest("hex");
  return path.join(DATA_DIR, `${hash}.json`);
}

function baseUrl(key: string) {
  return `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
}

export async function kvGet(key: string): Promise<string | null> {
  if (!isConfigured) {
    let entry: FileEntry;
    try {
      entry = JSON.parse(readFileSync(fileFor(key), "utf8"));
    } catch {
      return null;
    }
    if (entry.expiresAt && entry.expiresAt < Date.now()) return null;
    return entry.value;
  }

  const res = await fetch(baseUrl(key), {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV get failed: ${res.status} ${await res.text()}`);
  return res.text();
}

export async function kvPut(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (!isConfigured) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const entry: FileEntry = {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    };
    writeFileSync(fileFor(key), JSON.stringify(entry), "utf8");
    return;
  }

  const url = ttlSeconds ? `${baseUrl(key)}?expiration_ttl=${Math.max(60, ttlSeconds)}` : baseUrl(key);
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    body: value,
  });
  if (!res.ok) throw new Error(`KV put failed: ${res.status} ${await res.text()}`);
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (raw === null) return null;
  return JSON.parse(raw) as T;
}

// Cloudflare KV only guarantees read-your-own-write at the same edge
// location — a read from elsewhere in the network can miss a very recent
// write for up to 60 seconds (developers.cloudflare.com/kv/reference/consistency).
// Use this instead of kvGetJSON wherever code reads a key it (or a request
// moments earlier) just wrote — e.g. rendering /preview/[token] straight
// after /api/preview created it. Plain cache lookups that expect frequent
// misses (like the answer-hash result cache) should keep using kvGetJSON.
export async function kvGetJSONFreshWrite<T>(
  key: string,
  { attempts = 4, delayMs = 350 }: { attempts?: number; delayMs?: number } = {}
): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    const value = await kvGetJSON<T>(key);
    if (value !== null) return value;
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

export async function kvPutJSON(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  await kvPut(key, JSON.stringify(value), ttlSeconds);
}
