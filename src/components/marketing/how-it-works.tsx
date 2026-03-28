import { FlickeringGrid } from "@/components/ui/flickering-grid";

const steps = [
  {
    step: "01",
    title: "Set your line",
    body: "Bet on yourself by putting money into the app. Set your stake for the semester - the more you commit, the more you have to lose (or prove).",
  },
  {
    step: "02",
    title: "Go to class",
    body: "Add your class locations and schedules. The app tracks your location during class time - show up and you're safe, skip class and lose your stake.",
  },
  {
    step: "03",
    title: "Settle the market",
    body: "Location data automatically resolves your bets. Attendance is verified, money is deducted for absences, and your reputation is updated.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative scroll-mt-24 overflow-hidden border-t border-[var(--landing-line)] bg-[var(--landing-base)] px-6 py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
      >
        <FlickeringGrid
          squareSize={3}
          gridGap={5}
          flickerChance={0.35}
          color="rgb(95, 84, 68)"
          maxOpacity={0.2}
          className="h-full min-h-[320px] w-full"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[color-mix(in_srgb,var(--landing-warm)_22%,transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className="text-center text-sm font-medium uppercase tracking-widest text-[#6a6a6a]">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight text-[#4a4a4a] sm:text-4xl">
          Three steps from idea to settled market.
        </p>
        <ol className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.step}
              className="relative rounded-2xl border border-[var(--landing-border)]/45 bg-[var(--landing-card)] p-6 shadow-[0_4px_20px_rgba(62,56,40,0.06),0_2px_6px_rgba(62,56,40,0.04)] ring-1 ring-[var(--landing-border)]/25"
            >
              <span className="inline-flex min-h-[2rem] min-w-[2.75rem] items-center justify-center rounded-lg border border-[var(--landing-border)]/40 bg-[var(--landing-muted)] font-mono text-sm font-semibold text-[var(--accent)] shadow-inner shadow-[#a3987a]/12">
                {s.step}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[#4a4a4a]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6a6a6a]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
