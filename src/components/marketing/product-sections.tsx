export function WhyMarketsSection() {
  return (
    <section
      id="why"
      className="scroll-mt-24 border-t border-[#d4cfba]/70 px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-[#6a6a6a]">
          Why ShowUp exists
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold tracking-tight text-[#4a4a4a] sm:text-4xl">
          Turn “I’ll go tomorrow” into a market with a price on it.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-[#6a6a6a]">
          Most attendance apps nag you. ShowUp lets you and your friends bet on
          real behavior — so skipping has a cost, and showing up pays off. It’s
          Polymarket energy for the lecture hall: odds shift as your track record
          updates, not as you update your story.
        </p>
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#d4cfba]/90 bg-[#ebe8d5] p-8 shadow-[0_4px_20px_rgba(62,56,40,0.06)] ring-1 ring-[#c9c2a8]/40">
            <h3 className="text-lg font-semibold text-[#4a4a4a]">
              Skin in the game
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6a6a6a]">
              You commit stakes for the term — play-money credits or small real
              amounts you choose. When you ghost class, the market takes its
              cut; when you lock in, you prove the doubters wrong.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d4cfba]/90 bg-[#ebe8d5] p-8 shadow-[0_4px_20px_rgba(62,56,40,0.06)] ring-1 ring-[#c9c2a8]/40">
            <h3 className="text-lg font-semibold text-[#4a4a4a]">
              Social accountability
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6a6a6a]">
              Run markets solo or with your crew. Friends can trade on whether
              you’ll show — which sounds brutal until it’s the reason you
              actually go. Reputation becomes visible, not just a group chat
              promise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const highlights = [
  {
    title: "Semester-long lines",
    body: "Set recurring class windows and stakes once; we track outcomes across the term so one-off excuses don’t reset the board.",
  },
  {
    title: "Location-backed check-ins",
    body: "Tie attendance to places and times you define — so resolutions reflect whether you were really there, not whether you said you were.",
  },
  {
    title: "Markets, not guilt trips",
    body: "Buy and sell side bets with friends on attendance outcomes — prices move as people’s streaks and slip-ups become public knowledge.",
  },
];

export function ProductHighlightsSection() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-[#d4cfba]/70 bg-[#ebe8d5]/35 px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-[#6a6a6a]">
          What you’re building toward
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight text-[#4a4a4a] sm:text-4xl">
          Everything on one campus-sized product surface.
        </h2>
        <ul className="mt-14 grid gap-6 sm:grid-cols-3">
          {highlights.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-[#d4cfba]/90 bg-[#f5f5dc] p-6 shadow-[0_4px_16px_rgba(62,56,40,0.05)] ring-1 ring-[#c9c2a8]/35"
            >
              <h3 className="text-lg font-semibold text-[#4a4a4a]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6a6a6a]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const trustPoints = [
  {
    title: "Clear resolution rules",
    body: "Every market spells out what counts as “showed up,” when it settles, and what data we use — before anyone puts stakes down.",
  },
  {
    title: "Built for real campuses",
    body: "Schedules, buildings, and weird section times are first-class — not an afterthought on top of a generic habit app.",
  },
  {
    title: "You stay in control",
    body: "You choose what to stake, which classes to track, and who can see your markets. We’re building for opt-in accountability.",
  },
];

export function TrustResolutionSection() {
  return (
    <section id="trust" className="scroll-mt-24 border-t border-[#d4cfba]/70 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-[#6a6a6a]">
          Trust & fairness
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight text-[#4a4a4a] sm:text-4xl">
          Markets only work if everyone knows how they end.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-[#6a6a6a]">
          ShowUp is designed so outcomes are explainable: your bets resolve from
          check-ins and rules you can read in plain English — not a black box
          score or a roommate’s opinion.
        </p>
        <ul className="mt-12 space-y-4">
          {trustPoints.map((item) => (
            <li
              key={item.title}
              className="flex gap-4 rounded-2xl border border-[#d4cfba]/80 bg-[#ebe8d5]/80 px-5 py-4 shadow-sm ring-1 ring-[#c9c2a8]/30"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-xs font-bold text-[#292524]"
                aria-hidden
              >
                ✓
              </span>
              <div>
                <h3 className="font-semibold text-[#4a4a4a]">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
