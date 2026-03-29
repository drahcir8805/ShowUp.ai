import Link from "next/link";

import { WaveGridBackground } from "@/components/ui/wave-grid";

export function Hero() {
  return (
    <section className="hero-section-dots relative w-full min-h-[100dvh] overflow-hidden">
      {/* Extra soft blooms so glows feel luminous (same as pre–wave-grid hero) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_65%)] opacity-50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_45%_at_90%_40%,color-mix(in_srgb,var(--yellow)_18%,transparent),transparent_60%)] opacity-40 blur-3xl"
        aria-hidden
      />

      <WaveGridBackground
        className="relative z-[2] min-h-[100dvh] w-full"
        transparentBackdrop
        color="#9b59b6"
        gridSize={26}
        waveHeight={56}
        waveSpeed={0.85}
        horizonRatio={0.9}
      >
        <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-start px-6 pb-28 pt-[clamp(3.25rem,11vh,6.5rem)] text-center sm:pb-36 sm:pt-[clamp(5rem,18vh,10rem)]">
          <p className="mb-6 inline-flex items-center rounded-full border border-[var(--landing-border)]/35 bg-[color-mix(in_srgb,var(--landing-warm)_55%,var(--landing-base))] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#6a6a6a]">
            Prediction markets for campus life
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#4a4a4a] sm:text-5xl sm:leading-[1.1]">
            The Polymarket for people who skip class —{" "}
            <span className="text-[var(--accent)]">stay locked in.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#6a6a6a]">
            Stake on whether you (or your crew) actually show up. Odds move with
            reputation, streaks, and real outcomes — not vibes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/betting"
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start Betting
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-[var(--yellow)] px-8 text-sm font-semibold text-[#292524] shadow-sm transition-[filter] hover:brightness-95"
            >
              See how it works
            </Link>
          </div>
        </div>
      </WaveGridBackground>
    </section>
  );
}
