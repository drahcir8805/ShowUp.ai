"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavItems,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Why", link: "/#why" },
  { name: "Product", link: "/#features" },
  { name: "Trust", link: "/#trust" },
  { name: "How it works", link: "/#how" },
];

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "relative z-20 flex shrink-0 items-center px-2 py-1 text-lg font-semibold tracking-tight text-[#4a4a4a]",
        className,
      )}
    >
      ShowUp<span className="text-[var(--accent)]">.ai</span>
    </Link>
  );
}

export function SiteHeader({
  minimal,
  backHref,
}: {
  minimal?: boolean;
  /** When set (e.g. minimal dashboard), show a back control — usually home. */
  backHref?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const showBack = backHref != null && backHref !== "";

  const backButton = () =>
    showBack ? (
      <Link
        href={backHref!}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-[#6a6a6a] transition-colors hover:bg-black/[0.04] hover:text-[#4a4a4a]"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Back
      </Link>
    ) : null;

  if (minimal) {
    /* Same frosted beige as landing NavBody after scroll — resizable-navbar NavBody `visible` state */
    return (
      <Navbar className="border-b border-[var(--landing-border)]/30 bg-[color-mix(in_srgb,var(--landing-base)_92%,transparent)] shadow-[0_8px_32px_rgba(62,56,40,0.07),0_2px_8px_rgba(62,56,40,0.04)] backdrop-blur-[10px] dark:bg-[color-mix(in_srgb,var(--landing-base)_92%,transparent)]">
        <NavBody className="relative !min-w-0 !max-w-full !justify-center !bg-transparent">
          {showBack ? (
            <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2 md:left-6">
              {backButton()}
            </div>
          ) : null}
          <Logo />
        </NavBody>
        <MobileNav className="!justify-center !bg-transparent">
          <MobileNavHeader className="relative !flex !w-full !items-center !justify-center">
            {showBack ? (
              <div className="absolute left-0 top-1/2 z-20 -translate-y-1/2 pl-1">
                {backButton()}
              </div>
            ) : null}
            <Logo />
          </MobileNavHeader>
        </MobileNav>
      </Navbar>
    );
  }

  return (
    <Navbar className="bg-transparent">
      <NavBody>
        <Logo />
        <NavItems
          items={navItems}
          itemClassName="text-[#6a6a6a] hover:!text-[var(--accent)]"
          onItemClick={() => {}}
        />
        <div className="relative z-20 flex items-center gap-2">
          <NavbarButton
            as={Link}
            href="/betting"
            className="!border-0 !bg-[var(--accent)] !text-white shadow-none hover:!-translate-y-0 hover:!opacity-90"
          >
            Start Betting
          </NavbarButton>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <Logo />
          <div className="z-50 lg:hidden">
            <MobileNavToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            />
          </div>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          className="border border-[var(--landing-border)]/40 bg-[var(--landing-base)] dark:bg-[var(--landing-base)]"
        >
          {navItems.map((item) => (
            <a
              key={item.link}
              href={item.link}
              className="w-full rounded-md px-2 py-2 text-[#4a4a4a] hover:bg-[var(--landing-warm)]/80"
              onClick={() => setMobileOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <Link
            href="/betting"
            className="w-full rounded-md px-2 py-2 font-semibold text-[var(--accent)] hover:bg-[var(--landing-warm)]/80"
            onClick={() => setMobileOpen(false)}
          >
            Start Betting
          </Link>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
