import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-zinc-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} ShowUp.ai — prediction markets for
          showing up.
        </p>
        <div className="flex gap-6">
          <Link href="#features" className="hover:text-zinc-300">
            Features
          </Link>
          <Link href="#how" className="hover:text-zinc-300">
            How it works
          </Link>
          <Link href="#waitlist" className="hover:text-zinc-300">
            Waitlist
          </Link>
        </div>
      </div>
    </footer>
  );
}
