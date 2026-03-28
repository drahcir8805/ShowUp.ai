import Link from "next/link";

const nav = [
  { href: "#why", label: "Why" },
  { href: "#features", label: "Product" },
  { href: "#trust", label: "Trust" },
  { href: "#how", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--landing-line)] bg-[color-mix(in_srgb,var(--landing-base)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[#4a4a4a]"
        >
          ShowUp<span className="text-[var(--accent)]">.ai</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#6a6a6a] sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/betting"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start Betting
          </Link>
        </div>
      </div>
    </header>
  );
}
