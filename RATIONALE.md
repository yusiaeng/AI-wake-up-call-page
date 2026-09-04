# Rationale

**Who this is for.** Boards and senior leaders at organisations that are neither AI-native nor AI-averse — NHS trusts, local/central government, housing associations, charities, academy trusts, mid-size corporates — where AI is already being used informally by staff, but nobody at board level has looked at it yet. Not technical, not looking for a vendor pitch, wary of being sold to. The product's whole voice is built around that: "run by people with board-review experience, not AI salespeople."

**Choices made, and why:**

- **One question at a time, not a form.** The 8-question check shows one card at a time with a progress bar rather than a single long form. Boards are busy and mobile-first; a wall of fields reads as work, a short sequence reads as a 2-minute check-up. This was worth the extra client-state complexity.

- **Three qualification filters route to nurture, not rejection.** No board, already-governed, or no-authority-to-act all skip the booking call — but each gets a tailored next step (a starter checklist, an "you're already ahead" acknowledgment, or a staff workshop pack) instead of a flat "you don't qualify." A disqualified visitor is a future customer, not a filtered-out lead, and the copy treats them that way.

- **Everyone gets the tailored preview, qualified or not.** The AI-generated "where your pack would focus" breakdown originally only showed to qualified visitors. Extending it to everyone costs one more AI call per submission but means nobody leaves empty-handed — the reciprocity is worth the marginal cost.

- **A fixed 6-item focus-area pool, not free-form AI output.** The model picks 3 of 6 pre-written governance topics rather than inventing categories. Small/fast models don't reliably stay on-script — a sanitisation step drops any invented key and backfills from the pool, so a governance-literate audience never sees a nonsense category, even when the model misbehaves.

- **Every stat on the landing page is real and cited** (ISS-STOXX, Gartner, IBM), replacing an original placeholder claim. This audience scrutinises unverified numbers for a living; an unsourced "boards are facing more scrutiny" line would undercut the whole pitch.

- **Colour and contrast were treated as launch-blocking, not polish.** Every gradient card is mathematically verified at ≥4.5:1 contrast against its text, not eyeballed — a governance product that's hard to read fails on its own terms.

- **Mobile is the baseline, desktop is additive.** All desktop layout (the split hero, the 3-column "How it works") is added via `lg:` breakpoints on top of an unchanged mobile layout, rather than a separate desktop design — so the already-validated mobile experience was never at risk of regressing while iterating on desktop.

- **The app runs with zero real credentials configured.** Without Cloudflare AI/KV keys, it falls back to stub personalisation and an in-memory store — the entire flow is clickable and demoable before any real secret exists, which mattered for iterating quickly.
