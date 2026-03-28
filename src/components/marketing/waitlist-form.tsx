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
          className="h-12 flex-1 rounded-full border border-white/15 bg-black/40 px-5 text-sm text-white placeholder:text-zinc-600 outline-none ring-[var(--accent)]/50 transition-[border-color,box-shadow] focus:border-[var(--accent)] focus:ring-2"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-full bg-[var(--accent)] px-8 text-sm font-semibold text-[#050508] transition-opacity hover:opacity-90"
        >
          Join waitlist
        </button>
      </form>
      {sent ? (
        <p className="mt-3 text-center text-xs text-zinc-500">
          If your mail app did not open, email {CONTACT_EMAIL} directly.
        </p>
      ) : null}
    </div>
  );
}
