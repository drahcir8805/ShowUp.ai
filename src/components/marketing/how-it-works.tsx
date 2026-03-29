import { FlickeringSectionOverlays } from "@/components/marketing/flickering-section-overlays";
import {
  FlickeringGrid,
  SHOWUP_FLICKER_GRADIENT,
} from "@/components/ui/flickering-grid";
import { Safari } from "@/components/ui/safari-browser";

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
      className="relative scroll-mt-24 overflow-hidden border-t border-[var(--landing-line)] bg-[var(--landing-base)] px-6 py-16 md:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
      >
        <FlickeringGrid
          squareSize={3}
          gridGap={5}
          flickerChance={0.35}
          gradientColors={SHOWUP_FLICKER_GRADIENT}
          maxOpacity={0.2}
          className="h-full min-h-[320px] w-full"
        />
      </div>
      <FlickeringSectionOverlays />
      <div className="relative z-10 mx-auto max-w-7xl">
        {/*
          Desktop: Safari preview sits under step 01 with its block nudged up (negative margin) so it reads closer
          to the vertical middle of the first card; gaps between cards 02/03 are margin on those steps. Intro has mb.
          Mobile: header → cards → preview.
        */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_min(720px,56%)] lg:gap-x-20 lg:gap-y-0 lg:items-start">
          <div className="min-w-0 lg:col-start-1 lg:mb-6 lg:row-start-1">
            <h2 className="text-left text-sm font-medium uppercase tracking-widest text-[#6a6a6a]">
              How it works
            </h2>
            <p className="mt-3 max-w-2xl text-left text-3xl font-semibold tracking-tight text-[#4a4a4a] sm:text-4xl">
              Three steps from idea to settled market.
            </p>
          </div>
          {/* Empty top-right on lg — keeps preview from sitting beside the intro */}
          <div
            className="hidden lg:col-start-2 lg:row-start-1 lg:block"
            aria-hidden
          />

          <ol className="contents list-none">
            {steps.map((s, i) => (
              <li
                key={s.step}
                className={`relative max-w-2xl rounded-2xl border border-[var(--landing-border)]/45 bg-[var(--landing-card)] p-6 shadow-[0_4px_20px_rgba(62,56,40,0.06),0_2px_6px_rgba(62,56,40,0.04)] ring-1 ring-[var(--landing-border)]/25 lg:col-start-1 ${
                  i === 0
                    ? "lg:row-start-2"
                    : i === 1
                      ? "lg:mt-6 lg:row-start-3"
                      : "lg:mt-6 lg:row-start-4"
                } `}
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

          {/* Right column beside step 01 only: empty so the browser mock sits below the first box */}
          <div
            className="hidden lg:col-start-2 lg:row-start-2 lg:block"
            aria-hidden
          />

          <aside className="flex w-full flex-col items-center text-black lg:-mt-16 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-3 lg:row-span-2 lg:h-min lg:justify-start lg:self-start">
            <Safari
              src="/MacbookScroll.png"
              url="showup.ai"
              width={820}
              height={514}
              className="h-auto w-full max-w-[min(100%,820px)] shrink-0 drop-shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
              aria-label="ShowUp dashboard in Safari"
            />
            <p className="mt-5 w-full max-w-[820px] text-center text-sm text-[#6a6a6a]">
              Dashboard preview
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
