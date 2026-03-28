const steps = [
  {
    step: "01",
    title: "Pick your class or crew",
    body: "Spin up a market for a recurring slot — think “Will Jay make 8 a.m. Macro three weeks in a row?”",
  },
  {
    step: "02",
    title: "Set the line",
    body: "Define odds, deadlines, and how attendance is verified. Everyone sees the same rulebook.",
  },
  {
    step: "03",
    title: "Resolve and climb",
    body: "Outcomes settle from real check-ins. Track streaks, leaderboards, and who’s actually locked in.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-sm font-medium uppercase tracking-widest text-zinc-500">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Three steps from idea to settled market.
        </p>
        <ol className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.step} className="relative">
              <span className="font-mono text-sm text-[var(--accent)]">
                {s.step}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
