import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-28 sm:pt-28 sm:pb-36">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute -top-32 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent-glow),transparent_65%)] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
          Prediction markets for campus life
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
          The Polymarket for people who skip class —{" "}
          <span className="text-[var(--accent)]">stay locked in.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          Stake on whether you (or your crew) actually show up. Odds move with
          reputation, streaks, and real outcomes — not vibes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="#waitlist"
            className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-semibold text-[#050508] transition-opacity hover:opacity-90"
          >
            Get early access
          </Link>
          <Link
            href="#how"
            className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
