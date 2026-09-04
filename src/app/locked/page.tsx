export default async function LockedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from = "/", error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-semibold">This is a private preview</h1>
      <p className="mt-2 text-sm text-ink-muted">Enter the passcode to continue.</p>

      <form method="POST" action="/api/unlock" className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="from" value={from} />
        <input
          type="password"
          name="passcode"
          autoFocus
          required
          placeholder="Passcode"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus-visible:border-accent"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Continue
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red bg-red-tint px-4 py-3 text-sm text-red">
          That passcode isn't right - try again.
        </p>
      )}
    </main>
  );
}
