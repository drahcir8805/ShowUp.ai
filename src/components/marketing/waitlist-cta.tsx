import { WaitlistForm } from "./waitlist-form";

export function WaitlistCta() {
  return (
    <section
      id="waitlist"
      className="scroll-mt-24 border-t border-[var(--landing-line)] bg-[var(--landing-band)] px-6 py-24"
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--landing-border)]/45 bg-gradient-to-b from-[var(--landing-card)] to-[var(--landing-base)] px-8 py-16 text-center shadow-[0_4px_24px_rgba(62,56,40,0.05)] ring-1 ring-[var(--landing-border)]/28 sm:px-12">
        <h2 className="text-3xl font-semibold tracking-tight text-[#4a4a4a] sm:text-4xl">
          Be first on campus.
        </h2>
        <p className="mt-4 text-[#6a6a6a]">
          We’re onboarding a small set of schools and friend groups. Drop your
          email — we’ll reach out when your market is ready to open.
        </p>
        <WaitlistForm />
        <p className="mt-6 text-xs text-[#6a6a6a]/80">
          No spam. Unsubscribe anytime. Product still in development.
        </p>
      </div>
    </section>
  );
}
