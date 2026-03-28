import Link from "next/link";

const nav = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050508]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white"
        >
          ShowUp<span className="text-[var(--accent)]">.ai</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="#waitlist"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#050508] transition-opacity hover:opacity-90"
          >
            Join waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
