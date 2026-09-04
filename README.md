# AI Wake-Up Call

A short diagnostic that turns a wary board member into a qualified booking for a one-to-one AI governance check-up. Landing page → 8-question flow → personalised result at `/preview/[token]` → book or waitlist.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Without `CF_ACCOUNT_ID` / `CF_API_TOKEN` set, the app falls back to stub AI copy and an in-memory KV store — the whole flow is clickable end to end before any Cloudflare secrets exist. Without `APP_PASSCODE` set, the passcode gate is skipped entirely (open access, local dev only).

## How it's wired

- **AI**: `src/lib/ai.ts` calls Workers AI directly via `https://api.cloudflare.com/client/v4/accounts/{id}/ai/v1/chat/completions`, routed through AI Gateway with the `cf-aig-gateway-id` header. No separate Cloudflare Worker — Vercel calls Cloudflare's REST APIs directly.
- **KV**: `src/lib/kv.ts` talks to Cloudflare's KV REST API the same way. Used for the AI-result cache (keyed by a hash of the answers, so identical answer combinations skip the AI call), the per-preview record behind `/preview/[token]`, rate-limit counters, and captured leads.
- **Rate limiting**: `src/lib/rateLimit.ts` is a fixed-window counter (20 requests/minute/IP) stored in KV. **Trade-off**: this is a get-then-increment, not an atomic operation — under heavy concurrent load from the same IP, a couple of requests can slip through right at the window boundary. Acceptable for a per-user demo limit; a Durable Object would be the airtight fix if this ever needed to be exact.
- **Qualification**: `src/lib/qualify.ts` — three hard filters (no board, already has dedicated AI governance, visitor has no authority) send someone to the waitlist outcome instead of a booking.

## Deliberately not built

See the [one-page summary](https://claude.ai/code/artifact/fe4b3f75-a9ea-412e-82bc-9a1b4813a673) for the full list — no real scheduler, no lead dashboard, no session resume, no drop-off analytics.
