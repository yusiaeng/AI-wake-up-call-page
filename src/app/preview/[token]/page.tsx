import Link from "next/link";
import { kvGetJSONFreshWrite } from "@/lib/kv";
import { getFocusArea } from "@/lib/focusAreas";
import { disqualifiedCopy } from "@/lib/qualify";
import CaptureForm from "@/components/CaptureForm";
import PackRequestForm from "@/components/PackRequestForm";
import type { PreviewRecord } from "@/lib/api-types";
import type { PersonalisedResult } from "@/lib/ai";

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await kvGetJSONFreshWrite<PreviewRecord>(`preview:${token}`);

  if (!record) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold">This result has expired</h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          Results links don't last forever. Take the check again and we'll build you a fresh one.
        </p>
        <Link
          href="/check"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Retake the check
        </Link>
      </main>
    );
  }

  if (!record.qualified) {
    const copy = disqualifiedCopy(record.reason);
    return (
      <main className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <p className="mb-4 text-xs uppercase tracking-wide text-plum">Your result</p>
        {record.result.stub && (
          <p className="mb-4 inline-block rounded-full bg-plum-tint px-3 py-1 text-[11px] text-plum">
            stub content - AI not yet configured
          </p>
        )}
        <h1 className="text-balance text-3xl font-bold leading-tight">{copy.heading}</h1>
        <p className="mt-4 max-w-prose text-ink-muted">{copy.body}</p>

        <TailoredPreview result={record.result} />

        <div className="mt-10 border-t border-border pt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">
            {copy.ctaHeading}
          </h2>
          <PackRequestForm token={token} ctaLabel={copy.ctaLabel} successText={copy.successText} />
        </div>
      </main>
    );
  }

  const { result } = record;

  return (
    <main className="mx-auto max-w-xl px-6 py-16 sm:py-24">
      <p className="mb-4 text-xs uppercase tracking-wide text-accent">Your result</p>
      {result.stub && (
        <p className="mb-4 inline-block rounded-full bg-plum-tint px-3 py-1 text-[11px] text-plum">
          stub content - AI not yet configured
        </p>
      )}

      <h1 className="text-balance text-3xl font-bold leading-tight">Where your board stands</h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">{result.snapshot}</p>

      <TailoredPreview result={result} />

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Get the full Bare Minimum Pack
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          Add your details and we&apos;ll send the pack straight away - a live calendar to book a
          free one-to-one Wake-Up Call with Karl or Hamada appears right after, no extra form
          needed.
        </p>
        <CaptureForm token={token} qualified={true} />
      </div>
    </main>
  );
}

// Shared by qualified and non-qualified results — everyone who takes the
// check gets a tailored preview of what the Bare Minimum Pack would cover,
// regardless of whether they're offered the one-to-one call.
function TailoredPreview({ result }: { result: PersonalisedResult }) {
  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
        Where your Bare Minimum Pack would focus
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {result.focusAreas.map((fa) => {
          const area = getFocusArea(fa.key);
          return (
            <div key={fa.key} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-semibold">{area?.label ?? fa.key}</p>
              <p className="mt-1.5 text-sm text-ink-muted">{fa.blurb}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
