"use client";

import { FormEvent, useState } from "react";

const CONTACT_EMAIL = "hello@showup.ai";

export function WaitlistForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    const body = encodeURIComponent(
      `Please add me to the ShowUp.ai waitlist.\n\nEmail: ${String(email)}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("ShowUp waitlist")}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
        onSubmit={onSubmit}
      >
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@university.edu"
          autoComplete="email"
          className="h-12 flex-1 rounded-full border border-[var(--landing-border)]/55 bg-[var(--landing-base)] px-5 text-sm text-[#4a4a4a] placeholder:text-[#6a6a6a]/70 outline-none ring-[var(--yellow)]/25 transition-[border-color,box-shadow] focus:border-[var(--accent)]/40 focus:ring-2"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-full bg-[var(--yellow)] px-8 text-sm font-semibold text-[#292524] shadow-sm transition-[filter] hover:brightness-95"
        >
          Join waitlist
        </button>
      </form>
      {sent ? (
        <p className="mt-3 text-center text-xs text-[#6a6a6a]">
          If your mail app did not open, email {CONTACT_EMAIL} directly.
        </p>
      ) : null}
    </div>
  );
}
