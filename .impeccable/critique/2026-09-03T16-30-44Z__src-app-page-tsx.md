---
target: landing page (src/app/page.tsx)
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\yusia\\OneDrive - Imperial College London\\GenerativeAI\\AIfunnel-final-project\\src\\app\\page.tsx"
target_fingerprint: "sha256:6e19fbc2405d261fa51a2f0cd1bc648c1f0ec31fa955e0a41829d076bab6787b"
target_path: "C:\\Users\\yusia\\OneDrive - Imperial College London\\GenerativeAI\\AIfunnel-final-project\\src\\app\\page.tsx"
timestamp: 2026-09-03T16-30-44Z
slug: src-app-page-tsx
---
Method: dual-agent (A: ad499594caef663f6 · B: aa1b68a407e944d46)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Process status (progress dots, spinner) is clear; identity status ("whose site is this") is not |
| 2 | Match System / Real World | 3 | "Turnover" language doesn't fit NHS/charity respondents even though sector is collected first |
| 3 | User Control and Freedom | 3 | Back button works throughout; no visible exit back to homepage from the check flow |
| 4 | Consistency and Standards | 4 | Consistent buttons, spacing, cards, color use across landing/check/preview/locked |
| 5 | Error Prevention | 3 | Disabled-empty buttons, rate-limit handling; no review-before-submit step on last question |
| 6 | Recognition Rather Than Recall | 4 | One-question-per-screen with visible progress removes recall burden |
| 7 | Flexibility and Efficiency | n/a | First-time-visitor funnel; no power-user path expected on this surface |
| 8 | Aesthetic and Minimalist Design | 3 | Genuinely minimal; docked for two unused dead theme tokens (`--color-blue`, `--color-blue-tint`) |
| 9 | Error Recovery | 3 | Plain-language `role="alert"` errors; recovery text itself fails contrast (see P1) |
| 10 | Help and Documentation | n/a | Not applicable to a short marketing/lead-gen funnel by design |
| **Total** | | **26/32** | **Good (81%)** |

## Design Specificity Verdict

**LLM assessment:** Mixed. The copy is genuinely bespoke to this product — "Bare Minimum Pack," "Karl or Hamada," the 8 real governance questions — and could not be dropped into an unrelated page unchanged. But the visual system and interaction pattern (mono-caps eyebrow → bold H1 → muted subhead → single sage CTA → three-card "why/what/how" block → repeat CTA) is default startup-landing-page boilerplate that carries no institutional/governance-specific visual cue. An unrelated B2B lead-gen product could ship this exact structure and only swap headline, card labels, and questions.

**Deterministic scan:** The static CLI detector (`detect.mjs --json src/app src/components`) reported zero findings (clean). The browser-runtime detector, injected live into the rendered page, independently found **4 low-contrast violations**, all `text-ink-faint` (`#85867a`) on light backgrounds (`#f8f8f7` / `#ffffff`), at `src/app/page.tsx:28,52,57,62` — below the 4.5:1 AA threshold for 12px text. This is a real gap in the static detector (it does not appear to resolve Tailwind `@theme` custom-property tokens against their computed backgrounds), not a false positive — source inspection confirms all three colors are fixed hex values. Treat the CLI's "clean" result with caution; the runtime evidence is authoritative here.

**Visual overlays:** Browser mutation/injection succeeded (live-server on port 8400, `detect.js` injected, console read, server stopped afterward). No standing overlay was left in the user's own browser — this was a scripted, ephemeral inspection pass, not a persistent [Human] tab overlay.

## Overall Impression

The copy and the AI-personalization engine are doing real, specific work — the hook, the reassurance, and the tailored result snapshot are genuinely well-crafted. But the visual shell around that copy is templated, the booking step (the entire point of the funnel) is a literal unfinished placeholder, and the page fails its own most vulnerable users at the exact moment it promises reassurance. The single biggest opportunity: fix the contrast and the placeholder before Friday (both are P0/P1, both are fast), and make the "why now" claim and disqualification path feel as considered as the hero copy already does.

## What's Working

1. **The hero hook-then-reassurance pair.** "AI is already being used in your organisation. Nobody's watching it." → "That's not unusual, and it's not a crisis." names the fear and removes shame from it in two sentences — exactly calibrated for an audience that might get defensive.
2. **The one-question-per-screen flow with auto-advance and visible progress.** Confirmed via live testing: removes recall burden, sets accurate time expectations, and the "Last question" microcopy builds anticipation well.
3. **The AI result synthesis is real, not templated filler.** Live-tested end to end: the snapshot correctly referenced the respondent's actual sector, turnover band, and stated motivation, and the fallback logic in `ai.ts` protects against ever showing a nonsense focus-area category.

## Priority Issues

**[P0] Booking flow is a non-functional placeholder at the highest-trust moment**
- Why it matters: after a qualified visitor fills in 5 fields, "Continue to booking" shows a dashed box literally reading `[ scheduler placeholder ]`. This is the funnel's entire conversion goal and it cannot currently book a single real call — worse, a board member who was just told they qualify is shown visibly unfinished UI at the point trust matters most.
- Fix: wire a real Calendly/Cal.com embed before any real traffic; if that can't land by Friday, replace the box with an explicit "We'll email you within one business day to find a time" confirmation so nothing unfinished is visible.
- Suggested command: `/impeccable harden`

**[P1] WCAG AA contrast failure on functional microcopy (confirmed independently by both assessments)**
- Why it matters: `--color-ink-faint` (#85867a) on `--color-bg`/`--color-surface` computes to 3.5–3.7:1, below the 4.5:1 AA minimum, at `page.tsx:28,52,57,62` — the check-flow caption, the "← Back" button, and the step numbers. This is functional/interactive text, not decoration.
- Fix: darken `ink-faint` to at least `#6b6c60` and re-verify ≥4.5:1, or reserve the faint token for genuinely decorative text and promote functional microcopy to `ink-muted`.
- Suggested command: `/impeccable polish`

**[P1] WCAG AA contrast failure on error recovery text**
- Why it matters: `--color-red` (#a5624f) on `--color-red-tint` (#f6ece8) computes to ~4.06:1 at 14px, used in every `role="alert"` banner across `CaptureForm`, `PackRequestForm`, `CheckPage`, and `LockedPage` — the exact moment a stressed user is re-reading why their submission failed.
- Fix: darken the red to roughly `#8f4d3c` (or lighten the tint) and re-verify contrast.
- Suggested command: `/impeccable polish`

**[P2] No branching logic despite collecting branchable data**
- Why it matters: sector and board-existence are collected in Q1–Q3, but every question after that stays generic-corporate regardless — "annual turnover" is asked of NHS/charity respondents, and "How confident is your board discussing AI risk?" is asked even after someone answers "we don't have a formal board," producing a visible non-sequitur live-tested end to end.
- Fix: branch wording off `sector` (turnover → "income"/"budget" for charity/NHS) and off `role` (skip or reword the board-confidence question when no board exists).
- Suggested command: `/impeccable clarify`

**[P2] Disqualification messaging undercuts the page's own emotional promise**
- Why it matters: "Not quite the right fit, right now" is sales-qualification tone applied to the exact demographic (no governance, no board) the hero copy promised to de-stigmatize ("That's not unusual, and it's not a crisis"). Live-tested: the rejection sits directly above two still-active lead-capture forms, which reads as "you rejected me but still want my contact details."
- Fix: reframe around the respondent's need, not the company's fit criteria — lead with what they still get, and briefly explain why the call specifically is reserved, so it doesn't read as an opaque filter.
- Suggested command: `/impeccable clarify`

**[P3] No trust/identity signal anywhere on the page**
- Why it matters: no company name, logo, or credential beyond first names "Karl or Hamada" and an unverifiable claim of "board-review experience" — for an audience whose job is literally scrutinizing exactly this kind of unverified claim, that's real friction before they'll hand over organisational governance detail.
- Fix: add a minimal footer/byline naming the operating entity and one credibility line (e.g., a named credential).
- Suggested command: `/impeccable clarify`

## Persona Red Flags

**Jordan (confused first-timer):** No nav/logo/"who is this" on arrival — nothing to click to check legitimacy before committing. Lands straight into a 10-option organisation-type question with no framing sentence, which for an "8 questions, 2 minutes" promise front-loads the least-obviously-relevant screen first. If Jordan answers "no formal board" at Q3, being asked about "board confidence" at Q7 may make Jordan doubt their own earlier answer and hit Back to check.

**Riley (deliberate stress tester):** Will notice the unsourced claim in "Why now" (a shipped `// TODO: replace with a real, sourced statistic` sits directly above it) on a page that positions itself as board-review-credible. Will deliberately trigger disqualification and flag the rejection-copy-next-to-still-active-capture-forms pattern as mildly manipulative. Will hit the `[ scheduler placeholder ]` box and conclude the build isn't production-ready.

**Casey (distracted mobile user):** Question 1's 10 options stack into ~1.5 viewport-heights of single-column buttons on mobile — the slowest, most scroll-heavy screen is first, undercutting the "2 minute" promise. The "← Back" control most needed for correcting a mis-tap is rendered in the lowest-contrast color in the palette (P1 above). No `autoComplete` attributes on any capture-form input, so the OS/browser can't assist a one-thumb, distracted fill-in.

## Minor Observations

- Two theme colors (`--color-blue`, `--color-blue-tint`) are defined in `globals.css` but never referenced in `src/` — dead tokens, or an opportunity to use them to distinguish qualified vs. not-qualified result states, which currently mix `text-sage`/`text-plum` eyebrows with no stated system.
- No Open Graph/Twitter card meta tags in `layout.tsx` — sharing this link in a board pack email or Slack will preview as bare text.
- No `autoComplete` attributes on any form input across `CaptureForm`, `PackRequestForm`, or the `/locked` passcode field.
- `"Thanks, {fullName.split(" ")[0]}"` will render oddly for unusual/single-word name entries — low severity.
- The mono-font numeric step markers ("1"/"2"/"3") are a nice restrained systemic detail; worth leaning into further as a signature typographic device rather than the page's only such flourish.
- `/locked` passcode gate is styled consistently — confirm it's disabled before real traffic is sent to this URL.

## Questions to Consider

1. If the entire pitch is "nobody's watching it," why doesn't the questionnaire itself watch its own answers — what would it look like if every question after Q1 reworded itself around the respondent's actual context (income vs. turnover, "senior team" vs. "board")?
2. Should this even be a hard qualify/disqualify gate, given the people it disqualifies (no board, no governance) are arguably the ones most in need of help?
3. Would a governance-literate board member trust this page more with slightly less minimalism — one name, one credential, one sourced stat — rather than less?
