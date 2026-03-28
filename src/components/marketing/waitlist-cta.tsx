import { WaitlistForm } from "./waitlist-form";

export function WaitlistCta() {
  return (
    <section
      id="waitlist"
      className="scroll-mt-24 border-t border-white/10 px-6 py-24"
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-8 py-16 text-center sm:px-12">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Be first on campus.
        </h2>
        <p className="mt-4 text-zinc-400">
          We’re onboarding a small set of schools and friend groups. Drop your
          email — we’ll reach out when your market is ready to open.
        </p>
        <WaitlistForm />
        <p className="mt-6 text-xs text-zinc-600">
          No spam. Unsubscribe anytime. Product still in development.
        </p>
      </div>
    </section>
  );
}
