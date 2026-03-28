const items = [
  {
    title: "Markets that match your semester",
    body: "Create or join pools around lectures, labs, and study blocks — with clear resolution rules so there’s no drama when the bell rings.",
  },
  {
    title: "Skin in the game",
    body: "Lightweight stakes (points or play-money style credits) keep incentives honest. Skip too often and the market prices you in.",
  },
  {
    title: "Proof, not promises",
    body: "Designed for check-ins you can verify: geo, QR, or partner campus flows. We’re building for trust at scale, not honor-system chaos.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 border-t border-white/10 bg-black/20 px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
          Why ShowUp
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Accountability, but make it a market.
        </p>
        <ul className="mt-16 grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/15"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
