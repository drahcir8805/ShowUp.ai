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
    <section id="how" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
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
              className="relative rounded-2xl border border-[#d4cfba]/90 bg-[#ebe8d5] p-6 shadow-[0_4px_20px_rgba(62,56,40,0.08),0_2px_6px_rgba(62,56,40,0.05)] ring-1 ring-[#c9c2a8]/40"
            >
              <span className="inline-flex min-h-[2rem] min-w-[2.75rem] items-center justify-center rounded-lg border border-[#c9c2a8]/50 bg-[#ddd8c4] font-mono text-sm font-semibold text-[var(--accent)] shadow-inner shadow-[#a3987a]/15">
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
