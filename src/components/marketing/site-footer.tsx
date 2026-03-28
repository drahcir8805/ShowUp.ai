import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d4cfba]/70 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-[#6a6a6a] sm:flex-row">
        <p>
          © {new Date().getFullYear()} ShowUp.ai — prediction markets for
          showing up.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link
            href="#why"
            className="text-[#6a6a6a] transition-colors hover:text-[var(--accent)]"
          >
            Why
          </Link>
          <Link
            href="#features"
            className="text-[#6a6a6a] transition-colors hover:text-[var(--accent)]"
          >
            Product
          </Link>
          <Link
            href="#trust"
            className="text-[#6a6a6a] transition-colors hover:text-[var(--accent)]"
          >
            Trust
          </Link>
          <Link
            href="#how"
            className="text-[#6a6a6a] transition-colors hover:text-[var(--accent)]"
          >
            How it works
          </Link>
          <Link
            href="#waitlist"
            className="text-[#6a6a6a] transition-colors hover:text-[var(--accent)]"
          >
            Waitlist
          </Link>
        </div>
      </div>
    </footer>
  );
}
