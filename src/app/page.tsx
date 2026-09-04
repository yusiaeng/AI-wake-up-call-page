import Link from "next/link";
import FactCallout from "@/components/FactCallout";
import ScrollReveal from "@/components/ScrollReveal";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24 lg:max-w-5xl">
      {/* Mobile/tablet: everything stacks in one column exactly as before —
          the lg: grid below only takes effect at the desktop breakpoint. */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-4 text-xs uppercase tracking-wide text-accent">
            Take the AI Wake-Up Call check
          </p>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            AI governance shouldn&apos;t be an afterthought.
          </h1>

          <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-muted">
            AI is becoming part of how organisations work, and governance should be at the forefront
            of that change. Good AI governance helps ensure AI is used responsibly and fairly. There
            is a clear, achievable minimum standard for getting this right. This short check-up helps
            you understand where your organisation currently stands, run by people with experience,
            not AI salespeople.
          </p>

          <div className="mt-10">
            <Link
              href="/check"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-accent-strong"
            >
              Check where you stand
            </Link>
          </div>
        </div>

        {/* lg:pt-8 pushes "Why now" down to align with the H1's top edge
            rather than the small eyebrow label above it — the eyebrow's own
            line height + margin is exactly 32px, so the two big headings
            (H1 and "Why now") line up as the visual pair, not H1's tiny
            caption and "Why now". Deliberately NOT forcing the fact card's
            bottom to match the button's bottom too — that needed
            justify-between, which stretched the gap to fill 200px+ of dead
            space whenever the columns' natural heights differ. A tight,
            fixed gap here reads far better than perfect bottom-alignment. */}
        <div className="mt-14 lg:mt-0 lg:pt-8">
          <ScrollReveal>
            <section>
              <h2 className="text-lg font-semibold">Why now</h2>
              <p className="mt-3 max-w-prose text-ink-muted">
                AI is moving quickly from something organisations experiment with to something boards
                are expected to understand and oversee. The questions are getting harder. Are you
                getting it right?
              </p>
            </section>
          </ScrollReveal>

          <FactCallout
            stat="8%"
            detail="of US public companies disclose board-level oversight of AI, and only 9% have a formal AI policy in place."
            source="ISS-STOXX analysis of 3,048 US public companies, January 2026"
            sourceUrl="https://www.iss-stoxx.com/insights/articles/mind-the-governance-gap-the-state-of-board-oversight-and-ai-policy-in-us-companies/"
            colours={["#2A3D6B", "#E0BEDD"]}
            className="mt-8"
            minHeight="217px"
          />
        </div>
      </div>

      <FactCallout
        stat="69%"
        detail="of organisations suspect or have evidence that employees are already using AI tools they haven't approved."
        source="Gartner survey of 302 cybersecurity leaders, March–May 2025"
        sourceUrl="https://www.gartner.com/en/newsroom/press-releases/2025-11-19-gartner-identifies-critical-genai-blind-spots-that-cios-must-urgently-address0"
        colours={["#B8A8E8", "#A0E8D0"]}
        className="mt-20"
      />

      <ScrollReveal>
        <section className="mt-14">
          <h2 className="text-lg font-semibold">What you get</h2>
          <p className="mt-3 max-w-prose text-ink-muted lg:max-w-none">
            Not a lecture on AI. A short, prioritised list of what to fix first, specific enough
            for your board to actually act on.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-14">
          <h2 className="mb-6 text-lg font-semibold">How it works</h2>
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            <div className="rounded-[28px] bg-surface p-6">
              <IconBadge icon="hourglass" tint="#DCE9FA" ink="#1C2B4A" />
              <p className="mt-4 text-xs text-ink-faint">1</p>
              <p className="mt-2 text-xl font-bold tracking-tight">Answer 8 quick questions</p>
              <p className="mt-2 text-sm text-ink-muted">
                About your organisation and how AI is already being used.
              </p>
            </div>

            {/* The active/expanded step, matching Calendly's Book/Prep/Capture
                pattern: soft colour blobs bleeding from the bottom corners of
                an otherwise white card, with a floating mockup on top —
                rather than a full-bleed gradient, so the surrounding step
                text stays exactly as legible as steps 1 and 3. */}
            <div
              className="rounded-[28px] p-6"
              style={{
                background:
                  "radial-gradient(circle at 15% 100%, rgba(240,168,104,0.35), transparent 45%), " +
                  "radial-gradient(circle at 90% 100%, rgba(200,232,150,0.45), transparent 45%), " +
                  "var(--color-surface)",
              }}
            >
              <IconBadge icon="sparkle" tint="#E3F0C2" ink="#3D4A1E" />
              <p className="mt-4 text-xs text-ink-faint">2</p>
              <p className="mt-2 text-xl font-bold tracking-tight">See a tailored preview</p>
              <p className="mt-2 text-sm text-ink-muted">
                What your Bare Minimum Pack would focus on, and why.
              </p>

              <div className="mt-6 rounded-2xl bg-surface p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Where your pack could focus
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="rounded-lg border border-border px-3 py-2 text-sm font-medium">
                    Board oversight &amp; reporting
                  </div>
                  <div className="rounded-lg border border-border px-3 py-2 text-sm font-medium">
                    Staff awareness &amp; training
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-surface p-6">
              <IconBadge icon="calendar" tint="#F6DCC8" ink="#5C3A20" />
              <p className="mt-4 text-xs text-ink-faint">3</p>
              <p className="mt-2 text-xl font-bold tracking-tight">Book a one-to-one call</p>
              <p className="mt-2 text-sm text-ink-muted">
                Thirty minutes with Karl or Hamada, if it&apos;s the right fit.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <FactCallout
        stat="$670,000"
        detail="Data breaches linked to unsanctioned &quot;shadow AI&quot; tools cost that much more on average than other data breaches."
        source="IBM Cost of a Data Breach Report, 2025"
        sourceUrl="https://www.ibm.com/think/insights/data-matters/cost-of-a-data-breach"
        colours={["#A8CCF0", "#3FBFB5", "#1C2B4A"]}
        className="mt-14"
      />
    </main>
  );
}

const ICONS = {
  hourglass: (
    <path d="M6.5 3h11M6.5 21h11M8 3c0 4.5 3 6 4 6.75C13 9 16 7.5 16 3M8 21c0-4.5 3-6 4-6.75C13 15 16 16.5 16 21" />
  ),
  sparkle: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2c0 5.5 4.5 10 10 10-5.5 0-10 4.5-10 10 0-5.5-4.5-10-10-10 5.5 0 10-4.5 10-10z"
    />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M15.5 3v4M8.5 3v4M3.5 10.5h17" />
    </>
  ),
} as const;

// Rounded colour-badge icons, one per step — small visual anchors so each
// part of "How it works" reads at a glance instead of relying on the
// number alone, echoing the icon-badge style from the Calendly reference.
function IconBadge({ icon, tint, ink }: { icon: keyof typeof ICONS; tint: string; ink: string }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-2xl"
      style={{ backgroundColor: tint }}
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: ink }}
      >
        {ICONS[icon]}
      </svg>
    </div>
  );
}
